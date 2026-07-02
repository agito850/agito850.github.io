---
title: 批次驗證從 2 分鐘降到 8 秒：一場 Task.WhenAll 的平行化實戰
published: 2026-07-02
description: "Grid OnChange 驗證在大數據量下直接 Timeout——拆解瓶頸、平行切分、保留順序，最終提速 10 倍的除錯與優化紀實。"
tags: [效能優化, C#, async, 平行處理, 踩坑]
category: 技術
draft: false
---

## 事發現場

我們的 HR SaaS 產品有一張「批次加班單」——讓主管一次幫整個部門的員工申請加班。使用者在 Grid 裡填完資料，每次異動都會觸發 OnChange 驗證，打後端的批次檢核 API。

這支 API 做兩件事：
1. **個別驗證**：每筆加班時間是否跟該員工既有的請假、公出、加班記錄衝突
2. **交叉比對**：同一個員工在這批裡有沒有時間重疊

資料少的時候一切正常。但當使用者一次填了 30 筆、50 筆，整個頁面就開始轉圈⋯⋯然後 **Timeout**。

## 第一步：搞清楚「多少筆算多」

在動手優化之前，我先去撈了生產環境的歷史使用量：

- **5 成** 的批次在 5 筆以內
- **9 成** 在 30 筆以內
- 50 筆以上是極端值

所以我定了基準：**30 筆是標準測試量，50 筆是極端壓力測試**。

## 瓶頸在哪？

分析後發現，瓶頸不在我們的橋接層，而在**產品端的驗證 API**——它把整批資料拆成單筆，逐一驗證再逐一交叉比對，全程序列執行。30 筆就要跑 30 輪驗證，耗時線性成長。

但有一個關鍵觀察：**不同員工之間的驗證互不影響**。

員工 A 的加班時間會不會跟員工 A 的請假衝突，跟員工 B 完全無關。只有「同一個員工的多筆」才有交叉比對的依賴關係。

這代表——**可以按員工分組，平行驗證**。

## 解法：Chunk + Task.WhenAll

```csharp
// 1. 按員工分組，每組最多 10 筆
var chunks = batchItems
    .GroupBy(x => x.EmployeeId)
    .SelectMany(g => g.Chunk(10))
    .ToList();

// 2. 記錄原始順序（等下要還原）
var indexedChunks = chunks
    .Select((chunk, index) => (chunk, index))
    .ToList();

// 3. 平行呼叫產品端 API
var tasks = indexedChunks.Select(async item =>
{
    var result = await _productApi.ValidateAsync(item.chunk, cancellationToken);
    return (item.index, result);
});

var results = await Task.WhenAll(tasks);

// 4. 依原始順序重組錯誤訊息
var orderedResults = results
    .OrderBy(r => r.index)
    .SelectMany(r => r.result)
    .ToList();
```

核心思路：

1. **GroupBy 員工** → 同一員工的筆數留在同一組（保留交叉比對的正確性）
2. **Chunk(10)** → 控制每組大小，避免單一請求太大
3. **Task.WhenAll** → 不同員工的驗證同時跑
4. **記錄 index + OrderBy 還原** → 錯誤訊息必須按原始 Grid 行序回顯

同時拉長了跨產品 API 的 Timeout 作為保險，並監控產品端站台的 CPU / Memory，確認 Chunk(10) 的併發量不會打爆機器。

## 實測數據

### 30 筆基準（優化前 vs 優化後）

| 環境 | 優化前（全序列） | 優化後（按員工平行） | 降幅 |
| --- | --- | --- | --- |
| UAT | ~124 秒（約 2 分鐘） | 8.16 秒 | **93.4%** |
| PP | ~114 秒（約 1.9 分鐘） | 9 秒 | **92.1%** |

### 極端測試

| 情境 | 耗時 | 結果 |
| --- | --- | --- |
| 50 人 × 1 筆（平行） | 13.82 秒 | ✅ 正常 |
| 100 人 × 1 筆（平行） | 42.55 秒 | ✅ 正常 |
| 1 人 × 50 筆（序列） | 3.8 分鐘 | ❌ Gateway Timeout |

## 平行化的天花板

注意最後一行：**1 人 × 50 筆依然 Timeout**。

因為同一個員工的多筆加班有交叉比對依賴，無法平行化。這是在方案設計時就預期到的取捨——平行化只能消除「不同員工之間」的等待時間，「同一員工內」的序列處理是邏輯上的硬限制。

最終決定不調整 Grid 行數上限，也不特別註明建議筆數。因為真實使用數據告訴我們，9 成的批次在 30 筆以內、且通常是多人少筆的場景——剛好是平行化效果最好的甜蜜點。

## 為什麼不在橋接層自己實作驗證邏輯？

有考慮過，但否決了。

橋接層的定位是**轉接器**——負責格式轉換、錯誤包裝、觸發通知，不應該包含商業邏輯。加班時間是否與請假衝突、怎樣算衝突，這些規則屬於 HR 產品端的職責。在橋接層重寫一份驗證邏輯，等於違反架構職責分離，而且一旦產品端規則變更，橋接層要同步改——這是維護的噩夢。

最終選擇平行切分的原因：
1. **不動產品端代碼**：改動範圍控制在橋接層
2. **風險最低**：驗證邏輯不變，只調整呼叫方式
3. **數據支撐**：已確認不同員工間驗證互不影響

## 這件事教會我的

> **優化的第一步不是寫 Code，是撈數據。**

如果我沒先看使用量分布，可能會花時間去優化「1 人 × 50 筆」的極端場景（那條路是死胡同）。正因為數據告訴我「9 成是多人少筆」，我才能自信地選擇按員工平行化這條路。

另一個收穫是：**平行化不是萬能的，但知道它的天花板在哪，反而讓你更有底氣**。面對「同一員工多筆」的限制，我可以清楚說明「這是邏輯依賴造成的硬限制，不是技術做不到」，而不是含糊地說「還在優化中」。

效能優化最怕的不是難，是不知道自己在優化什麼。

---

## 參考資料

- [Microsoft — `Task.WhenAll`](https://learn.microsoft.com/en-us/dotnet/api/system.threading.tasks.task.whenall)：官方文件說明如何等待多個非同步工作同時完成。
- [Microsoft — `Chunk` (LINQ)](https://learn.microsoft.com/en-us/dotnet/api/system.linq.enumerable.chunk)：.NET 6 引入的分批方法，將序列切成固定大小的子序列。
- [Microsoft — Asynchronous programming patterns](https://learn.microsoft.com/en-us/dotnet/csharp/asynchronous-programming/)：async/await 的最佳實踐與常見陷阱。
