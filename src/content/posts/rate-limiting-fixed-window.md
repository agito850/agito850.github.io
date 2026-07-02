---
title: 從 0 到 1 實作 Rate Limiter：用 Fixed Window 擋住暴力破解
published: 2026-07-02
description: "API 被猜 Key 瘋狂試打怎麼辦？用 IMemoryCache 實作一個最簡單的固定窗口限流器，附上四種演算法的取捨比較。"
tags: [Rate Limiting, C#, API設計, 資安, 後端]
category: 技術
draft: false
---

## 起因：一支 API 被瘋狂試打

我們有一支取得使用者資料的 API，原本只靠 JWT Token 驗證身分。滲透測試後發現一個風險：使用者的敏感資料可能被暴力列舉——攻擊者拿到合法 Token 後，對不同的參數組合瘋狂試打，嘗試撈出其他人的資料。

雖然我們加了 BFF 中轉和 SecretServerKey 金鑰驗證，但多一層限流總是好的。於是決定實作一個 Rate Limiter。

## 最簡單的方案：Fixed Window

Fixed Window（固定窗口）是最容易理解的限流演算法：

1. 把時間切成固定長度的窗口（例如每 1 分鐘）
2. 每個窗口維護一個計數器
3. 請求進來就 +1，超過上限就拒絕
4. 窗口結束，計數器歸零

```
時間軸：
|--- 窗口 1 (00:00~00:59) ---|--- 窗口 2 (01:00~01:59) ---|
    ████████░░░░░░░░░░░░░░        ██████░░░░░░░░░░░░░░░░░░
    (12 次，未超限)                (8 次，未超限)
    
    上限 = 20 次/分鐘
```

## 實作

```csharp
public class FixedWindowRateLimiter
{
    private readonly IMemoryCache _cache;

    public FixedWindowRateLimiter(IMemoryCache cache)
    {
        _cache = cache;
    }

    /// <summary>
    /// 檢查是否允許請求通過
    /// </summary>
    /// <param name="identity">呼叫者身分（例如 TenantId:EmployeeId）</param>
    /// <param name="maxRequests">窗口內最大請求數</param>
    /// <param name="window">窗口時間長度</param>
    public bool IsAllowed(string identity, int maxRequests, TimeSpan window)
    {
        var key = $"rate_limit:{identity}";

        // GetOrCreate：第一次呼叫時建立 entry，設定過期時間
        // 過期後自動消失 = 計數器歸零
        var count = _cache.GetOrCreate(key, entry =>
        {
            entry.AbsoluteExpirationRelativeToNow = window;
            return 0;
        });

        if (count >= maxRequests)
            return false;

        // 注意：這裡有 race condition（下面會討論）
        _cache.Set(key, count + 1, window);
        return true;
    }
}
```

在 API 層使用：

```csharp
[HttpGet("user-data")]
public async Task<IActionResult> GetUserData(CancellationToken cancellationToken)
{
    // 從 JWT Token 解出呼叫者身分
    var tenantId = User.FindFirst("TenantId")?.Value;
    var employeeId = User.FindFirst("EmployeeId")?.Value;
    var identity = $"{tenantId}:{employeeId}";

    if (!_rateLimiter.IsAllowed(identity, maxRequests: 20, TimeSpan.FromMinutes(1)))
    {
        return StatusCode(429, new { message = "Too many requests. Please try again later." });
    }

    // ... 正常邏輯
}
```

## 已知問題：Race Condition

`GetOrCreate` + `Set` 不是原子操作。在高併發下，兩個請求可能同時讀到 count = 19，都認為自己是第 20 次，結果實際放行了 21 次。

對我們的場景來說，**這完全可以接受**。我們的目的是「防暴力破解」，不是精確計費。20 次上限偶爾變成 21、22 次，完全不影響防禦效果。

如果你需要精確計數，可以改用 `Interlocked` 或 `SemaphoreSlim`：

```csharp
// 精確版本（用 ConcurrentDictionary + Interlocked）
private readonly ConcurrentDictionary<string, Counter> _counters = new();

public bool IsAllowed(string identity, int maxRequests)
{
    var counter = _counters.GetOrAdd(identity, _ => new Counter());
    return Interlocked.Increment(ref counter.Count) <= maxRequests;
}
```

但對防暴力破解來說，這是 Over-engineering。

## 四種限流演算法比較

| 演算法 | 原理 | 優點 | 缺點 | 適用場景 |
| --- | --- | --- | --- | --- |
| **Fixed Window** | 固定時間窗口 + 計數器 | 最簡單、記憶體最少 | 窗口邊界可能突發 2 倍流量 | 防暴力破解 |
| **Sliding Window** | 滑動時間窗口，記錄每次請求時間戳 | 流量更平滑 | 記憶體較高（要存每筆時間戳） | 精確流量控制 |
| **Token Bucket** | 桶裡有 N 個 token，每次請求消耗 1 個，固定速率補充 | 允許短暫突發 | 實作稍複雜 | API Gateway |
| **Leaky Bucket** | 請求進入桶中，以固定速率流出 | 輸出速率恆定 | 突發流量會被延遲 | 流量整形 |

### Fixed Window 的邊界問題圖解

```
窗口 1 (00:00~00:59)        窗口 2 (01:00~01:59)
                    ↓ 邊界
░░░░░░░░░░░░████████ | ████████░░░░░░░░░░░░
            (20 次)    (20 次)
            
在 00:50~01:10 這 20 秒內，實際通過了 40 次請求
= 2 倍上限
```

這是 Fixed Window 最常被詬病的問題。但換個角度想：暴力破解通常是**持續**的高頻請求，不會剛好只在窗口邊界發動。而且即使邊界瞬間放行 40 次，下一個完整窗口還是會被卡住。

## 為什麼用 IMemoryCache 而不是 Redis？

| | IMemoryCache | Redis |
|---|---|---|
| 延遲 | 納秒級（記憶體直接讀寫） | 毫秒級（網路往返） |
| 跨實例同步 | ❌ 各實例獨立計數 | ✅ 全域一致 |
| 部署需求 | 無額外依賴 | 需要 Redis 服務 |
| 重啟後狀態 | 歸零 | 保留 |

我們的 API 是**單機部署**的內部服務，不存在多實例的同步問題。用 IMemoryCache 最簡單、零依賴、效能最好。

如果是多實例部署（例如 K8s 多 Pod），就需要改用 Redis：

```csharp
// Redis 版本（概念）
public bool IsAllowed(string identity, int maxRequests, TimeSpan window)
{
    var key = $"rate_limit:{identity}";
    var count = _redis.StringIncrement(key); // 原子操作，天生沒有 race condition
    if (count == 1)
        _redis.KeyExpire(key, window);
    return count <= maxRequests;
}
```

Redis 的 `INCR` 是原子操作，連 race condition 都一起解了。但對我們的場景來說，引入 Redis 依賴只為了一個限流器，不值得。

## .NET 7+ 內建方案

如果你用的是 .NET 7 以上，其實不需要自己寫——微軟已經內建了 Rate Limiting Middleware：

```csharp
// Program.cs
builder.Services.AddRateLimiter(options =>
{
    options.AddFixedWindowLimiter("api", opt =>
    {
        opt.PermitLimit = 20;
        opt.Window = TimeSpan.FromMinutes(1);
    });
});

app.UseRateLimiter();

// Controller
[EnableRateLimiting("api")]
[HttpGet("user-data")]
public async Task<IActionResult> GetUserData() { ... }
```

我們當初沒用是因為框架版本還在 .NET 6，但如果你是新專案，直接用內建的就好，不需要自己造輪子。

## 這件事教會我的

> **安全防禦不需要完美，需要的是「讓攻擊成本高於收益」。**

Fixed Window 有邊界問題？有。Race Condition 可能多放幾個請求？有。但這些「不完美」完全不影響防禦效果——暴力破解需要上千、上萬次試打，我們在第 20 次就擋住了。

工程上最危險的思維是：「這個方案有已知缺陷，所以不能用。」正確的思維是：**這個缺陷在我的場景下會造成問題嗎？** 如果答案是不會，那就是最好的方案。

簡單、好懂、能解決問題——這就夠了。

---

## 參考資料

- [Microsoft — Rate limiting middleware in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/performance/rate-limit)：.NET 7+ 內建的限流中介軟體，支援四種演算法。
- [Microsoft — `IMemoryCache`](https://learn.microsoft.com/en-us/aspnet/core/performance/caching/memory)：In-Memory 快取的使用方式與最佳實踐。
- [Cloudflare — What is rate limiting?](https://www.cloudflare.com/learning/bots/what-is-rate-limiting/)：四種限流演算法的圖解比較。
- [Redis — `INCR` command](https://redis.io/commands/incr/)：Redis 原子遞增操作，常用於分散式限流實作。
