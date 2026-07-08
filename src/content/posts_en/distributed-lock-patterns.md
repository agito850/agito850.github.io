---
title: "Intro to Distributed Locks: Starting from 'a Form Submitted Twice' — Pessimistic Locks, Optimistic Locks, and RedLock"
published: 2026-07-03
description: "Multiple people submitting the same form at once, duplicate approval steps generated — a practical note on solving concurrency with distributed locks, plus an optimistic/pessimistic comparison and an Execute-Around-Method wrapping technique."
tags: [Distributed Lock, Redis, RedLock, C#, Concurrency, Backend]
category: Tech
draft: false
---

## The cause: a form got submitted for approval twice

One day support reported: a form's approval flow had **two identical sets of steps**.

The normal flow is: the user clicks "Submit" → the backend generates one set of approval steps (who signs, in what order) → the flow begins. But somehow this form ran twice, producing two duplicate sets of steps, the approvers got two notification emails, and the whole flow was a mess.

Investigation revealed: on an unstable network, the user **double-clicked the submit button**, two requests arrived at the backend almost simultaneously, and each generated a set of steps.

This is a classic **concurrency problem** — two operations happening at once, where the operation must not run twice.

## The most intuitive fix: locking

The concept is simple: when the first request comes in, "lock" this form; the second request finds it already locked and is rejected.

```
Request A ──→ acquire lock ✅ ──→ submit ──→ release lock
Request B ──→ acquire lock ❌ ──→ return "processing, please wait"
```

But in a distributed system, "locking" is more complex than you think.

## Single-machine lock vs distributed lock

If your API runs on only one machine, C#'s built-in `lock` or `SemaphoreSlim` is enough:

```csharp
// Single-machine lock: only valid within the same process
private static readonly SemaphoreSlim _semaphore = new(1, 1);

await _semaphore.WaitAsync(cancellationToken);
try
{
    // business logic
}
finally
{
    _semaphore.Release();
}
```

But in reality APIs are usually deployed on multiple machines (multiple Pods / VMs). Request A hits machine 1, Request B hits machine 2 — **their `lock`s don't know about each other**, so locking is as good as not locking.

This is where you need **a lock all machines recognize** — a distributed lock. The most common approach is storing it in Redis.

## Basics of a Redis distributed lock

The simplest Redis lock:

```
Acquire: SET lock_key unique_value NX EX 30
          ↑ key     ↑ identifier   ↑ set only if absent  ↑ expire in 30s

Release: if GET lock_key == unique_value → DEL lock_key
          ↑ delete only if it's your own lock, avoiding deleting someone else's
```

- **NX (Not eXists)**: succeeds only when the key doesn't exist → atomicity of acquiring
- **EX (Expire)**: sets an expiry → avoids a deadlock if the holder dies and never releases
- **unique_value**: a unique value generated each acquire → confirms it's your own lock on release

## RedLock: a more reliable distributed lock

The simple Redis lock has a problem: if there's only one Redis and it dies, you're done. RedLock is an algorithm proposed by Redis author Antirez, using **multiple independent Redis nodes** for higher reliability:

1. Try to acquire the lock on N Redis nodes simultaneously
2. If you acquire it on a majority (N/2 + 1) of nodes → lock acquired
3. If you don't get a majority → release all acquired locks, acquisition fails

In the .NET ecosystem, [RedLock.net](https://github.com/samcook/RedLock.net) is the most common implementation:

```csharp
// Under the hood: RedLock.net with StackExchange.Redis
using var redLockFactory = RedLockFactory.Create(
    new List<RedLockMultiplexer> { new(multiplexer) });

await using var redLock = await redLockFactory.CreateLockAsync(
    resource: "lock_key",
    expiryTime: TimeSpan.FromSeconds(30));

if (redLock.IsAcquired)
{
    // got the lock, run business logic
}
else
{
    // acquisition failed, someone is operating
}
// leaving the using → auto release
```

## Wrapping: Execute Around Method

Using the RedLock API directly is fine, but the caller has to manage the lock's lifecycle:

```csharp
// ❌ Manual lock management — easy to forget release, or miss it on exception
var redLock = await factory.CreateLockAsync(key, expiry);
if (!redLock.IsAcquired) return Busy();
try
{
    // business logic
}
finally
{
    await redLock.DisposeAsync();  // forget this and you deadlock
}
```

A better approach is to **encapsulate lock management and pass the business logic as a callback**:

```csharp
public async Task<(bool locked, T? result)> RequireLock<T>(
    string lockKey,
    Func<Task<T>> func,          // what to do once the lock is acquired
    TimeSpan lockExpiry)
{
    await using var redLock = await _factory.CreateLockAsync(lockKey, lockExpiry);

    if (!redLock.IsAcquired)
    {
        _logger.LogWarning("Lock not acquired. lockKey={Key}, status={Status}", lockKey, redLock.Status);
        return (false, default);
    }

    return (true, await func.Invoke());
}
```

The caller only cares about business logic:

```csharp
var (locked, result) = await _lockService.RequireLock(
    $"form_submit_{formId}",
    async () =>
    {
        // only business logic, no lock acquire/release
        var flow = await CreateFlowAsync(formId, cancellationToken);
        return flow;
    },
    TimeSpan.FromMinutes(2));

if (!locked)
{
    // handle acquisition failure
    throw new ConflictException("The form is being processed, please try again shortly");
}
```

This pattern is called **Execute Around Method**:

- Impossible to forget releasing (the internal `using` guarantees it)
- Releases correctly even on exception
- The caller doesn't need to know the underlying is Redis RedLock or something else

Same idea as C#'s `using` — taking the "must-do cleanup" out of the caller's hands.

## Pessimistic lock vs optimistic lock

The RedLock above is a kind of **pessimistic lock**. But locking isn't the only strategy.

### Pessimistic lock: lock first, then act

> "I assume someone will contend with me, so I lock first."

```
Request A ──→ acquire lock ✅ ──→ act ──→ release
Request B ──→ acquire lock ❌ ──→ wait or reject
```

- **Pros**: simple and intuitive, no dirty data on conflict
- **Cons**: lock-wait cost, may queue under high concurrency

Fits: **write-intensive, high conflict probability** — like submission (must not duplicate steps), stock deduction (must not oversell).

### Optimistic lock: act first, then check

> "I assume usually no one contends, so I act first and check on save."

Doesn't actually lock; uses a **version number** or **timestamp** for conflict detection:

```csharp
// Entity carries a version number
public class Order
{
    public long Id { get; set; }
    public string Status { get; set; }
    public int Version { get; set; }  // the key to optimistic locking
}

// Check the version on update
var affected = await _db.ExecuteAsync(@"
    UPDATE Orders 
    SET Status = @NewStatus, Version = Version + 1
    WHERE Id = @Id AND Version = @ExpectedVersion",
    new { Id = orderId, NewStatus = "Approved", ExpectedVersion = currentVersion });

if (affected == 0)
{
    // wrong version → someone changed it first
    throw new ConcurrencyException("The data was modified by someone else, please refresh and retry");
}
```

The flow is:

```
Request A ──→ read (Version=1) ──→ act ──→ write WHERE Version=1 ✅ (Version→2)
Request B ──→ read (Version=1) ──→ act ──→ write WHERE Version=1 ❌ (already 2)
                                                    → conflict! retry or error
```

- **Pros**: no lock-wait, reads don't block, good performance under high concurrency
- **Cons**: must retry on conflict; high conflict rates make retries costly

Fits: **read-heavy, write-light, low conflict probability** — like editing a profile, updating settings.

EF Core supports optimistic locking out of the box:

```csharp
// Mark with [ConcurrencyCheck] or [Timestamp]
public class Order
{
    public long Id { get; set; }

    [Timestamp]
    public byte[] RowVersion { get; set; }  // EF Core checks automatically
}

// On SaveChanges, if RowVersion mismatches
// → automatically throws DbUpdateConcurrencyException
```

### Comparison table

| | Pessimistic | Optimistic |
|---|---|---|
| Strategy | Lock first, then act | Act first, then check |
| Conflict handling | Can't get lock → wait/reject | Wrong version → retry/error |
| Lock location | Redis / DB row lock | DB version column |
| Performance | Lock-wait cost | No lock-wait, but retry on conflict |
| Fits | Write-intensive, high conflict | Read-heavy, low conflict |
| Typical impl | RedLock, `SELECT FOR UPDATE` | EF Core `[Timestamp]`, manual Version column |

### How to choose?

A simple rule of thumb:

> **After a conflict, is the cost of retrying high?**

- High retry cost (submission has to rerun the whole flow) → **pessimistic lock**, block from the start
- Low retry cost (updating settings, just read once more) → **optimistic lock**, deal with it on conflict

They can also be combined — an outer pessimistic lock blocks obvious concurrency (like double-clicks), an inner optimistic lock is the last line of defense (like version checks).

## Fencing Token: when the lock expires but the holder is still writing

Pessimistic locks have an edge case: **the business logic runs too long and the lock's TTL expires first**.

```
Request A ──→ acquires lock ✅ ──→ long business logic… ──→ lock expires (TTL hit)
Request B ──→ lock expired ──→ legitimately acquires ✅ ──→ starts writing
Request A ──→ still working (thinks it still holds the lock) ──→ also writes 💀 ──→ overwrites B's data
```

Note: it's **not two people acquiring the lock at once** (Redis `SET NX` is atomic, can't both succeed) — it's that after A's lock expires, B legitimately gets a new lock, but A doesn't know its lock is gone.

### The fix: Fencing Token

Martin Kleppmann's solution — get an **incrementing token** when acquiring, carry it on write, and the storage only accepts writes with the largest token:

```
Request A ──→ acquires lock (token=42) ──→ runs long… ──→ lock expires
Request B ──→ acquires lock (token=43) ──→ writes (token=43) ✅
Request A ──→ writes (token=42) ──→ Storage checks: 42 < 43 → reject ✅
```

```csharp
// Conceptual code
var (locked, fencingToken) = await AcquireLock(key);  // token = 42

// ... business logic (may run long) ...

// carry the token on write; the DB checks it's the latest
var affected = await _db.ExecuteAsync(@"
    UPDATE Resource SET Data = @Data
    WHERE Id = @Id AND FencingToken <= @Token",
    new { Id = resourceId, Data = newData, Token = fencingToken });
```

### When do you need a Fencing Token?

**Shared resource + multiple writers + long operations.** For example, in a distributed file system where multiple workers take turns on the same file and the operation may exceed the TTL.

### When don't you?

Most business scenarios don't need it. Take form submission:

- The lock granularity is **per form** (per `formObjId`); there's no need for multiple people to "legitimately take turns writing the same record"
- Submitting the same form twice should just be blocked — it's not a "whose token is bigger" problem
- With TTL set to 3–5× the expected time (e.g. 2 minutes), the expiry problem almost never happens

> **In practice most scenarios don't need a Fencing Token; RedLock + a reasonable TTL is enough.** The Fencing Token is an academic completeness supplement, needed only in extreme cases like financial-grade or distributed storage.

## Designing multi-layer locks

In practice, one operation may need **multiple locks of different granularity**:

```
User clicks Submit
    │
    ├── Layer 1: application lock (simple Redis lock)
    │   Purpose: prevent double-clicks (same user can't click twice quickly)
    │   Key: form_submit_{appCode}_{tenantCode}_{formId}
    │   TTL: 60s
    │
    ├── Layer 2: flow lock (RedLock distributed lock)
    │   Purpose: prevent concurrent step generation (same form can't produce two flows at once)
    │   Key: flow_submit_{formId}
    │   TTL: 2 min
    │
    └── Layer 3: storage lock (RedLock distributed lock)
        Purpose: prevent write conflicts (MongoDB write protection)
        Key: save_form_{formId}_{timestamp}
        TTL: 5s
```

Each layer solves a different problem:
- **Application layer**: block the most obvious duplicate operations; a simple Redis SET is enough
- **Flow layer**: protect the correctness of core business logic; needs RedLock's reliability
- **Storage layer**: protect data consistency; finest granularity, shortest TTL

## How to set the lock TTL?

TTL (Time to Live) is the lock's auto-expiry. Too short and the lock expires before the logic finishes (as good as no lock); too long and if the holder dies, others wait a long time.

Rule of thumb:

> **TTL = 3–5× the expected execution time**

- Logic averages 5s → set TTL to 15–25s
- Logic averages 30s → set TTL to 2 min
- Unsure → set it longer first (better to wait than to expire early), then adjust from monitoring data

## What if acquiring the lock fails?

There are two reasons acquisition fails, handled differently:

**1. A real concurrency conflict (someone is operating)**

```csharp
if (!locked)
    return Conflict("The form is being processed, please try again shortly");
```

Normal case; just tell the user to retry later.

**2. An infrastructure problem (Redis connection blip)**

This is trickier — no one is really contending; Redis is unreachable so you can't get the lock. Reject directly and the user's operation is lost.

One strategy is to **distinguish paths**:

- **Sync path** (user is waiting): the outer simple lock already protects it, so skip RedLock and execute directly to reduce dropped-request risk
- **Async path** (background job): no outer protection, must acquire RedLock; on failure, stop and wait for ops to rerun

```csharp
if (isSyncPath)
{
    // Sync path: outer simple lock protects it, skip RedLock and act
    return await ExecuteBusinessLogic();
}
else
{
    // Async path: must acquire lock, throw on failure
    var (locked, result) = await RequireLock(key, func, expiry);
    if (!locked)
        throw new ConflictException("Lock acquisition failed, awaiting ops rerun");
    return result;
}
```

## What this taught me

> **More locks isn't better — every layer of lock must have a clear "what am I protecting".**

The application lock protects UX (prevent double-clicks), the flow lock protects business correctness (prevent duplicate steps), the storage lock protects data consistency (prevent write conflicts). Understand each lock's responsibility, and you won't over-lock and slow things down, nor under-lock and corrupt data.

Another important lesson: **don't only think about the "lock succeeds" path — think clearly about what to do when "lock fails"**. Retry? Reject? Degrade and execute? That decision is often more critical than "whether to lock at all".

---

## References

- [Redis — Distributed Locks with Redis (Antirez's original)](https://redis.io/docs/manual/patterns/distributed-locks/): the design motivation and implementation details of the RedLock algorithm.
- [RedLock.net — GitHub](https://github.com/samcook/RedLock.net): the most common RedLock implementation in .NET, based on StackExchange.Redis.
- [Martin Kleppmann — How to do distributed locking](https://martin.kleppmann.com/2016/02/08/how-to-do-distributed-locking.html): the classic critique of the RedLock algorithm, proposing the Fencing Token alternative.
- [Microsoft — Handling concurrency conflicts (EF Core)](https://learn.microsoft.com/en-us/ef/core/saving/concurrency): EF Core's optimistic locking using `[Timestamp]` or `[ConcurrencyCheck]`.
- [Microsoft — `SemaphoreSlim`](https://learn.microsoft.com/en-us/dotnet/api/system.threading.semaphoreslim): a lightweight async lock for single-machine environments.
