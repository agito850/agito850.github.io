---
title: "Newtonsoft.Json's Phantom Notification: When Deserialization Quietly Adds Instead of Replaces"
published: 2026-07-02
description: "A DTO's List with a default value becomes the union of the default and the JSON value after Newtonsoft.Json deserialization — a debugging log of overdue notifications firing an extra round every day."
tags: [Newtonsoft.Json, C#, Redis, Pitfall, Backend]
category: Tech
draft: false
---

## The scene

One day support received reports from several tenants at once: **overdue notifications were being sent one extra time every day**.

Tenant A set 12:00 to send → actually received at both 09:00 and 12:00.
Tenant B set 10:00 to send → actually received at both 09:00 and 10:00.

A "phantom 09:00" appeared right on schedule, reproducible in both PRD and UAT.

## First instinct: is the Redis cache dirty?

The overdue-notification job pulls each tenant's send settings from the Redis cache. Naturally, the first suspicion was — **is the JSON in the cache corrupted?**

Opening Redis:

```json
{
  "ExecutionTimes": ["12:00"],
  "ScheduleWeekdays": [1, 2, 3, 4, 5]
}
```

Squeaky clean — only `12:00`, no `09:00` anywhere.

The cache is innocent. So where did the phantom 09:00 come from?

## The culprit is the instant of deserialization

Digging into the DTO definition:

```csharp
public class OverdueSettingsDto
{
    public List<string> ExecutionTimes { get; set; } = new() { "09:00" };
    public List<DayOfWeek> ScheduleWeekdays { get; set; } = new()
    {
        DayOfWeek.Monday, DayOfWeek.Tuesday, DayOfWeek.Wednesday,
        DayOfWeek.Thursday, DayOfWeek.Friday
    };
}
```

See that `= new() { "09:00" }`? That's the culprit's accomplice.

When the program calls `JsonConvert.DeserializeObject<OverdueSettingsDto>(json)`, Newtonsoft.Json's default behavior `ObjectCreationHandling.Auto` does this:

```
Step 1: new OverdueSettingsDto()
        → ExecutionTimes = ["09:00"]  // default-value initialization

Step 2: reads "ExecutionTimes": ["12:00"] from the JSON
        → finds ExecutionTimes already has a value (not null)
        → Auto mode: since there's already a List, just Add to it!
        → ExecutionTimes = ["09:00", "12:00"]  // 💀
```

**It's not Replace, it's Add.**

This is a Newtonsoft.Json "design decision" — for an already-existing collection object, the default behavior is to **add into it**, not **replace the whole thing**. `System.Text.Json` doesn't have this issue; it replaces by default.

## The pollution pattern

Once you understand the root cause, the whole thing explains itself:

```
Redis cache TTL = 5 minutes

Timeline:
├─ T+0  cache miss → query DB → correct ["12:00"] ✅
├─ T+1  cache hit  → deserialize → ["09:00", "12:00"] 💀
├─ T+2  cache hit  → deserialize → ["09:00", "12:00"] 💀
├─ T+3  cache hit  → deserialize → ["09:00", "12:00"] 💀
├─ T+4  cache hit  → deserialize → ["09:00", "12:00"] 💀
└─ T+5  cache miss → query DB → correct ["12:00"] ✅ (briefly normal)
```

Every 5 minutes only the first call (cache miss → correct value from DB) is right; the rest are polluted. The scheduler `ComputeFirstSlot` sorts and tries one by one, and the phantom `09:00` hits first, so the tenant gets one extra notification.

And `ScheduleWeekdays` (default Monday–Friday) has the same risk — it just happens that most tenants also set Monday–Friday, so "the Add is invisible".

## Why it's so hard to spot

This bug has three traits that make it especially insidious:

1. **The data in Redis is correct** — however you inspect the cache you find nothing wrong
2. **The data in the DB is also correct** — the root isn't in storage, it's in the instant of deserialization
3. **The first call is correct** — cache miss goes through the DB path and skips this deserialization; if you happen to test at that moment, everything looks fine

Only on a cache hit, at the instant Newtonsoft restores the object from the JSON string, do the default value and the JSON value get merged. If your breakpoint isn't precise enough, you never see it happen.

## The fix: a one-line attribute

```csharp
public class OverdueSettingsDto
{
    [JsonProperty(ObjectCreationHandling = ObjectCreationHandling.Replace)]
    public List<string> ExecutionTimes { get; set; } = new() { "09:00" };

    [JsonProperty(ObjectCreationHandling = ObjectCreationHandling.Replace)]
    public List<DayOfWeek> ScheduleWeekdays { get; set; } = new()
    {
        DayOfWeek.Monday, DayOfWeek.Tuesday, DayOfWeek.Wednesday,
        DayOfWeek.Thursday, DayOfWeek.Friday
    };
}
```

With `ObjectCreationHandling.Replace`, Newtonsoft **throws away the existing collection entirely and rebuilds it from the JSON value** during deserialization.

For a global effect, set it at the `JsonSerializerSettings` level:

```csharp
var settings = new JsonSerializerSettings
{
    ObjectCreationHandling = ObjectCreationHandling.Replace
};

var dto = JsonConvert.DeserializeObject<OverdueSettingsDto>(json, settings);
```

## No need to clear Redis after the fix

This is important — **the problem isn't the cache content, it's the deserialization code**.

After the release, the same cache JSON deserializes correctly, and existing wrong `NextSendAt` values self-correct on the next job cycle. No manual Redis clearing, no migration, no data hotfix.

## What this taught me

> **A DTO with default values + Newtonsoft.Json deserialization = collections get Added, not Replaced.**

This isn't a bug, it's Newtonsoft's design. It assumes "you've already initialized the collection, so I should add into it", which is genuinely useful in some scenarios (like merging config files). But in the vast majority of business logic, you expect whatever's in the JSON to be it — Replace, not Add.

A few defensive recommendations:

1. **When a collection property has a default value, always add `ObjectCreationHandling.Replace`**
2. **If the whole project uses Newtonsoft, consider setting `ObjectCreationHandling.Replace` globally**
3. **Prefer `System.Text.Json` for new projects** — it replaces by default and avoids this pit
4. **When writing unit tests, deliberately make the JSON value differ from the default**, and verify only the JSON value remains after deserialization

Some pits aren't because you wrote something wrong, but because the framework's "good intentions" are the exact opposite of your "expectations". And this kind of pit usually isn't discovered until a production user tells you "I get notified twice a day".

---

## References

- [Newtonsoft.Json — `ObjectCreationHandling` setting](https://www.newtonsoft.com/json/help/html/T_Newtonsoft_Json_ObjectCreationHandling.htm): official docs on the difference between `Auto`, `Reuse`, and `Replace`.
- [Newtonsoft.Json — `JsonPropertyAttribute.ObjectCreationHandling`](https://www.newtonsoft.com/json/help/html/P_Newtonsoft_Json_JsonPropertyAttribute_ObjectCreationHandling.htm): overriding deserialization behavior at the property level.
- [StackOverflow — Newtonsoft adding to list instead of replacing](https://stackoverflow.com/questions/24835262/json-net-is-adding-items-to-a-list-instead-of-replacing): the most common community discussion of this issue, confirming it's a widely hit pit.
- [Microsoft — Differences between `System.Text.Json` and `Newtonsoft.Json`](https://learn.microsoft.com/en-us/dotnet/standard/serialization/system-text-json/migrate-from-newtonsoft): Microsoft's official migration guide, which mentions the difference in collection handling.
