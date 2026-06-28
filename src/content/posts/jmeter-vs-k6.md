---
title: 壓測工具選型：JMeter vs k6，老牌 GUI 對決現代 Code-first
published: 2026-06-28
description: "從腳本、資源效率、協定支援到 CI/CD，比較兩大負載測試工具，並給出實戰選型建議。"
tags: [壓力測試, JMeter, k6, 效能, DevOps]
category: 技術
draft: false
---

要驗證系統扛不扛得住流量，**負載測試（Load Testing）** 是繞不開的一關。這個領域有兩個常被拿來比較的名字：老牌的 **Apache JMeter**，和近年聲量很高的 **k6**。

它們解決的是同一個問題，但個性南轅北轍——一個是「點點點」的 GUI 老將，一個是「寫程式」的現代派。這篇就從實戰角度把它們攤開來比。

## 先認識這兩位

### Apache JMeter
2000 年代就存在的 **Java** 老牌工具，由 Apache 維護。最大特色是 **GUI 優先**：你在圖形介面拖拉出 Thread Group、Sampler、Listener，組成測試計畫（存成 `.jmx` 的 XML 檔）。協定支援極廣、外掛生態龐大，是企業壓測的常見預設選擇。

### k6
由 **Grafana Labs** 維護（現在叫 Grafana k6）的現代工具，核心用 **Go** 寫成。最大特色是 **Code-first**：你用 **JavaScript** 寫測試腳本，從 CLI 執行。主打開發者體驗與 CI/CD 整合。

## 腳本長什麼樣？

這是兩者最直觀的差異。k6 的測試就是一段 JS：

```js
import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  vus: 50, // 50 個虛擬使用者
  duration: "30s",
};

export default function () {
  const res = http.get("https://test.k6.io");
  check(res, { "status is 200": (r) => r.status === 200 });
  sleep(1);
}
```

純文字、能進 Git、能 Code Review、能在 CI 跑。而 JMeter 的 `.jmx` 是 GUI 產生的 XML——用工具開很直覺，但**直接看 diff 幾乎不可讀**，這在版控協作上是個痛點。

## 資源效率：差距很有感

這是 k6 最常被稱道的一點。k6 的每個虛擬使用者（VU）跑在 **Go goroutine** 上，比 JMeter 的 **Java 執行緒** 輕量得多：

- 單台 k6 模擬 **50,000+ VU** 大約只吃 ~500MB RAM
- JMeter 要達到同樣負載，往往需要 **10–20GB RAM** 或乾脆架分散式叢集

這不只是省錢——當**壓測機本身不會先成為瓶頸**時，量到的數字才更可信。

> 平心而論：現代 JVM 調校後，JMeter 的資源表現已比舊 benchmark 好不少，差距有縮小，但「單機能壓出的量」k6 仍明顯領先。

## 協定支援：JMeter 的主場

如果你要壓的不只是 HTTP，JMeter 的廣度很難被取代：

| | JMeter | k6 |
| --- | --- | --- |
| 原生協定 | HTTP、JDBC、JMS、FTP、LDAP、gRPC、MQTT… | HTTP、WebSocket、gRPC |
| 擴充方式 | 龐大的 plugin 生態 | `xk6` 擴充框架（SQL、Kafka 等社群擴充） |

要壓資料庫（JDBC）、訊息佇列（JMS）這類非 HTTP 場景，JMeter 開箱即用；k6 則多半要靠 `xk6` 自行編譯擴充。

## 可觀測性 & CI/CD

- **可觀測性**：兩者其實殊途同歸，最終都常**串到 InfluxDB + Grafana** 看儀表板（JMeter 用 Backend Listener、k6 用 `--out`）。k6 另有 Grafana Cloud k6 的託管方案。
- **CI/CD**：k6 是 CLI + JS，丟進 GitHub Actions 幾乎是天生契合；JMeter 也能跑 headless（`-n` 非 GUI 模式），但相對笨重。

## 怎麼選？

| 你的情境 | 建議 |
| --- | --- |
| 團隊是工程師、要進 CI/CD、主要壓 HTTP API | **k6**：腳本即程式碼、輕量、現代 |
| 要壓多種協定（JDBC/JMS/FTP…）、需要 GUI、非工程背景成員多 | **JMeter**：協定最全、外掛最多、入門門檻低 |
| 大型企業、legacy 系統、複雜協定需求 | **JMeter** 仍是最完整的選擇 |
| 從零開始學、想要可遷移的現代技能 | 先學 **k6** |

一句話總結：

> **JMeter 是「協定全、靠 GUI」的老將；k6 是「輕量、Code-first、CI 友善」的現代派。** 沒有絕對的贏家，只有適不適合你的系統與團隊。壓 HTTP API 又重視工程化 → k6；協定雜、要圖形化 → JMeter。

---

## 參考資料

- [Comparing k6 and JMeter for load testing — Grafana Labs](https://grafana.com/blog/k6-vs-jmeter-comparison/)：官方（k6 維護方）的對比說明，含腳本與架構差異。
- [Grafana k6 官方文件](https://grafana.com/docs/k6/latest/)：k6 的安裝、腳本 API、執行與輸出。
- [Apache JMeter 官方網站](https://jmeter.apache.org/)：JMeter 的功能、元件與分散式測試說明。
- [Load Testing Tools: JMeter, k6, Gatling, Locust Compared — Ranorex](https://www.ranorex.com/blog/load-testing-tools/)：多工具橫向比較，可一併參考 Gatling / Locust。
