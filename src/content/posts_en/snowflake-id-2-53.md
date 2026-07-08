---
title: "When a Snowflake Drifts Past 2⁵³: A Case of Mass-Disappearing Forms"
published: 2026-06-25
description: "The backend uses Snowflake IDs, the frontend receives them as JS Numbers — and once the numbers get big enough, everything breaks. A precision lesson I learned by accident."
tags: [Snowflake ID, JavaScript, Precision, Backend, Pitfall]
category: Tech
draft: false
---

## The day it happened

One day, the form system started "acting haunted".

Users reported: **they couldn't submit, couldn't approve, and couldn't even open old forms — straight 404s.** The strange part was that it wasn't all broken — "some people had problems, some didn't", and the newer the form, the more likely it was to break.

Sounds random. It wasn't random at all. It was a time bomb hidden inside a number, creeping closer.

## The culprit: a number you thought was huge, but isn't

The backend's primary key is a **Snowflake ID** — a 64-bit integer that looks like this:

```
1739284756392834561
```

19 digits — looks safe, right? The problem is that once this id reaches the frontend, it gets received by **JavaScript's `Number`**.

And JavaScript's `Number` is an IEEE 754 double-precision float. The largest integer it can represent **exactly** is:

```js
Number.MAX_SAFE_INTEGER // 9007199254740991  ← that is, 2⁵³ - 1
```

`9007199254740991` is 16 digits. Our Snowflake ID is **19 digits**.

Beyond that line, JS doesn't throw an error — it **silently rounds**:

```js
9007199254740992 === 9007199254740993 // true 😱
```

You read that right. In JS's eyes, these two different numbers are "equal", because it no longer has the precision to tell them apart.

## The weirdest clue: only "odd" forms broke

During debugging there was one more baffling symptom — **the broken forms were all odd ids, while the even ones were perfectly fine.**

At first it seemed absurd, but once it clicked I laughed. It's the most naked evidence of floating-point precision.

### First, what a JS Number looks like in memory

`Number` is a 64-bit double (IEEE 754), laid out as:

```
[ 1 bit sign ][ 11 bit exponent ][ 52 bit fraction ]
                                  ↑ plus an implicit leading 1 → 53 bits of precision
```

The key: **the exponent decides "how big" the number is; those 52(53) bits decide how "finely" you can slice at that size.** The number of significant bits is fixed at 53 — once an integer needs more than 53 bits to write out fully, the low bits have nowhere to go and get dropped.

### Why the gap "doubles at every power of two"

The smallest gap between representable integers (ULP, unit in the last place) has a clean formula:

```
gap = 2^(exponent − 52)
```

Every time the number doubles (exponent +1), the high end eats one more bit and the low end loses one, so the gap doubles:

| Value range | Exponent | gap = 2^(exp−52) | Result |
| --- | --- | --- | --- |
| `0` ~ `2⁵³` | ≤52 | 1 | Every integer is exact ✅ |
| `2⁵³` ~ `2⁵⁴` | 53 | **2** | Only even numbers; odds snap to the nearest even |
| `2⁵⁴` ~ `2⁵⁵` | 54 | **4** | Only multiples of 4; others snap to the nearest 4 |
| `2⁵⁵` ~ `2⁵⁶` | 55 | **8** | Only multiples of 8… |

> Note: "snapping" is **rounding to the nearest grid point** (IEEE 754 default: round-half-to-even), not always rounding up — some go down, some go up.

### Back to the odd numbers

An odd number's last bit is always `1`. When the id falls into `2⁵³ ~ 2⁵⁴` where the gap is exactly **2**, that `1` has no grid slot and gets erased to the nearest even number:

```js
9007199254740993 // the odd id you think you have
// → what actually lands in the variable is 9007199254740992, turned even
```

Even numbers sit right on the grid, unscathed; odd numbers get stuck between slots, wiped out. "Only odd ones break" isn't random — it's the inevitable result of a **gap of 2**. Push past `2⁵⁴` and the gap becomes 4, dragging half the even numbers down with it. 😆

## How the disaster unfolds

Put the facts together and the whole tragedy is clear:

1. The backend generates an id: `...834561`
2. It's sent to the frontend as JSON; `JSON.parse` receives it as a `Number` → the trailing digits get ground off, becoming `...834560`
3. The user acts, and the frontend sends this "tampered" id back to the backend
4. The backend looks up `...834560` → **no such form** → 404 / approval fails / submission errors

> The most insidious part: **the backend is completely innocent, and so is the data.** The data got quietly altered the instant the frontend caught it in a `Number` — no exception, no log crying out.

And why are "newer forms more likely to break"? Because the high bits of a Snowflake ID are a timestamp — **as time moves forward, the number grows larger.** Once it crosses the 2⁵³ line, every newly generated id is doomed. It doesn't break suddenly — it breaks *on schedule*.

## The fix: don't use a number, use a string

The fix is surprisingly plain — **treat the id as a string, and never touch `Number` anywhere in the chain.**

When serializing on the backend, convert `long` to `string` before sending it to the frontend. In .NET / `System.Text.Json`:

```csharp
public class LongToStringConverter : JsonConverter<long>
{
    public override long Read(ref Utf8JsonReader reader, Type t, JsonSerializerOptions o)
        => long.Parse(reader.GetString()!);

    public override void Write(Utf8JsonWriter writer, long value, JsonSerializerOptions o)
        => writer.WriteStringValue(value.ToString()); // 1739284756392834561 → "1739284756392834561"
}
```

The frontend treats the id as an opaque string from start to finish — no arithmetic, no comparisons, just use it to look up data. Strings have no precision problem; not a single digit is lost.

## A lesson learned by accident

The most interesting part: **I "should have" known this pitfall long ago, but I got lucky and never hit it.**

The systems I worked on before all used **GUID** primary keys. A GUID looks like this:

```
3f2504e0-4f89-41d3-9a0c-0305e82c3301
```

It's a string by nature, so I was **always in the habit of receiving ids as `string`** — and never had a chance to run into the Number precision problem.

In other words, it was an *old habit* that shielded me from this landmine — until we switched to Snowflake IDs, the first time a numeric primary key appeared, and this assumption I'd never noticed bit me.

The takeaway:

> A lot of the "I've always done it this way and it's been fine" comfort is really just **not having hit that hidden assumption yet.**
> Switch a technology, switch a type, and the invisible assumptions come to collect.

Snowflakes are beautiful — but when one drifts past 2⁵³, remember to dress it in a coat called `string`. ❄️

---

## References

- [MDN — `Number.MAX_SAFE_INTEGER`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/MAX_SAFE_INTEGER): the official explanation that JS's safe integer limit is 2⁵³ - 1 (`9007199254740991`), and why doubles can only represent exactly up to here.
- [RFC 8259 §6 — JSON Number interoperability](https://www.rfc-editor.org/rfc/rfc8259#section-6): the JSON spec bluntly says that, for interoperability, numbers should stay within what IEEE 754 double can represent (i.e. 2⁵³).
- [Discord Developer Docs — Snowflakes](https://docs.discord.com/developers/reference): a famous real-world case. Discord states that snowflakes are 64-bit and always returned as strings in the API to avoid integer overflow in some languages.
- [Twitter Snowflake (original project, archived)](https://github.com/twitter-archive/snowflake): the origin of the algorithm — the 64-bit = timestamp + machine id + sequence design.
