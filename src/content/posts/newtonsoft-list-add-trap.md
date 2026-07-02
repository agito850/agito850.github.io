---
title: Newtonsoft.Json 的幽靈通知：當反序列化偷偷幫你 Add 而不是 Replace
published: 2026-07-02
description: "DTO 有預設值的 List，經 Newtonsoft.Json 反序列化後變成預設值 + JSON 值的聯集——記一次逾期通知每天多發一輪的除錯紀實。"
tags: [Newtonsoft.Json, C#, Redis, 踩坑, 後端]
category: 技術
draft: false
---

## 事發現場

某天，客服同時收到多個租戶回報：**逾期通知每天多發了一次**。

租戶 A 設定 12:00 發送 → 實際收到 09:00 和 12:00 兩次。
租戶 B 設定 10:00 發送 → 實際收到 09:00 和 10:00 兩次。

一個「幽靈 09:00」準時出沒，PRD 和 UAT 都能復現。

## 第一個直覺：Redis 快取髒了？

逾期通知的 Job 會從 Redis 快取撈租戶的發送設定。自然而然，第一個懷疑就是——**快取裡存的 JSON 是不是壞的？**

打開 Redis 一看：

```json
{
  "ExecutionTimes": ["12:00"],
  "ScheduleWeekdays": [1, 2, 3, 4, 5]
}
```

乾乾淨淨，只有 `12:00`，沒有任何 `09:00`。

快取是無辜的。那幽靈 09:00 到底從哪冒出來的？

## 兇手在反序列化的那一瞬間

追進去看 DTO 的定義：

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

看到那個 `= new() { "09:00" }` 了嗎？這就是兇手的同夥。

當程式呼叫 `JsonConvert.DeserializeObject<OverdueSettingsDto>(json)` 時，Newtonsoft.Json 的預設行為 `ObjectCreationHandling.Auto` 會這樣做：

```
Step 1：new OverdueSettingsDto()
        → ExecutionTimes = ["09:00"]  // 預設值初始化

Step 2：讀到 JSON 裡的 "ExecutionTimes": ["12:00"]
        → 發現 ExecutionTimes 已經有值（不是 null）
        → Auto 模式：既然已經有 List 了，就直接 Add 進去吧！
        → ExecutionTimes = ["09:00", "12:00"]  // 💀
```

**它不是 Replace，是 Add。**

這是 Newtonsoft.Json 的「設計決策」——對於已經存在的集合物件，預設行為是**往裡面加**，而不是**整個換掉**。`System.Text.Json` 不會有這個問題，它預設就是 Replace。

## 汙染規律

理解了根因之後，災情就能完整解釋了：

```
Redis 快取 TTL = 5 分鐘

Timeline:
├─ T+0  cache miss → 查 DB → 正確的 ["12:00"] ✅
├─ T+1  cache hit  → 反序列化 → ["09:00", "12:00"] 💀
├─ T+2  cache hit  → 反序列化 → ["09:00", "12:00"] 💀
├─ T+3  cache hit  → 反序列化 → ["09:00", "12:00"] 💀
├─ T+4  cache hit  → 反序列化 → ["09:00", "12:00"] 💀
└─ T+5  cache miss → 查 DB → 正確的 ["12:00"] ✅ （短暫正常）
```

每 5 分鐘只有第一次呼叫（cache miss → 從 DB 拿到正確值）是對的，其餘都被汙染。排程計算器 `ComputeFirstSlot` 排序後逐一嘗試，幽靈 `09:00` 搶先命中，租戶就多收一次通知。

而且 `ScheduleWeekdays`（預設 Monday ~ Friday）也有相同風險——只是剛好大部分租戶設的也是週一到週五，所以「Add 了也看不出來」。

## 為什麼這麼難發現

這個 bug 有三個特質讓它特別陰險：

1. **Redis 裡的資料是對的** — 你怎麼查快取都找不到問題
2. **DB 裡的資料也是對的** — 根源不在儲存，在反序列化的瞬間
3. **第一次呼叫是對的** — cache miss 走 DB 路徑不經過這段反序列化，你如果剛好在那個時機點測，一切正常

只有在 cache hit 時、Newtonsoft 從 JSON 字串還原物件的那一瞬間，預設值和 JSON 值會被合併。你的 breakpoint 如果下得不夠精準，根本看不到它發生。

## 修法：一行 Attribute

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

加上 `ObjectCreationHandling.Replace` 後，Newtonsoft 反序列化時會**整個丟掉既有的集合，用 JSON 的值重建**。

如果你想全域生效，也可以在 `JsonSerializerSettings` 層級設定：

```csharp
var settings = new JsonSerializerSettings
{
    ObjectCreationHandling = ObjectCreationHandling.Replace
};

var dto = JsonConvert.DeserializeObject<OverdueSettingsDto>(json, settings);
```

## 修復後不需要清 Redis

這點很重要——**問題不在快取內容，在反序列化程式碼**。

上版之後，同一份 cache JSON 反序列化就會正確，既有的錯誤 `NextSendAt` 會在下一個 Job 週期自動修正。不需要手動清 Redis、不需要跑 migration、不需要 hotfix 資料。

## 這件事教會我的

> **DTO 有預設值 + Newtonsoft.Json 反序列化 = 集合會被 Add 而不是 Replace。**

這不是 bug，是 Newtonsoft 的設計。它假設「你已經初始化好的集合，我應該往裡面加」，這在某些場景確實有用（例如合併設定檔）。但在絕大多數商業邏輯中，你期望的是 JSON 裡有什麼就是什麼——Replace，不是 Add。

幾個防禦建議：

1. **集合屬性有預設值時，一律加 `ObjectCreationHandling.Replace`**
2. **如果整個專案都用 Newtonsoft，考慮全域設定 `ObjectCreationHandling.Replace`**
3. **新專案優先用 `System.Text.Json`**——它預設就是 Replace，不會有這個坑
4. **寫單元測試時，故意讓 JSON 值和預設值不同**，驗證反序列化後是否只有 JSON 的值

有些坑不是因為你寫錯了，而是因為框架的「好意」和你的「預期」剛好相反。而這種坑，往往要等到生產環境的使用者告訴你「我每天被通知兩次」，你才會發現。

---

## 參考資料

- [Newtonsoft.Json — `ObjectCreationHandling` 設定](https://www.newtonsoft.com/json/help/html/T_Newtonsoft_Json_ObjectCreationHandling.htm)：官方文件說明 `Auto`、`Reuse`、`Replace` 三種模式的差異。
- [Newtonsoft.Json — `JsonPropertyAttribute.ObjectCreationHandling`](https://www.newtonsoft.com/json/help/html/P_Newtonsoft_Json_JsonPropertyAttribute_ObjectCreationHandling.htm)：在屬性層級覆寫反序列化行為的用法。
- [StackOverflow — Newtonsoft adding to list instead of replacing](https://stackoverflow.com/questions/24835262/json-net-is-adding-items-to-a-list-instead-of-replacing)：社群中最常見的同類問題討論，印證這是一個廣泛踩中的坑。
- [Microsoft — `System.Text.Json` 與 `Newtonsoft.Json` 差異](https://learn.microsoft.com/en-us/dotnet/standard/serialization/system-text-json/migrate-from-newtonsoft)：微軟官方遷移指南，其中提到集合處理行為的差異。
