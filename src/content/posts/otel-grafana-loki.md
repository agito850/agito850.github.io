---
title: 從人工翻 Log 到一鍵查詢：OpenTelemetry + Grafana Loki 可觀測性串接實戰
published: 2026-07-02
description: "線上 Bug 排查全靠人工翻 Log，從回報到定位動輒半小時——串接 OpenTelemetry + Grafana Loki，讓 Log 自動帶上使用者身分，8 種來源統一查詢。"
tags: [OpenTelemetry, Grafana, Loki, 可觀測性, C#]
category: 技術
draft: false
---

## 排查一個 Bug 要多久？

在串接可觀測性工具之前，我們排查線上 Bug 的流程長這樣：

```
1. PM/客服回報 Bug（Jira 單）
2. RD 看完描述，試著在測試環境復現
3. 打開 F12 判斷是前端還是後端的問題
4. 如果是後端 → 確認 API 路徑
5. 去 ELK 或 Application Insights 搜 Log
6. 用關鍵字碰運氣找 Stack Trace
7. 找到錯誤後，回到專案定位程式碼
8. 理解上下文，推斷根因
```

一個流程走下來，順利的話 30 分鐘，不順利的話一個下午。

最浪費時間的環節是 **步驟 5~6**：Log 散落在不同來源（DB Table、ELK、Console、Application Insights⋯⋯），每個來源的查詢方式不同，搜尋條件也不統一。你可能知道是哪個租戶的問題，但不知道這個租戶的 Log 在哪個系統裡。

## 目標：一個地方查所有 Log，用使用者身分當查詢條件

我想做到的事很單純：

1. **所有 Log 來源統一到 Grafana** — 不再需要跳來跳去
2. **每一筆 Log 自動帶上使用者身分** — TenantCode、EmployeeCode，不需要手動 Trace
3. **用使用者身分直接查詢** — 「租戶 A 的員工 B 在過去 1 小時做了什麼」，一個查詢搞定

## 架構：OpenTelemetry → Grafana Loki

```
ASP.NET Core App
    │
    ├── AccessLog（HTTP 請求進出）
    ├── 應用程式 Log（ILogger）
    └── 其他 Log 來源（共 8 種）
    │
    ▼
OpenTelemetry SDK
    │
    ├── Enrich：從 JWT Token 自動注入 TenantCode / EmployeeCode
    └── Filter：移除 / 和 /health 等噪音請求
    │
    ▼
Exporter → Grafana Loki
    │
    ▼
Grafana Dashboard（統一查詢介面）
```

### 關鍵一：Log Enrichment（自動注入使用者身分）

這是整個方案最有價值的部分。我們的 API 都需要 JWT Token 認證，Token 裡帶有 `TenantCode` 和 `EmployeeCode`。透過 OpenTelemetry 的 Enrich 機制，讓每一筆 Log 自動戴上這些資訊：

```csharp
builder.Services.AddOpenTelemetry()
    .WithLogging(logging =>
    {
        logging.AddOtlpExporter(options =>
        {
            options.Endpoint = new Uri(lokiEndpoint);
        });
    });

// 自訂 Enricher：從 HttpContext 的 JWT Token 解出使用者資訊
public class UserContextEnricher : ILogEnricher
{
    public void Enrich(LogRecord record, HttpContext context)
    {
        var tenantCode = context.User.FindFirst("TenantCode")?.Value;
        var employeeCode = context.User.FindFirst("EmployeeCode")?.Value;

        if (tenantCode is not null)
            record.Attributes.Add("tenant_code", tenantCode);
        if (employeeCode is not null)
            record.Attributes.Add("employee_code", employeeCode);
    }
}
```

從此，每一筆 Log 都自動帶有使用者身分，不需要開發者在每個 `_logger.LogInformation(...)` 裡手動加。

### 關鍵二：過濾噪音

站台健康檢查每隔幾秒就會打 `/health`，負載平衡器也會定期打 `/`。這些請求產生的 Log 量巨大但毫無價值，會嚴重干擾查詢結果。

```csharp
// 過濾健康檢查和根路徑的 AccessLog
builder.Services.AddOpenTelemetry()
    .WithTracing(tracing =>
    {
        tracing.AddAspNetCoreInstrumentation(options =>
        {
            options.Filter = context =>
            {
                var path = context.Request.Path.Value;
                return path != "/" && path != "/health";
            };
        });
    });
```

這個過濾看似小事，但實測下來**減少了約 70% 的 Log 量**，Grafana 查詢速度也明顯提升。

### 關鍵三：8 種 Log 來源統一

我們的表單引擎內部有自己的 LogFactory，不同模組的 Log 走不同的路徑：

| 來源 | 原本的去處 | 統一後 |
| --- | --- | --- |
| HTTP AccessLog | Application Insights | Grafana Loki |
| 應用程式 ILogger | Console + ELK | Grafana Loki |
| 表單引擎內部 Log | DB Table | Grafana Loki |
| 排程 Job Log | DB Table | Grafana Loki |
| 跨產品通訊 Log | 各自的 Log 系統 | Grafana Loki |
| ⋯⋯（共 8 種） | 散落各處 | Grafana Loki |

統一之後，在 Grafana 的 Explore 頁面用 LogQL 就能跨來源查詢：

```logql
{service="form-engine"} | json | tenant_code="TENANT_A" | employee_code="EMP001"
```

一行查詢，拿到這位員工在所有 Log 來源裡的完整操作軌跡。

## 實際效果：Before vs After

| | Before | After |
|---|---|---|
| 查 Log 的工具 | ELK + AppInsights + DB 手動查 | Grafana 統一入口 |
| 查詢條件 | API 路徑、時間範圍、碰運氣 | TenantCode + EmployeeCode |
| 確認「是誰的問題」 | 需要比對多個系統的時間戳 | Log 自動帶身分，直接查 |
| 排查一個 Bug | 30 分鐘 ~ 半天 | 通常 5~10 分鐘 |

## 沒做的部分：Traces 和 Metrics

OpenTelemetry 有三大支柱：**Logs、Traces、Metrics**。這次我只做了 **Logs**。

原因很務實：
- **Traces**（分散式追蹤）：我們的服務呼叫鏈不算複雜，目前 Log 裡的 CorrelationId 已經能串聯請求，引入完整的 Trace 系統 ROI 不高
- **Metrics**（指標監控）：已經有 Application Insights 和 Azure Workbook 在做，短期不需要重複建設

可觀測性不是一次到位的事，先把最痛的點（Log 查詢）解決，其他的等需求浮現再補。

## 延伸：AI 輔助追查

Log 統一到 Grafana Loki 之後，我進一步開發了一個 AI 輔助追查工具。它的工作流程：

```
Jira Bug 單
    ↓ AI 讀取 Bug 描述，提取關鍵資訊（租戶、員工、時間範圍）
Grafana Loki API
    ↓ AI 用 LogQL 查詢相關 Log
DB 資料
    ↓ AI 撈取實際業務資料比對
專案原始碼
    ↓ AI 定位可能的問題程式碼
除錯建議
    ↓ AI 產出分析報告
RD Review
```

RD 從「自己走完全流程」變成「Review AI 的盤點結果」。這個工具能運作的前提，就是 Grafana Loki 提供了統一的 API 查詢介面——如果 Log 還是散落在 5 個系統裡，AI 也串不起來。

## 這件事教會我的

> **可觀測性的核心價值不是「看得到更多」，是「找得到更快」。**

Log 從來不缺。ELK 有、Application Insights 有、DB 裡也有。問題是當你需要找某個特定問題的時候，你不知道該去哪裡找、用什麼條件找。

做可觀測性不是把所有東西都監控起來，而是回答一個問題：**「當 Bug 來的時候，我需要哪些資訊、要花多久才能拿到？」**

如果答案是「30 分鐘在 5 個系統裡碰運氣」，那就值得花時間統一。如果答案是「3 分鐘就能定位」，那就不需要再加東西。

可觀測性是手段，不是目的。

---

## 參考資料

- [OpenTelemetry .NET — Getting Started](https://opentelemetry.io/docs/languages/dotnet/getting-started/)：在 .NET 專案中串接 OpenTelemetry 的官方指南。
- [Grafana Loki — Documentation](https://grafana.com/docs/loki/latest/)：Loki 的架構概念、部署方式與 LogQL 查詢語法。
- [Grafana — LogQL: Log query language](https://grafana.com/docs/loki/latest/query/)：Loki 的查詢語言完整語法參考。
- [Microsoft — Logging in .NET Core and ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/logging/)：.NET 的日誌框架設計與最佳實踐。
- [OpenTelemetry — Observability Primer](https://opentelemetry.io/docs/concepts/observability-primer/)：可觀測性三大支柱（Logs、Traces、Metrics）的概念入門。
