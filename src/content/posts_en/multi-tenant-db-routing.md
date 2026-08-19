---
title: "Every Request Wipes the Cache — So Why Does It Only Break After a Restart?"
published: 2026-08-19
description: "A three-layer hunt through multi-tenant connection routing: a fallback with a comment explaining itself, a static cache wiped by a Scoped constructor, and a Singleton layer that masked the damage — and hid the bug for a long time."
tags: [Multi-tenancy, C#, DI, Caching, Pitfall]
category: Tech
draft: false
---

## The scene

While testing locally, I kept hitting an annoying symptom: **after every startup, the first API calls would often fail with "Employee Not Found".**

```json
POST /api/form/Submit          → 404 Not Found  (10.47 s)

{
  "status": 0,
  "error": {
    "code": "120",
    "languages": { "en-US": "Employee Not Found(83188563-****-****-****-********945f)" },
    "details": { "type": "ErrorCodeException", "detail": "EmployeeNotFound" }
  }
}
```

Retry a few times, and it works.

At first I filed it under "weird local environment quirk" — cache not warm, restart and it's fine. Every project has a few of those. Until this occurred to me:

> **What about production? Isn't every deployment also a "startup"?**

Remember that **10.47 seconds**. It only becomes relevant at the very end, but it was at the crime scene from the first second.

## The clue: it picks tenants

The most useful clue was this: **only certain tenants were affected** — the ones whose data lives in a dedicated database.

If the business logic were wrong, it shouldn't discriminate between tenants. When the "broken set" and the "working set" can be split along the **tenant dimension**, the answer usually isn't in the business logic — it's in the **connection**. Which database did this request actually connect to?

The answer: **it connected to the shared SharedDB, not the tenant's dedicated one.**

That table naturally doesn't contain this person. Hence "Employee Not Found".

## Layer one: a fallback with a comment explaining itself

Digging into `TenantConfigManager`, there are **two methods** for getting a tenant's connection string — one sync, one async. The sync one looks like this:

```csharp
public string GetTenantConnectionStringSync(long tenantId)
{
    if (tenantId == 0)
        return _connectionStringSettings.SharedDBConnection;

    // ① Prefer TenantDbManager (this is the cached data)
    if (_tenantDbManager.ExistTenantDbInfo(tenantId))
    {
        var tenantDbInfo = _tenantDbManager.GetTenantDatabaseInfo(tenantId);
        if (!string.IsNullOrEmpty(tenantDbInfo.ApiConnectionString))
            return tenantDbInfo.ApiConnectionString;
    }

    // ② Fall back to the in-memory cache
    if (_inMemoryCachedConnectionStringConfigs.TryGetValue(tenantId, out var connString)
        && !string.IsNullOrEmpty(connString))
    {
        return connString;
    }

    // ③ If the cache isn't loaded, return the shared connection string
    //    (avoids doing async IO inside DbContext).
    //    This usually happens early in system startup, before tenant config is fully loaded.
    return _connectionStringSettings.SharedDBConnection;   // 💀 right here
}
```

Look at those three lines under ③.

**This bug was carefully written down in a comment.**

Whoever wrote it knew perfectly well that "early in system startup, tenant config not yet loaded" would happen, and knew exactly what trade-off they were making — they didn't want async I/O inside `DbContext`, so they picked a default that would "at least connect".

This wasn't an oversight. It was a decision that **looked entirely reasonable at the time**.

Compare it with the async version in the same class, which handles things completely differently:

```csharp
public async Task<string> GetTenantConnectionStringAsync(long tenantId)
{
    if (tenantId == 0) return _connectionStringSettings.SharedDBConnection;

    // Not in cache → go fetch it (the sync version can't do this)
    if (!_loadedTime.HasValue || !_inMemoryCachedConnectionStringConfigs.ContainsKey(tenantId))
        await Reload(tenantId);

    if (_tenantDbManager.ExistTenantDbInfo(tenantId))
    {
        var tenantDbInfo = _tenantDbManager.GetTenantDatabaseInfo(tenantId);

        // Found it, but the value is bad → blow up (the sync version silently falls back)
        if (string.IsNullOrEmpty(tenantDbInfo.ApiConnectionString))
            throw new Exception("Invalid ApiConn");

        return tenantDbInfo.ApiConnectionString;
    }
    // ...
}
```

| | Cache hit | **Cache miss** | Invalid value |
|---|---|---|---|
| **Sync version** | Correct connection | **Silent fallback to SharedDB** 💀 | Silent fallback |
| **Async version** | Correct connection | `await Reload()` to fetch ✅ | `throw` ✅ |

Why does a "cache-read-only" path exist at all? Nobody was being lazy — it's that **`DbContext.OnConfiguring` can't `await`**. When you need the connection string inside `OnConfiguring`, you have no awaitable context. A sync method can't do I/O, so all it can do is "check the cache, and if it's not there, hand back a default".

> **`OnConfiguring` is sync → can't call async Reload → can only read the cache → empty cache means falling back to the wrong DB.**

At this point the story felt complete: **during cold start the cache isn't warm, so we get the wrong DB.** I thought I was done.

## Layer two: a `static` field paired with a `Scoped` lifetime

Reading further, I found something much stranger.

The field declarations:

```csharp
private static DateTimeOffset? _loadedTime = null;
private static ConcurrentDictionary<long, TenantConfigurationGroup> _inMemoryCachedConfigs;
private static ConcurrentDictionary<long, string> _inMemoryCachedConnectionStringConfigs;
private static ConcurrentDictionary<long, string> _inMemoryCachedTenantNameConfigs;
```

All `static` — **the design intent is unmistakable: this cache is meant to be shared across all requests.**

The constructor:

```csharp
public TenantConfigManager(/* ... */)
{
    // ...
    _inMemoryCachedConfigs = new ConcurrentDictionary<long, TenantConfigurationGroup>();
    _inMemoryCachedConnectionStringConfigs = new ConcurrentDictionary<long, string>();
    _inMemoryCachedTenantNameConfigs = new ConcurrentDictionary<long, string>();
}
```

The DI registration — **in a completely different file**:

```csharp
services.AddScoped<ITenantConfigManager, TenantConfigManager>();
```

Put the three together:

> **`TenantConfigManager` is Scoped — a new instance per request. And the constructor unconditionally overwrites the static fields with `=`. So every incoming request wipes out the cache that everyone else already populated.**

Three pieces of information, scattered across three places, and **each one is perfectly fine on its own**:

| Location | Content | On its own |
|---|---|---|
| Top of the class | Fields are `static` | ✅ Reasonable — they're meant to be shared across requests |
| Constructor | `= new ConcurrentDictionary()` | ✅ Reasonable — initializing your fields is basic hygiene |
| `DependencyInjection.cs` | `AddScoped<...>()` | ✅ Reasonable — Scoped is the default for services |

What's wrong is the **semantics of the combination**: `static` says "I live a long time", `Scoped` says "I'm reborn every request", and that `=` in the constructor lets the latter win.

The fix is three characters:

```diff
- _inMemoryCachedConfigs = new ConcurrentDictionary<long, TenantConfigurationGroup>();
- _inMemoryCachedConnectionStringConfigs = new ConcurrentDictionary<long, string>();
- _inMemoryCachedTenantNameConfigs = new ConcurrentDictionary<long, string>();
+ _inMemoryCachedConfigs ??= new ConcurrentDictionary<long, TenantConfigurationGroup>();
+ _inMemoryCachedConnectionStringConfigs ??= new ConcurrentDictionary<long, string>();
+ _inMemoryCachedTenantNameConfigs ??= new ConcurrentDictionary<long, string>();
```

`=` becomes `??=`. **"Create it only if it doesn't exist", not "create it every time".**

## Hold on — then why doesn't every request fail?

I proudly announced I'd found the root cause. Then I got asked a question I couldn't answer:

> **If every request wipes the cache, production should get the wrong DB every single time. Why does it only happen right after a deployment, when the machine restarts?**

That question is correct. And my "root cause" couldn't explain it.

Going back to re-read `GetTenantConnectionStringSync`, the answer is on the very first line — **there is more than one cache layer**:

```csharp
// ① TenantDatabaseManager
if (_tenantDbManager.ExistTenantDbInfo(tenantId)) { /* return */ }

// ② _inMemoryCachedConnectionStringConfigs (static — this is what the constructor wipes)
if (_inMemoryCachedConnectionStringConfigs.TryGetValue(tenantId, out var connString)) { /* return */ }

// ③ fallback to SharedDB
```

And `TenantDatabaseManager` is a **genuine singleton**:

```csharp
public class TenantDatabaseManager
{
    private readonly ConcurrentDictionary<long, Lazy<TenantDatabaseInfo>> _tenantBPMDatabaseCache;

    private static readonly Lazy<TenantDatabaseManager> _instance =
        new Lazy<TenantDatabaseManager>(() => new TenantDatabaseManager());

    private TenantDatabaseManager()   // ← private, so nobody outside can new it
    {
        _tenantBPMDatabaseCache = new ConcurrentDictionary<long, Lazy<TenantDatabaseInfo>>();
    }

    public static TenantDatabaseManager Instance => _instance.Value;
}
```

```csharp
services.AddSingleton<TenantDatabaseManager>(_ => TenantDatabaseManager.Instance);
```

Its dictionary is **built exactly once per process**. It doesn't care one bit that `TenantConfigManager` is Scoped and gets new'd on every request.

So here's what actually happens:

```
Every request:
  new TenantConfigManager()  →  wipes ②   ← your disaster
                                           ↓
  sync path → checks ① (Singleton, perfectly fine) → hit, returns the correct connection ✅
                                           ↑
                         never reaches ②, so you never see the disaster
```

**② really does get wiped on every request. But the sync path hits on ① and never gets to ②.**

That singleton layer sat in front like a board, masking the damage entirely.

### So what's the actual failure window?

It's not "② got wiped" — it's "**① is also empty**". And ① is only empty in two situations:

1. **The app just started / a new instance scaled out** — the `Lazy<T>` was just constructed and the dictionary holds nothing.
2. **Someone called `ReloadAll()`** — it calls `_tenantDbManager.ClearTenantCache()`, which `Clear()`s ① entirely before refilling it, leaving a gap in between.

Point 1 is the answer to "why only right after a deployment".

## Then what did `??=` actually fix?

If correctness was already being protected by ①, were those three characters wasted?

No. They fixed a **different disease**. Look again at the async version's trigger condition:

```csharp
if (!_loadedTime.HasValue || !_inMemoryCachedConnectionStringConfigs.ContainsKey(tenantId))
    await Reload(tenantId);
```

`_loadedTime` is initialized at its **declaration** (`= null`), not in the constructor, so it survives just fine → `HasValue` is `true`.

But `_inMemoryCachedConnectionStringConfigs` gets wiped on every request → `ContainsKey(tenantId)` is **always false**.

> **So every single request that takes the async path triggers a full `Reload(tenantId)`.**

And what `Reload` does includes: querying `Tenants`, querying `TenantDBMappings`, and then —

```csharp
var (apiTestResult, apiTestErr) = await MakeConnectionTesting(connectionString);
```

**Actually opening a connection to test it.** On every request.

Remember that **10.47 seconds** from the top?

So the three commits each cure a different disease — they aren't three spellings of one root cause:

| Fix | What it actually cures |
|---|---|
| `=` → `??=` | A full Reload storm (with connection tests) on every request → **performance** |
| Warm-up middleware | ① being empty on cold start → **correctness** |
| fallback + warning log | Leaving a trace when degrading → **observability** |

This is where I learned the most in this whole debugging session: **if an "obviously the root cause" discovery can't explain the distribution of the damage (why only after a restart, why only certain tenants), it's probably an accomplice, not the culprit.** The distribution will always tell you the answer before the code does.

## The fix: three layers of defense

### 1. Add a warm-up middleware (fixes correctness)

Middleware has an async context, so it can call the path that **backfills** the cache, guaranteeing ① has data before the request reaches a controller:

```csharp
/// <summary>
/// Ensures the tenant's DB connection info is in the cache before every request reaches a controller.
/// Works around EF Core OnConfiguring (sync) being unable to call an async Reload.
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
                    _logger.LogInformation("Tenant {TenantId} DB connection cache warmed up", tenantId);
                }
                catch (Exception ex)
                {
                    // A failed warm-up must not break the whole pipeline —
                    // log a warning and let the downstream flow deal with it
                    _logger.LogWarning(ex,
                        "Tenant {TenantId} DB connection cache warm-up failed; " +
                        "the sync path may not resolve the correct connection",
                        tenantId);
                }
            }
        }

        await _next(context);
    }
}
```

That `try-catch` was added later. **Warm-up is an optimization, not a precondition** — if a failed warm-up takes down the entire request, you've turned a defensive measure into a new single point of failure.

Register it after `UseAuthorization()` (otherwise you can't read the `TenantId` claim) and before `MapControllers()`:

```csharp
app.UseSession();
app.UseRateLimiter();
app.UseAuthorization();
app.UseMiddleware<TenantConfigWarmUpMiddleware>();   // ← add this line
app.MapControllers();
```

### 2. `=` → `??=` (fixes performance)

As above. Lets the static cache actually survive across requests, stopping the per-request Reload storm.

### 3. Remove the silent fallback (fixes observability)

Finally, change those three lines in the sync version so a cache miss reports an error outright:

```csharp
// Report an explicit error on cache miss, instead of silently connecting to the wrong SharedDB.
// Under normal conditions TenantConfigWarmUpMiddleware has already populated the cache,
// so we should never reach this point.
throw new InvalidOperationException(
    $"Tenant {tenantId}'s DB connection info is not in the cache. " +
    "Verify TenantConfigWarmUpMiddleware is registered after UseAuthorization and before MapControllers.");
```

The reasoning is sound: **data contamination from connecting to the wrong DB is far worse than a 500.**

## Then, 40 minutes later, I reverted it

The integration tests went completely red.

The reason: **integration tests don't go through the HTTP pipeline, so there's no middleware warm-up.** That path we said we "should never reach" is hit every single time in the test environment.

And it goes further than that. Digging into the DI registration, it turns out the test environment doesn't even use the same lifetime:

```csharp
if (isIntegrationTests)
{
    services.AddSingleton<ITenantConfigManager, TenantConfigManager>();   // ← test environment
}
else
{
    services.AddScoped<ITenantConfigManager, TenantConfigManager>();      // ← production
}
```

**Integration tests register it as `Singleton`; production registers it as `Scoped`.**

A singleton is new'd only once, so that constructor which "unconditionally overwrites the static fields" **runs exactly once** — in the test environment, the layer-two problem is structurally impossible. It's not that the tests were badly written or that coverage was too low. **The test environment simply doesn't run the same object lifetime.**

The same crack (test environment ≠ production) bit me twice: once by making the defect invisible to tests, and once by making the defensive fix impossible to install.

The final version looks like this:

```csharp
// Cache miss: fall back to the shared connection string, but log a warning so it can be traced.
// Under normal conditions TenantConfigWarmUpMiddleware has already populated the cache,
// so we should never reach this point.
// Integration tests don't go through the HTTP pipeline, so they legitimately hit this path.
_logService.Warning(
    $"Tenant {tenantId}'s DB connection info is not in the cache; falling back to SharedDBConnection. " +
    "If this is production, verify TenantConfigWarmUpMiddleware is correctly registered.");

return _connectionStringSettings.SharedDBConnection;
```

It looks like we went in a circle and came back to the start, but there's one decisive difference:

| | Before the fix | After the fix |
|---|---|---|
| On cache miss | Returns SharedDB | Returns SharedDB |
| **Does it leave a trace?** | **No** 💀 | **Warning log** ✅ |

**The problem was never `fallback`. It was `silent`.**

A fallback that screams in the logs and a fallback that stays quiet are two entirely different things. The first says "I know there's risk here and I'm watching it"; the second says "I'm pretending nothing is wrong here".

That's also why I accepted the compromise: the ideal solution (`throw`) requires fixing the test architecture first, which is a whole other ticket's worth of work. Until then, **making it scream** has already moved the worst case from "silently writing to the wrong DB" to "searchable in the logs".

As for a real cure — long term, that entire sync path in `OnConfiguring` needs to be torn out and replaced with `IDbContextFactory`, so every DbContext is created inside an async context:

```csharp
services.AddDbContextFactory<SharedDbContext>();
```

The cost is auditing and rewriting every place that injects a `DbContext`. Scheduled for next sprint.

## What this taught me

**1 · A root cause that can't explain the distribution of the damage is an accomplice, not the culprit.**

"Every request wipes the cache" sounds like a killing blow, but it can't produce "only breaks after a restart". The real culprit was hiding behind the Singleton layer above it — the layer that normally blocks the damage, and therefore kept the problem hidden for a long time.

**Before you accept a root cause, make it explain two things: why these people, and why now.** If the distribution doesn't line up, you haven't hit bottom.

**2 · When you see a `fallback`, ask where it falls back to.**

Falling back to an "empty collection" or "default settings" is usually harmless. Falling back to **another tenant's database** isn't a fallback — it's the setup for data contamination. And: **allow fallbacks, but never allow silence.** Every degradation path deserves a log line.

**3 · A `static` field in a non-Singleton class makes the constructor a minefield.**

`static` says "I live a long time", `Scoped` says "I'm reborn every request". When those two meet in the same class, the `=` in the constructor almost always needs to be `??=`. And the clues for this class of bug are inherently spread across three files, each looking perfectly reasonable in isolation — **you only see it when you read them together**.

**4 · Every "just to make it run smoothly" tweak in your test environment is a structural blind spot.**

Different DI lifetimes, bypassing the HTTP pipeline, an in-memory DB standing in for the real one… each one switches off visibility for an entire class of defects. It's worth auditing periodically: **where exactly does my test environment differ from production, and what can each of those differences hide?**

One last thing: the fallback line that caused all of this had a comment, an explanation, and a clearly stated trade-off. It was not written carelessly.

> **Some technical debt isn't incurred because nobody thought it through. It's incurred because someone did think it through, decided it was worth it — and the interest turned out much higher than expected.**

---

## References

- [Microsoft — Service lifetimes in .NET dependency injection](https://learn.microsoft.com/en-us/dotnet/core/extensions/dependency-injection#service-lifetimes): the differences between Transient / Scoped / Singleton and common misuses.
- [Microsoft — Dependency injection guidelines](https://learn.microsoft.com/en-us/dotnet/core/extensions/dependency-injection-guidelines): includes "avoid static state in services" and advice on keeping constructors light.
- [C# — Null-coalescing assignment operator `??=`](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/null-coalescing-operator): the three-character fix in this post.
- [Microsoft — `Lazy<T>` and thread-safe singletons](https://learn.microsoft.com/en-us/dotnet/framework/performance/lazy-initialization): the standard way to implement a singleton with `Lazy<T>`.
- [EF Core — Multi-tenancy](https://learn.microsoft.com/en-us/ef/core/miscellaneous/multitenancy): official multi-tenancy guidance, including connection switching and DbContext lifetime caveats.
- [EF Core — DbContext Factory](https://learn.microsoft.com/en-us/ef/core/dbcontext-configuration/#using-a-dbcontext-factory): when to use `AddDbContextFactory` and `CreateDbContextAsync`.
- [Microsoft — ASP.NET Core Middleware](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/middleware/): middleware pipeline ordering and resolving dependencies.
