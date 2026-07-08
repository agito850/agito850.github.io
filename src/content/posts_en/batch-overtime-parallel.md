---
title: "Batch Validation from 2 Minutes to 8 Seconds: A Task.WhenAll Parallelization Story"
published: 2026-07-02
description: "Grid OnChange validation timed out under large data volumes — a debugging and optimization log of dissecting the bottleneck, parallel chunking, preserving order, and ending up 10× faster."
tags: [Performance, C#, async, Parallelism, Pitfall]
category: Tech
draft: false
---

## The scene

Our HR SaaS product has a "batch overtime form" — letting a manager request overtime for a whole department's employees at once. The user fills in a Grid, and every change triggers OnChange validation that hits a backend batch-check API.

This API does two things:
1. **Individual validation**: whether each overtime slot conflicts with that employee's existing leave, business trips, or overtime records
2. **Cross-check**: whether the same employee has overlapping times within this batch

With little data, everything was fine. But when a user filled in 30 or 50 rows at once, the page started spinning… then **Timeout**.

## Step one: figure out "how many rows counts as a lot"

Before optimizing anything, I pulled the historical usage from production:

- **50%** of batches were within 5 rows
- **90%** were within 30 rows
- 50+ rows were extreme outliers

So I set the baseline: **30 rows is the standard test size, 50 rows is the extreme stress test**.

## Where's the bottleneck?

Analysis showed the bottleneck wasn't in our bridge layer, but in the **product-side validation API** — it split the whole batch into single items, validating and cross-checking one by one, entirely sequentially. 30 rows meant 30 rounds of validation, growing linearly.

But there was one key observation: **validation between different employees is independent**.

Whether employee A's overtime conflicts with A's leave has nothing to do with employee B. Only "multiple rows for the same employee" have a cross-check dependency.

That means — **we can group by employee and validate in parallel**.

## The fix: Chunk + Task.WhenAll

```csharp
// 1. Group by employee, max 10 rows per group
var chunks = batchItems
    .GroupBy(x => x.EmployeeId)
    .SelectMany(g => g.Chunk(10))
    .ToList();

// 2. Record original order (to restore later)
var indexedChunks = chunks
    .Select((chunk, index) => (chunk, index))
    .ToList();

// 3. Call the product-side API in parallel
var tasks = indexedChunks.Select(async item =>
{
    var result = await _productApi.ValidateAsync(item.chunk, cancellationToken);
    return (item.index, result);
});

var results = await Task.WhenAll(tasks);

// 4. Reassemble error messages in original order
var orderedResults = results
    .OrderBy(r => r.index)
    .SelectMany(r => r.result)
    .ToList();
```

Core idea:

1. **GroupBy employee** → rows for the same employee stay in the same group (preserving cross-check correctness)
2. **Chunk(10)** → control group size, avoiding a single request that's too large
3. **Task.WhenAll** → validations for different employees run simultaneously
4. **Record index + OrderBy to restore** → error messages must display back in the original Grid row order

I also extended the cross-product API timeout as insurance, and monitored the product-side site's CPU / Memory to confirm the Chunk(10) concurrency wouldn't overwhelm the machine.

## Measured results

### 30-row baseline (before vs after)

| Environment | Before (all sequential) | After (parallel by employee) | Reduction |
| --- | --- | --- | --- |
| UAT | ~124s (~2 min) | 8.16s | **93.4%** |
| PP | ~114s (~1.9 min) | 9s | **92.1%** |

### Extreme tests

| Scenario | Time | Result |
| --- | --- | --- |
| 50 people × 1 row (parallel) | 13.82s | ✅ OK |
| 100 people × 1 row (parallel) | 42.55s | ✅ OK |
| 1 person × 50 rows (sequential) | 3.8 min | ❌ Gateway Timeout |

## The ceiling of parallelization

Note the last row: **1 person × 50 rows still times out**.

Because multiple overtime rows for the same employee have a cross-check dependency and can't be parallelized. This was an expected trade-off at design time — parallelization can only remove the wait time "between different employees"; the sequential processing "within the same employee" is a hard logical limit.

In the end I decided not to adjust the Grid row cap or add a recommended row count. Because the real usage data told us 90% of batches are within 30 rows and usually the many-people-few-rows scenario — exactly the sweet spot where parallelization works best.

## Why not implement the validation logic in the bridge layer itself?

I considered it, but rejected it.

The bridge layer's role is an **adapter** — responsible for format conversion, error wrapping, triggering notifications; it shouldn't contain business logic. Whether overtime conflicts with leave, and what counts as a conflict, are the HR product's responsibility. Rewriting a copy of the validation logic in the bridge layer violates the separation of architectural responsibilities, and once product rules change, the bridge layer has to sync — a maintenance nightmare.

Why I chose parallel chunking in the end:
1. **Don't touch product-side code**: changes confined to the bridge layer
2. **Lowest risk**: validation logic unchanged, only the call pattern adjusted
3. **Backed by data**: confirmed validation between different employees is independent

## What this taught me

> **The first step of optimization isn't writing code — it's pulling data.**

If I hadn't looked at the usage distribution first, I might have spent time optimizing the "1 person × 50 rows" extreme (a dead end). Precisely because the data told me "90% is many-people-few-rows", I could confidently choose the parallel-by-employee path.

Another takeaway: **parallelization isn't a silver bullet, but knowing where its ceiling is actually gives you more confidence**. Facing the "same employee, multiple rows" limit, I can clearly explain "this is a hard limit caused by a logical dependency, not something the tech can't do", instead of vaguely saying "still optimizing".

The scariest thing in performance optimization isn't difficulty — it's not knowing what you're optimizing.

---

## References

- [Microsoft — `Task.WhenAll`](https://learn.microsoft.com/en-us/dotnet/api/system.threading.tasks.task.whenall): official docs on awaiting multiple async tasks completing together.
- [Microsoft — `Chunk` (LINQ)](https://learn.microsoft.com/en-us/dotnet/api/system.linq.enumerable.chunk): the batching method introduced in .NET 6 that splits a sequence into fixed-size subsequences.
- [Microsoft — Asynchronous programming patterns](https://learn.microsoft.com/en-us/dotnet/csharp/asynchronous-programming/): async/await best practices and common pitfalls.
