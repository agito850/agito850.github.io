---
title: 每個 Request 都在清空快取，為什麼只有重開機才出事？
published: 2026-08-19
description: "多租戶連線路由的三層追查：一行有註解的 fallback、一個被 Scoped 建構子清空的 static 快取，以及一層剛好把災情遮住、也把它藏了很久的 Singleton。"
tags: [多租戶, C#, DI, 快取, 踩坑]
category: 技術
draft: false
---

## 事發現場

在本機測試時，我遇到一個很煩的現象：**每次啟動專案後，打 API 很容易出現「找不到人員」。**

```json
POST /api/form/Submit          → 404 Not Found  (10.47 s)

{
  "status": 0,
  "error": {
    "code": "120",
    "languages": { "zh-TW": "找不到人員(83188563-****-****-****-********945f)" },
    "details": { "type": "ErrorCodeException", "detail": "EmployeeNotFound" }
  }
}
```

重打幾次，就好了。

一開始我把它歸類成「本機環境的怪毛病」——快取沒暖、重開就好，這種事每個專案都有幾件。直到我想到一個問題：

> **那 Production 呢？每次部署完，不也是一次「啟動」嗎？**

先記住那個 **10.47 秒**。它到最後才會派上用場，但它從第一秒就在現場了。

## 線索：它挑租戶

最有用的一條線索是：**只有某幾個租戶會中**——資料放在專屬資料庫的那群。

如果是業務邏輯寫錯，不該挑租戶。當「壞的集合」和「好的集合」能沿**租戶維度**切出一條線，答案通常不在業務邏輯裡，而在**連線**——這支 Request 到底連到了哪一個資料庫？

答案是：**它連到了共用的 SharedDB，而不是該租戶專屬的那一個。**

那張表裡當然沒有這個人。所以「找不到人員」。

## 第一層：一行有註解的 fallback

追進 `TenantConfigManager`，取得租戶連線字串有**兩個方法**——一個同步、一個非同步。同步版長這樣：

```csharp
public string GetTenantConnectionStringSync(long tenantId)
{
    if (tenantId == 0)
        return _connectionStringSettings.SharedDBConnection;

    // ① 優先從 TenantDbManager 取得（這是快取的資料）
    if (_tenantDbManager.ExistTenantDbInfo(tenantId))
    {
        var tenantDbInfo = _tenantDbManager.GetTenantDatabaseInfo(tenantId);
        if (!string.IsNullOrEmpty(tenantDbInfo.ApiConnectionString))
            return tenantDbInfo.ApiConnectionString;
    }

    // ② 從記憶體快取取得
    if (_inMemoryCachedConnectionStringConfigs.TryGetValue(tenantId, out var connString)
        && !string.IsNullOrEmpty(connString))
    {
        return connString;
    }

    // ③ 若快取未載入，回傳共用連線字串（避免在 DbContext 中進行非同步 IO）
    //    這種情況通常發生在系統啟動初期，租戶配置尚未完全載入
    return _connectionStringSettings.SharedDBConnection;   // 💀 就是這裡
}
```

看 ③ 那三行。

**這個 bug 是被註解好好寫下來的。**

寫下這段的人完全知道「系統啟動初期、租戶配置尚未載入」這個情境會發生，也知道自己在做什麼取捨——他不想在 `DbContext` 裡做非同步 I/O，所以選了一個「至少連得上」的預設值。

這不是疏忽，是一個**在當下看起來很合理的決定**。

對照同一個類別裡的非同步版本，處理方式完全不同：

```csharp
public async Task<string> GetTenantConnectionStringAsync(long tenantId)
{
    if (tenantId == 0) return _connectionStringSettings.SharedDBConnection;

    // 快取沒有 → 去撈（同步版做不到這件事）
    if (!_loadedTime.HasValue || !_inMemoryCachedConnectionStringConfigs.ContainsKey(tenantId))
        await Reload(tenantId);

    if (_tenantDbManager.ExistTenantDbInfo(tenantId))
    {
        var tenantDbInfo = _tenantDbManager.GetTenantDatabaseInfo(tenantId);

        // 撈到了但值不對 → 直接爆（同步版是安靜地 fallback）
        if (string.IsNullOrEmpty(tenantDbInfo.ApiConnectionString))
            throw new Exception("Invalid ApiConn");

        return tenantDbInfo.ApiConnectionString;
    }
    // ...
}
```

| | 快取命中 | **快取 miss** | 值不合法 |
|---|---|---|---|
| **同步版** | 回傳正確連線 | **靜默 fallback 到 SharedDB** 💀 | 靜默 fallback |
| **非同步版** | 回傳正確連線 | `await Reload()` 去撈 ✅ | `throw` ✅ |

為什麼會有一條「只讀快取」的路徑？不是誰偷懶，是 **`DbContext.OnConfiguring` 沒辦法 `await`**。連線字串要在 `OnConfiguring` 裡取得時，你手上沒有能等待的上下文；同步版不能做 I/O，只好「查快取，查不到就給個預設值」。

> **`OnConfiguring` 是 sync → 無法呼叫 async Reload → 只能讀快取 → 快取空就 fallback 拿錯 DB。**

到這裡故事很完整：**冷啟動時快取還沒暖，所以拿錯 DB。** 我本來以為結案了。

## 第二層：`static` 欄位，配上 `Scoped` 生命週期

繼續看下去，發現了一件更奇怪的事。

欄位宣告：

```csharp
private static DateTimeOffset? _loadedTime = null;
private static ConcurrentDictionary<long, TenantConfigurationGroup> _inMemoryCachedConfigs;
private static ConcurrentDictionary<long, string> _inMemoryCachedConnectionStringConfigs;
private static ConcurrentDictionary<long, string> _inMemoryCachedTenantNameConfigs;
```

全是 `static`——**設計意圖很明確：這份快取要跨所有 Request 共用。**

建構子：

```csharp
public TenantConfigManager(/* ... */)
{
    // ...
    _inMemoryCachedConfigs = new ConcurrentDictionary<long, TenantConfigurationGroup>();
    _inMemoryCachedConnectionStringConfigs = new ConcurrentDictionary<long, string>();
    _inMemoryCachedTenantNameConfigs = new ConcurrentDictionary<long, string>();
}
```

DI 註冊——**在另一個檔案裡**：

```csharp
services.AddScoped<ITenantConfigManager, TenantConfigManager>();
```

三個資訊拼起來：

> **`TenantConfigManager` 是 Scoped——每個 Request new 一次。而建構子用 `=` 無條件覆蓋 static 欄位。所以每一個進來的 Request，都在把全體租戶已經填好的快取整個清空。**

三個資訊分散在三個地方，而且**每一個單獨看都沒有問題**：

| 位置 | 內容 | 單獨看 |
|---|---|---|
| 類別頂端 | 欄位是 `static` | ✅ 合理，就是要跨 Request 共用 |
| 建構子 | `= new ConcurrentDictionary()` | ✅ 合理，初始化欄位是基本功 |
| `DependencyInjection.cs` | `AddScoped<...>()` | ✅ 合理，服務預設就是 Scoped |

錯的是**它們湊在一起的語意**：`static` 說「我要活很久」，`Scoped` 說「我每個 Request 重生一次」，而建構子那個 `=` 讓後者贏了。

修復是三個字元：

```diff
- _inMemoryCachedConfigs = new ConcurrentDictionary<long, TenantConfigurationGroup>();
- _inMemoryCachedConnectionStringConfigs = new ConcurrentDictionary<long, string>();
- _inMemoryCachedTenantNameConfigs = new ConcurrentDictionary<long, string>();
+ _inMemoryCachedConfigs ??= new ConcurrentDictionary<long, TenantConfigurationGroup>();
+ _inMemoryCachedConnectionStringConfigs ??= new ConcurrentDictionary<long, string>();
+ _inMemoryCachedTenantNameConfigs ??= new ConcurrentDictionary<long, string>();
```

`=` 改成 `??=`。**「沒有才建立」，而不是「每次都建立」。**

## 等一下——那為什麼不是每個 Request 都出錯？

找到這個之後，我很得意地宣布「根因找到了」。然後被問了一個問題，當場答不出來：

> **如果每個 Request 都在把快取清空，那 Production 應該每次都拿錯 DB 才對。為什麼只有剛上版、機器重啟的時候會踩到？**

這個問題是對的。而我的「根因」解釋不了它。

回去把 `GetTenantConnectionStringSync` 再讀一次，答案就在第一行——**快取不只一層**：

```csharp
// ① TenantDatabaseManager
if (_tenantDbManager.ExistTenantDbInfo(tenantId)) { /* return */ }

// ② _inMemoryCachedConnectionStringConfigs（static，被建構子清空的是這個）
if (_inMemoryCachedConnectionStringConfigs.TryGetValue(tenantId, out var connString)) { /* return */ }

// ③ fallback SharedDB
```

而 `TenantDatabaseManager` 是一個**貨真價實的 Singleton**：

```csharp
public class TenantDatabaseManager
{
    private readonly ConcurrentDictionary<long, Lazy<TenantDatabaseInfo>> _tenantBPMDatabaseCache;

    private static readonly Lazy<TenantDatabaseManager> _instance =
        new Lazy<TenantDatabaseManager>(() => new TenantDatabaseManager());

    private TenantDatabaseManager()   // ← private，外面 new 不出來
    {
        _tenantBPMDatabaseCache = new ConcurrentDictionary<long, Lazy<TenantDatabaseInfo>>();
    }

    public static TenantDatabaseManager Instance => _instance.Value;
}
```

```csharp
services.AddSingleton<TenantDatabaseManager>(_ => TenantDatabaseManager.Instance);
```

它的字典**整個 process 只建一次**。`TenantConfigManager` 是 Scoped、每個 Request new 幾次，跟它一點關係都沒有。

於是真相是：

```
每個 Request：
  new TenantConfigManager()  →  清空 ②   ← 你的災難
                                          ↓
  走 sync 路徑 → 查 ①（Singleton，好好的）→ 命中，回傳正確連線 ✅
                                          ↑
                            根本沒走到 ②，所以你看不到災難
```

**② 確實每個 Request 都被清空。但 sync 路徑在 ① 就命中了，根本走不到 ②。**

那一層 Singleton，像一塊擋在前面的板子，把災情整個遮住了。

### 所以真正的失敗窗口是什麼

不是「② 被清空」，是「**① 也是空的**」。而 ① 只有兩種情況會空：

1. **App 剛啟動 / scale 出新 instance**——`Lazy<T>` 剛建好，字典裡什麼都沒有。
2. **有人呼叫 `ReloadAll()`**——它會 `_tenantDbManager.ClearTenantCache()`，把 ① 整個 `Clear()` 再重填，中間有一段空窗。

第 1 點，就是「只有剛上版才踩到」的答案。

## 那 `??=` 到底修了什麼？

既然正確性是被 ① 保住的，那 `??=` 這三個字元不就白改了？

不是。它修的是**另一種病**——回頭看非同步版的觸發條件：

```csharp
if (!_loadedTime.HasValue || !_inMemoryCachedConnectionStringConfigs.ContainsKey(tenantId))
    await Reload(tenantId);
```

`_loadedTime` 是**宣告處**的 static 初始化（`= null`），不在建構子裡，所以它活得好好的 → `HasValue` 是 `true`。

但 `_inMemoryCachedConnectionStringConfigs` 每個 Request 被清空 → `ContainsKey(tenantId)` **永遠是 false**。

> **於是每一個走非同步路徑的 Request，都會觸發一次完整的 `Reload(tenantId)`。**

而 `Reload` 做的事情包括：查 `Tenants`、查 `TenantDBMappings`，然後——

```csharp
var (apiTestResult, apiTestErr) = await MakeConnectionTesting(connectionString);
```

**真的去開一條連線做測試。** 每一個 Request。

還記得開頭那個 **10.47 秒**嗎。

所以三個 commit 各治各的病，不是同一個根因的三種寫法：

| 修法 | 實際治的是 |
|---|---|
| `=` → `??=` | 每 Request 一次的 Reload 風暴（含連線測試）→ **效能** |
| WarmUp Middleware | 冷啟動時 ① 是空的 → **正確性** |
| fallback + Warning log | 降級時留下痕跡 → **可觀測性** |

這一段是我在這次除錯裡學到最多的地方：**一個「明顯是根因」的發現，如果解釋不了災情的分佈（為什麼只有重開機、為什麼只有某些租戶），那它多半只是共犯，不是主謀。** 分佈永遠比程式碼更早告訴你答案。

## 修法：三層防禦

### 1. 加暖機 Middleware（修正確性）

Middleware 有 async 上下文，可以呼叫那條**會回填**的路徑，確保 Request 進 Controller 前 ① 已經有資料：

```csharp
/// <summary>
/// 確保每個 Request 進入 Controller 前，該 tenant 的 DB 連線資訊已在快取中。
/// 解決 EF Core OnConfiguring (sync) 無法呼叫 async Reload 的問題。
/// </summary>
public class TenantConfigWarmUpMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<TenantConfigWarmUpMiddleware> _logger;

    public TenantConfigWarmUpMiddleware(
        RequestDelegate next, ILogger<TenantConfigWarmUpMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(
        HttpContext context,
        ITenantConfigManager tenantConfigManager,
        TenantDatabaseManager tenantDbManager)
    {
        var tenantIdClaim = context.User?.FindFirstValue("TenantId");
        if (long.TryParse(tenantIdClaim, out var tenantId) && tenantId > 0)
        {
            if (!tenantDbManager.ExistTenantDbInfo(tenantId))
            {
                try
                {
                    await tenantConfigManager.GetTenantConnectionStringAsync(tenantId);
                    _logger.LogInformation("Tenant {TenantId} DB 連線快取已預暖", tenantId);
                }
                catch (Exception ex)
                {
                    // 預暖失敗不能中斷整條 pipeline——記 Warning，讓後續流程自己去面對
                    _logger.LogWarning(ex,
                        "Tenant {TenantId} DB 連線快取預暖失敗，後續 sync 路徑可能無法取得正確連線",
                        tenantId);
                }
            }
        }

        await _next(context);
    }
}
```

那個 `try-catch` 是後來補的。**暖機是「最佳化」，不是「必要條件」**——如果暖機失敗就讓整個 Request 掛掉，等於把一個防禦措施變成新的單點故障。

註冊在 `UseAuthorization()` 之後（否則拿不到 `TenantId` claim）、`MapControllers()` 之前：

```csharp
app.UseSession();
app.UseRateLimiter();
app.UseAuthorization();
app.UseMiddleware<TenantConfigWarmUpMiddleware>();   // ← 加這行
app.MapControllers();
```

### 2. `=` → `??=`（修效能）

如上。讓 static 快取真的能跨 Request 活著，止住每 Request 一次的 Reload 風暴。

### 3. 拿掉 silent fallback（修可觀測性）

最後把同步版那三行改掉，快取 miss 就直接報錯：

```csharp
// 快取未命中時明確報錯，避免默默連到錯誤的 SharedDB
// 正常情況下 TenantConfigWarmUpMiddleware 已確保快取有資料，不應走到這裡
throw new InvalidOperationException(
    $"Tenant {tenantId} 的 DB 連線資訊不在快取中。" +
    "請確認 TenantConfigWarmUpMiddleware 已正確註冊於 UseAuthorization 之後、MapControllers 之前。");
```

理由很正當：**拿錯 DB 造成的資料汙染，比一個 500 嚴重得多。**

## 然後，40 分鐘後我把它改回去了

整合測試全紅。

原因是——**整合測試不經過 HTTP pipeline，所以沒有 Middleware 預暖**。那條「不應該走到」的路徑，在測試環境是每次都走。

而且不只如此。翻 DI 註冊才發現，測試環境連生命週期都不一樣：

```csharp
if (isIntegrationTests)
{
    services.AddSingleton<ITenantConfigManager, TenantConfigManager>();   // ← 測試環境
}
else
{
    services.AddScoped<ITenantConfigManager, TenantConfigManager>();      // ← 正式環境
}
```

**整合測試註冊成 `Singleton`，正式環境註冊成 `Scoped`。**

Singleton 只 new 一次，那個「無條件覆蓋 static 欄位」的建構子**只會執行一次**——在測試環境裡，第二層那個問題結構性地不可能發生。不是測試沒寫好，不是覆蓋率不夠，**是測試環境跑的根本不是同一種物件生命週期。**

同一道裂縫（測試環境 ≠ 正式環境）咬了兩次：一次讓測試看不見缺陷，一次讓防禦措施裝不上去。

最終版本是這樣：

```csharp
// 快取未命中：回傳共用連線字串作為 fallback，但記錄警告以利追蹤
// 正常情況下 TenantConfigWarmUpMiddleware 已確保快取有資料，不應走到這裡
// 整合測試環境不經過 HTTP pipeline，會正常命中此路徑
_logService.Warning(
    $"Tenant {tenantId} 的 DB 連線資訊不在快取中，fallback 至 SharedDBConnection。" +
    "若為生產環境，請確認 TenantConfigWarmUpMiddleware 已正確註冊。");

return _connectionStringSettings.SharedDBConnection;
```

看起來像繞了一圈回到原點，但有一個決定性的差別：

| | 修復前 | 修復後 |
|---|---|---|
| 快取 miss 時 | 回傳 SharedDB | 回傳 SharedDB |
| **有沒有留下痕跡** | **沒有** 💀 | **Warning log** ✅ |

**問題從來不是 `fallback`，是 `silent`。**

一個會在 log 裡尖叫的 fallback，跟一個安靜的 fallback，是兩種完全不同的東西。前者是「我知道這裡有風險，我在盯著」；後者是「我假裝這裡沒事」。

這也是我最後接受這個妥協的理由：理想解（throw）需要先把測試架構補起來，那是另一張工單的工作量；在那之前，**先讓它會叫**，已經把最壞情況從「靜默寫錯庫」變成「log 裡查得到」。

至於根治——長期還是要把 `OnConfiguring` 那條同步路徑整個拆掉，全部改走 `IDbContextFactory`，讓所有 DbContext 都在 async 上下文裡建立：

```csharp
services.AddDbContextFactory<SharedDbContext>();
```

代價是所有注入 `DbContext` 的地方都要盤點改寫。排進下個 Sprint。

## 這件事教會我的

**一 · 解釋不了災情分佈的根因，是共犯，不是主謀。**

「每個 Request 都在清空快取」聽起來像是一擊斃命的發現，但它推不出「只有重開機才出事」。真正的主謀藏在它上面那層 Singleton 裡——那層平常擋住了災情，也因此把問題藏了很久。

**在確認根因之前，先讓它解釋兩件事：為什麼是這些人壞，為什麼是這個時候壞。** 分佈對不上，就還沒到底。

**二 · 看到 `fallback`，先問它退到哪裡去。**

退到「空集合」「預設設定」通常無害；退到**另一個租戶的資料庫**，那不是 fallback，那是資料汙染的預備動作。而且——**允許 fallback，但絕不允許 silent**。任何降級路徑都該留下 log。

**三 · `static` 欄位配上非 Singleton 的類別，建構子就是地雷區。**

`static` 說「我要活很久」，`Scoped` 說「我每個 Request 重生」。當這兩件事在同一個類別裡相遇，建構子裡的 `=` 幾乎一定要是 `??=`。而且這種問題的線索天生分散在三個檔案，每個單獨看都合理——**要合起來讀才看得到**。

**四 · 測試環境每一處「為了跑得順」的調整，都是一個結構性盲區。**

DI 生命週期不同、不經過 HTTP pipeline、用 in-memory DB 取代真的 DB……每一項都在關掉一整類缺陷的可見度。值得定期盤點一次：**我的測試環境和正式環境，到底有哪些地方不一樣？那些不一樣的地方，各自藏得住什麼？**

最後一件事：造成這一切的那行 fallback，有註解、有說明、有清楚的取捨理由。它不是被隨手寫下的。

> **有些技術債不是因為沒想清楚才欠的，是想清楚了、覺得划算、然後利息比預期高很多。**

---

## 參考資料

- [Microsoft — .NET 相依性注入的服務生命週期](https://learn.microsoft.com/en-us/dotnet/core/extensions/dependency-injection#service-lifetimes)：Transient / Scoped / Singleton 的差異與常見誤用。
- [Microsoft — DI 使用指引](https://learn.microsoft.com/en-us/dotnet/core/extensions/dependency-injection-guidelines)：包含「避免在服務中使用 static 狀態」與建構子不該做重活的建議。
- [C# — Null 聯合指派運算子 `??=`](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/null-coalescing-operator)：本篇的三字元修復。
- [Microsoft — `Lazy<T>` 與執行緒安全的單例](https://learn.microsoft.com/en-us/dotnet/framework/performance/lazy-initialization)：`Lazy<T>` 實作 Singleton 的標準做法。
- [EF Core — Multi-tenancy](https://learn.microsoft.com/en-us/ef/core/miscellaneous/multitenancy)：官方多租戶實作指引，含連線切換與 DbContext 生命週期注意事項。
- [EF Core — DbContext Factory](https://learn.microsoft.com/en-us/ef/core/dbcontext-configuration/#using-a-dbcontext-factory)：`AddDbContextFactory` 的使用時機與 `CreateDbContextAsync`。
- [Microsoft — ASP.NET Core Middleware](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/middleware/)：Middleware 管線順序與相依性注入的取得方式。
