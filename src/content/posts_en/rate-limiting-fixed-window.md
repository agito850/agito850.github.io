---
title: "Implementing a Rate Limiter from 0 to 1: Blocking Brute Force with a Fixed Window"
published: 2025-11-07
description: "What do you do when an API gets hammered by key-guessing? Implement the simplest fixed-window limiter with IMemoryCache, plus a trade-off comparison of four algorithms."
tags: [Rate Limiting, C#, API Design, Security, Backend]
category: Tech
draft: false
---

## The cause: an API getting hammered

We had an API for fetching user data that originally relied only on JWT tokens for authentication. A penetration test revealed a risk: users' sensitive data could be brute-force enumerated — an attacker with a valid token could hammer different parameter combinations, trying to pull other people's data.

Although we'd added a BFF relay and SecretServerKey validation, one more layer of rate limiting never hurts. So I decided to build a rate limiter.

## The simplest approach: Fixed Window

Fixed Window is the easiest rate-limiting algorithm to understand:

1. Split time into fixed-length windows (e.g. every 1 minute)
2. Each window keeps a counter
3. A request comes in, +1; over the limit, reject
4. Window ends, counter resets to zero

```
Timeline:
|--- Window 1 (00:00~00:59) ---|--- Window 2 (01:00~01:59) ---|
    ████████░░░░░░░░░░░░░░        ██████░░░░░░░░░░░░░░░░░░
    (12 times, under limit)       (8 times, under limit)
    
    limit = 20 / minute
```

## Implementation

```csharp
public class FixedWindowRateLimiter
{
    private readonly IMemoryCache _cache;

    public FixedWindowRateLimiter(IMemoryCache cache)
    {
        _cache = cache;
    }

    /// <summary>
    /// Check whether the request is allowed through
    /// </summary>
    /// <param name="identity">Caller identity (e.g. TenantId:EmployeeId)</param>
    /// <param name="maxRequests">Max requests within the window</param>
    /// <param name="window">Window length</param>
    public bool IsAllowed(string identity, int maxRequests, TimeSpan window)
    {
        var key = $"rate_limit:{identity}";

        // GetOrCreate: creates the entry on first call, sets an expiry
        // auto-disappears after expiry = counter reset
        var count = _cache.GetOrCreate(key, entry =>
        {
            entry.AbsoluteExpirationRelativeToNow = window;
            return 0;
        });

        if (count >= maxRequests)
            return false;

        // Note: there's a race condition here (discussed below)
        _cache.Set(key, count + 1, window);
        return true;
    }
}
```

Used at the API layer:

```csharp
[HttpGet("user-data")]
public async Task<IActionResult> GetUserData(CancellationToken cancellationToken)
{
    // parse caller identity from the JWT token
    var tenantId = User.FindFirst("TenantId")?.Value;
    var employeeId = User.FindFirst("EmployeeId")?.Value;
    var identity = $"{tenantId}:{employeeId}";

    if (!_rateLimiter.IsAllowed(identity, maxRequests: 20, TimeSpan.FromMinutes(1)))
    {
        return StatusCode(429, new { message = "Too many requests. Please try again later." });
    }

    // ... normal logic
}
```

## Known issue: race condition

`GetOrCreate` + `Set` isn't atomic. Under high concurrency, two requests might both read count = 19, each think it's the 20th, and end up letting 21 through.

For our scenario, **this is completely acceptable**. Our goal is "block brute force", not precise metering. A 20 limit occasionally becoming 21 or 22 doesn't affect the defense at all.

If you need exact counting, use `Interlocked` or `SemaphoreSlim`:

```csharp
// Precise version (ConcurrentDictionary + Interlocked)
private readonly ConcurrentDictionary<string, Counter> _counters = new();

public bool IsAllowed(string identity, int maxRequests)
{
    var counter = _counters.GetOrAdd(identity, _ => new Counter());
    return Interlocked.Increment(ref counter.Count) <= maxRequests;
}
```

But for blocking brute force, that's over-engineering.

## Comparing four rate-limiting algorithms

| Algorithm | Principle | Pros | Cons | Fits |
| --- | --- | --- | --- | --- |
| **Fixed Window** | Fixed window + counter | Simplest, least memory | Boundary burst up to 2× traffic | Blocking brute force |
| **Sliding Window** | Sliding window, records each request timestamp | Smoother traffic | Higher memory (stores each timestamp) | Precise traffic control |
| **Token Bucket** | Bucket has N tokens, each request consumes 1, refilled at a fixed rate | Allows short bursts | Slightly more complex | API Gateway |
| **Leaky Bucket** | Requests enter the bucket, leak out at a fixed rate | Constant output rate | Bursts get delayed | Traffic shaping |

### Illustrating Fixed Window's boundary problem

```
Window 1 (00:00~00:59)      Window 2 (01:00~01:59)
                    ↓ boundary
░░░░░░░░░░░░████████ | ████████░░░░░░░░░░░░
            (20 times)  (20 times)
            
Within these 20 seconds (00:50~01:10), 40 requests actually pass
= 2× the limit
```

This is Fixed Window's most-criticized problem. But look at it another way: brute force is usually a **sustained** high-frequency stream, not something that happens to fire only at the window boundary. And even if the boundary momentarily lets 40 through, the next full window still blocks it.

## Why IMemoryCache instead of Redis?

| | IMemoryCache | Redis |
|---|---|---|
| Latency | nanoseconds (direct memory) | milliseconds (network round trip) |
| Cross-instance sync | ❌ each instance counts independently | ✅ globally consistent |
| Deployment needs | no extra dependency | needs a Redis service |
| State after restart | reset | preserved |

Our API is a **single-machine** internal service, with no multi-instance sync problem. IMemoryCache is the simplest, zero-dependency, best-performing choice.

For multi-instance deployment (e.g. K8s multi-Pod), switch to Redis:

```csharp
// Redis version (conceptual)
public bool IsAllowed(string identity, int maxRequests, TimeSpan window)
{
    var key = $"rate_limit:{identity}";
    var count = _redis.StringIncrement(key); // atomic, no race condition by nature
    if (count == 1)
        _redis.KeyExpire(key, window);
    return count <= maxRequests;
}
```

Redis's `INCR` is atomic, solving the race condition too. But for our scenario, introducing a Redis dependency just for a rate limiter isn't worth it.

## The built-in option in .NET 7+

If you're on .NET 7+, you don't actually need to write your own — Microsoft has a built-in Rate Limiting middleware:

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

We didn't use it originally because our framework was still on .NET 6, but for a new project, just use the built-in one — no need to reinvent the wheel.

## What this taught me

> **Security defense doesn't need to be perfect — it needs to "make the attack cost higher than the payoff".**

Does Fixed Window have a boundary problem? Yes. Might the race condition let a few extra requests through? Yes. But these "imperfections" don't affect the defense at all — brute force needs thousands or tens of thousands of attempts, and we block at the 20th.

The most dangerous engineering mindset is: "this approach has a known flaw, so it can't be used." The correct mindset is: **does this flaw cause a problem in my scenario?** If the answer is no, then it's the best approach.

Simple, understandable, solves the problem — that's enough.

---

## References

- [Microsoft — Rate limiting middleware in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/performance/rate-limit): the built-in limiting middleware in .NET 7+, supporting four algorithms.
- [Microsoft — `IMemoryCache`](https://learn.microsoft.com/en-us/aspnet/core/performance/caching/memory): in-memory cache usage and best practices.
- [Cloudflare — What is rate limiting?](https://www.cloudflare.com/learning/bots/what-is-rate-limiting/): an illustrated comparison of the four algorithms.
- [Redis — `INCR` command](https://redis.io/commands/incr/): Redis atomic increment, commonly used for distributed rate limiting.
