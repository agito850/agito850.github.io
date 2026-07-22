---
title: 分散式鎖入門：從「表單被送簽兩次」聊起，搞懂悲觀鎖、樂觀鎖與 RedLock
published: 2025-05-02
description: "多人同時送簽同一張表單，流程關卡被重複產出——用分散式鎖解決併發問題的實戰筆記，附上樂觀鎖/悲觀鎖比較與 Execute Around Method 封裝技巧。"
tags: [分散式鎖, Redis, RedLock, C#, 併發, 後端]
category: 技術
draft: false
---

## 起因：表單被送簽了兩次

某天收到客服回報：一張表單的簽核流程出現了**兩組完全一樣的關卡**。

正常流程是：使用者按下「送簽」→ 後端產出一組簽核關卡（誰要簽、簽核順序）→ 進入流程。但這張表單不知為何跑了兩次，產出兩組重複的關卡，簽核人收到兩封通知信，整個流程亂掉。

追查之後發現：這位使用者在網路不穩的情況下**連點了兩次送簽按鈕**，兩個 Request 幾乎同時到達後端，各自產出了一組關卡。

這是一個典型的**併發問題**——兩個操作同時進行，而這個操作不允許被執行兩次。

## 最直覺的解法：上鎖

概念很簡單：第一個 Request 進來時「鎖住」這張表單，第二個 Request 發現已經被鎖了，就直接拒絕。

```
Request A ──→ 拿鎖 ✅ ──→ 執行送簽 ──→ 釋鎖
Request B ──→ 拿鎖 ❌ ──→ 回傳「處理中，請稍候」
```

但在分散式系統裡，「上鎖」比你想的複雜。

## 單機鎖 vs 分散式鎖

如果你的 API 只跑在一台機器上，用 C# 內建的 `lock` 或 `SemaphoreSlim` 就夠了：

```csharp
// 單機鎖：只在同一個 Process 內有效
private static readonly SemaphoreSlim _semaphore = new(1, 1);

await _semaphore.WaitAsync(cancellationToken);
try
{
    // 業務邏輯
}
finally
{
    _semaphore.Release();
}
```

但現實中 API 通常是多台部署（多個 Pod / 多個 VM），Request A 打到機器 1、Request B 打到機器 2——**各自的 `lock` 互相不認識**，鎖了等於沒鎖。

這時候需要一個**所有機器都認得的鎖**——分散式鎖。最常見的做法是把鎖存在 Redis 裡。

## Redis 分散式鎖的基本原理

最簡單的 Redis 鎖：

```
拿鎖：SET lock_key unique_value NX EX 30
       ↑ key     ↑ 識別碼      ↑ 不存在才設定  ↑ 30 秒過期

釋鎖：if GET lock_key == unique_value → DEL lock_key
       ↑ 確認是自己的鎖才刪，避免誤刪別人的鎖
```

- **NX（Not eXists）**：只有 key 不存在時才能設定成功 → 搶鎖的原子性
- **EX（Expire）**：設定過期時間 → 避免持有者掛掉後鎖永遠不釋放（deadlock）
- **unique_value**：每次拿鎖產生一個唯一值 → 釋鎖時確認是自己的鎖

## RedLock：更可靠的分散式鎖

簡單的 Redis 鎖有個問題：如果 Redis 只有一台，它掛了就完了。RedLock 是 Redis 作者 Antirez 提出的演算法，用**多個獨立的 Redis 節點**提高可靠性：

1. 向 N 個 Redis 節點同時嘗試拿鎖
2. 如果在超過半數（N/2 + 1）的節點上成功拿到鎖 → 鎖定成功
3. 如果沒拿到多數 → 釋放所有已拿到的鎖，拿鎖失敗

在 .NET 生態中，[RedLock.net](https://github.com/samcook/RedLock.net) 是最常用的實作：

```csharp
// 底層：RedLock.net 搭配 StackExchange.Redis
using var redLockFactory = RedLockFactory.Create(
    new List<RedLockMultiplexer> { new(multiplexer) });

await using var redLock = await redLockFactory.CreateLockAsync(
    resource: "lock_key",
    expiryTime: TimeSpan.FromSeconds(30));

if (redLock.IsAcquired)
{
    // 拿到鎖，執行業務邏輯
}
else
{
    // 搶鎖失敗，有人正在操作
}
// 離開 using → 自動釋鎖
```

## 封裝：Execute Around Method

直接用 RedLock API 沒問題，但呼叫者要自己管鎖的生命週期：

```csharp
// ❌ 手動管鎖 — 容易忘記釋放、exception 時漏釋放
var redLock = await factory.CreateLockAsync(key, expiry);
if (!redLock.IsAcquired) return Busy();
try
{
    // 業務邏輯
}
finally
{
    await redLock.DisposeAsync();  // 忘記寫就 deadlock
}
```

更好的做法是**把鎖的管理封裝起來，業務邏輯當 callback 傳入**：

```csharp
public async Task<(bool locked, T? result)> RequireLock<T>(
    string lockKey,
    Func<Task<T>> func,          // 搶到鎖後要做的事
    TimeSpan lockExpiry)
{
    await using var redLock = await _factory.CreateLockAsync(lockKey, lockExpiry);

    if (!redLock.IsAcquired)
    {
        _logger.LogWarning("未取得鎖。lockKey={Key}, status={Status}", lockKey, redLock.Status);
        return (false, default);
    }

    return (true, await func.Invoke());
}
```

呼叫端只需要關心業務邏輯：

```csharp
var (locked, result) = await _lockService.RequireLock(
    $"form_submit_{formId}",
    async () =>
    {
        // 只管業務邏輯，不管鎖怎麼拿、怎麼放
        var flow = await CreateFlowAsync(formId, cancellationToken);
        return flow;
    },
    TimeSpan.FromMinutes(2));

if (!locked)
{
    // 搶鎖失敗的處理
    throw new ConflictException("表單正在處理中，請稍候再試");
}
```

這個 pattern 叫 **Execute Around Method**：

- 不可能忘記釋鎖（方法內部 `using` 保證）
- Exception 時也會正確釋放
- 呼叫者不需要知道底層是 Redis RedLock 還是其他實作

跟 C# 的 `using` 是同一個思路——把「一定要做的善後工作」從呼叫者手上拿走。

## 悲觀鎖 vs 樂觀鎖

上面講的 RedLock 是**悲觀鎖（Pessimistic Lock）**的一種。但鎖不只有這一種策略。

### 悲觀鎖：先鎖再做

> 「我假設一定會有人跟我搶，所以先鎖住再說。」

```
Request A ──→ 拿鎖 ✅ ──→ 做事 ──→ 釋鎖
Request B ──→ 拿鎖 ❌ ──→ 等待或拒絕
```

- **優點**：簡單直覺，衝突時不會有髒資料
- **缺點**：有鎖等待的成本，高併發下可能排隊

適用場景：**寫入密集、衝突機率高**。像是送簽（不能重複產關卡）、扣庫存（不能超賣）。

### 樂觀鎖：先做再檢查

> 「我假設通常不會有人跟我搶，所以先做，存檔時再檢查。」

不真的上鎖，而是用**版本號**或**時間戳**做衝突偵測：

```csharp
// Entity 帶版本號
public class Order
{
    public long Id { get; set; }
    public string Status { get; set; }
    public int Version { get; set; }  // 樂觀鎖的關鍵
}

// 更新時檢查版本號
var affected = await _db.ExecuteAsync(@"
    UPDATE Orders 
    SET Status = @NewStatus, Version = Version + 1
    WHERE Id = @Id AND Version = @ExpectedVersion",
    new { Id = orderId, NewStatus = "Approved", ExpectedVersion = currentVersion });

if (affected == 0)
{
    // 版本號不對 → 有人搶先改過了
    throw new ConcurrencyException("資料已被其他人修改，請重新整理後再試");
}
```

流程是這樣的：

```
Request A ──→ 讀取 (Version=1) ──→ 做事 ──→ 寫入 WHERE Version=1 ✅ (Version→2)
Request B ──→ 讀取 (Version=1) ──→ 做事 ──→ 寫入 WHERE Version=1 ❌ (已經是 2 了)
                                                    → 衝突！重試或報錯
```

- **優點**：不用鎖等待，讀取不阻塞，高併發下效能好
- **缺點**：衝突時要重試，衝突率高時重試成本大

適用場景：**讀多寫少、衝突機率低**。像是編輯個人資料、更新設定。

EF Core 內建支援樂觀鎖：

```csharp
// 用 [ConcurrencyCheck] 或 [Timestamp] 標記
public class Order
{
    public long Id { get; set; }

    [Timestamp]
    public byte[] RowVersion { get; set; }  // EF Core 自動檢查
}

// SaveChanges 時如果 RowVersion 不一致
// → 自動拋 DbUpdateConcurrencyException
```

### 比較表

| | 悲觀鎖 | 樂觀鎖 |
|---|---|---|
| 策略 | 先鎖再做 | 先做再檢查 |
| 衝突處理 | 搶不到鎖 → 等待/拒絕 | 版本號不對 → 重試/報錯 |
| 鎖的位置 | Redis / DB Row Lock | DB 版本號欄位 |
| 效能特性 | 有鎖等待成本 | 無鎖等待，但衝突時要重試 |
| 適用場景 | 寫入密集、衝突率高 | 讀多寫少、衝突率低 |
| 典型實作 | RedLock、`SELECT FOR UPDATE` | EF Core `[Timestamp]`、手動 Version 欄位 |

### 怎麼選？

一個簡單的判斷標準：

> **衝突了之後，重試的成本高不高？**

- 重試成本高（送簽要重新跑整個流程）→ **悲觀鎖**，一開始就擋住
- 重試成本低（更新設定，再讀一次就好）→ **樂觀鎖**，衝突再說

兩者也可以組合使用——外層用悲觀鎖擋住明顯的併發（如重複點擊），內層用樂觀鎖做最後一道防線（如版本號檢查）。

## Fencing Token：當鎖過期但持有者還在寫

悲觀鎖有一個邊界情況：**業務邏輯跑太久，鎖的 TTL 先到期了**。

```
Request A ──→ 搶到鎖 ✅ ──→ 業務邏輯跑很久… ──→ 鎖過期了（TTL 到了）
Request B ──→ 鎖已過期 ──→ 合法搶到鎖 ✅ ──→ 開始寫入
Request A ──→ 還在做（以為自己還持有鎖）──→ 也寫入 💀 ──→ 覆蓋 B 的資料
```

注意：**不是兩個人同時搶到鎖**（Redis `SET NX` 是原子操作，不會同時成功），而是 A 的鎖過期後 B 合法拿到了新鎖，但 A 不知道自己的鎖已經沒了。

### 解法：Fencing Token（防護令牌）

Martin Kleppmann 提出的方案——拿鎖時取得一個**遞增的 token**，寫入時帶上 token，儲存端只接受最大 token 的寫入：

```
Request A ──→ 搶到鎖 (token=42) ──→ 跑很久… ──→ 鎖過期
Request B ──→ 搶到鎖 (token=43) ──→ 寫入 (token=43) ✅
Request A ──→ 寫入 (token=42) ──→ Storage 檢查：42 < 43 → 拒絕 ✅
```

```csharp
// 概念程式碼
var (locked, fencingToken) = await AcquireLock(key);  // token = 42

// ... 業務邏輯（可能跑很久）...

// 寫入時帶上 token，DB 端檢查是否為最新
var affected = await _db.ExecuteAsync(@"
    UPDATE Resource SET Data = @Data
    WHERE Id = @Id AND FencingToken <= @Token",
    new { Id = resourceId, Data = newData, Token = fencingToken });
```

### 什麼時候需要 Fencing Token？

**共用資源 + 多個寫入者 + 長時間操作**。例如分散式檔案系統中，多個 Worker 輪流處理同一個檔案，操作時間可能超過 TTL。

### 什麼時候不需要？

大多數業務場景都不需要。以表單送簽為例：

- 鎖的粒度是 **per 表單**（per `formObjId`），不存在多人「合法輪流寫同一筆資料」的需求
- 同一張表單被送簽兩次本身就該被擋掉，不是「比誰的 token 大」的問題
- TTL 設為預期時間的 3~5 倍（例如 2 分鐘），過期問題幾乎不會發生

> **實務上大多數場景不需要 Fencing Token，RedLock + 合理 TTL 就足夠。** Fencing Token 是學術上的完備性補充，在金融級或分散式儲存等極端場景才需要。

## 多層鎖的設計

實務中，一個操作可能需要**多層不同粒度的鎖**：

```
使用者按下送簽
    │
    ├── 第 1 層：應用層鎖（Redis 簡單鎖）
    │   目的：防重複點擊（同一使用者短時間內不能按第二次）
    │   Key：form_submit_{appCode}_{tenantCode}_{formId}
    │   TTL：60 秒
    │
    ├── 第 2 層：流程層鎖（RedLock 分散式鎖）
    │   目的：防併發產關卡（同一表單不能同時產兩組流程）
    │   Key：flow_submit_{formId}
    │   TTL：2 分鐘
    │
    └── 第 3 層：儲存層鎖（RedLock 分散式鎖）
        目的：防資料寫入衝突（MongoDB 寫入保護）
        Key：save_form_{formId}_{timestamp}
        TTL：5 秒
```

每一層解決不同的問題：
- **應用層**：擋住最明顯的重複操作，用最簡單的 Redis SET 就夠
- **流程層**：保護核心業務邏輯的正確性，需要 RedLock 的可靠性
- **儲存層**：保護資料一致性，粒度最細、TTL 最短

## 鎖的 TTL 怎麼設？

TTL（Time to Live）是鎖的自動過期時間。設太短，業務邏輯還沒跑完鎖就過期了（等於沒鎖）；設太長，持有者掛了之後其他人要等很久。

經驗法則：

> **TTL = 預期執行時間的 3~5 倍**

- 業務邏輯平均 5 秒 → TTL 設 15~25 秒
- 業務邏輯平均 30 秒 → TTL 設 2 分鐘
- 不確定 → 先設長一點（寧可等久也不要鎖提前過期），再根據監控數據調整

## 搶鎖失敗怎麼辦？

搶鎖失敗有兩種原因，處理方式不同：

**1. 真正的併發衝突（有人正在操作）**

```csharp
if (!locked)
    return Conflict("表單正在處理中，請稍候再試");
```

正常情況，告知使用者稍後重試即可。

**2. 基礎設施問題（Redis 連線瞬斷）**

這個比較棘手——不是真的有人在搶，是 Redis 連不上所以拿不到鎖。如果直接拒絕，使用者的操作就掉了。

一種策略是**區分路徑**：

- **同步路徑**（使用者正在等）：外層已有簡單鎖保護，跳過 RedLock 直接執行，降低掉單風險
- **異步路徑**（背景 Job）：沒有外層保護，必須搶 RedLock，失敗就先停下，等維運介入重跑

```csharp
if (isSyncPath)
{
    // 同步路徑：外層有簡單鎖保護，跳過 RedLock 直接做
    return await ExecuteBusinessLogic();
}
else
{
    // 異步路徑：必須搶鎖，失敗就拋錯
    var (locked, result) = await RequireLock(key, func, expiry);
    if (!locked)
        throw new ConflictException("搶鎖失敗，待維運重跑");
    return result;
}
```

## 這件事教會我的

> **鎖不是越多越好，而是每一層鎖都要有明確的「我在保護什麼」。**

應用層鎖保護使用者體驗（防重複點擊）、流程層鎖保護業務正確性（防重複產關卡）、儲存層鎖保護資料一致性（防寫入衝突）。搞清楚每把鎖的職責，才不會過度上鎖拖慢效能，也不會漏鎖導致資料錯亂。

另一個重要的學習是：**不要只想著「鎖成功」的路徑，更要想清楚「鎖失敗」怎麼辦**。是重試？是拒絕？還是降級執行？這個決策往往比「要不要上鎖」更關鍵。

---

## 參考資料

- [Redis — Distributed Locks with Redis（Antirez 原文）](https://redis.io/docs/manual/patterns/distributed-locks/)：RedLock 演算法的設計動機與實作細節。
- [RedLock.net — GitHub](https://github.com/samcook/RedLock.net)：.NET 生態最常用的 RedLock 實作，基於 StackExchange.Redis。
- [Martin Kleppmann — How to do distributed locking](https://martin.kleppmann.com/2016/02/08/how-to-do-distributed-locking.html)：對 RedLock 演算法的經典批評文章，提出 Fencing Token 的替代方案。
- [Microsoft — Handling concurrency conflicts (EF Core)](https://learn.microsoft.com/en-us/ef/core/saving/concurrency)：EF Core 的樂觀鎖實作，使用 `[Timestamp]` 或 `[ConcurrencyCheck]`。
- [Microsoft — `SemaphoreSlim`](https://learn.microsoft.com/en-us/dotnet/api/system.threading.semaphoreslim)：單機環境下的輕量級非同步鎖。
