---
title: 15 行 Reflection 幹掉 194 行手動註冊：當 DI 註冊變成一種儀式
published: 2026-07-02
description: "每新增一支 DataSource 就要手動加一行 DI 註冊，忘了就是上線後才發現的 Bug——用 Assembly 掃描一次解決。"
tags: [C#, DI, Reflection, 架構, 重構]
category: 技術
draft: false
---

## 儀式感滿滿的註冊代碼

我們的表單引擎有一個 DataSource 機制——每張表單在不同階段（開啟、異動、送簽⋯⋯）會觸發對應的 Action，由後端執行商業邏輯。每支 Action 都實作同一個介面 `IDataSourceAction`，然後在 DI Container 裡用 Keyed 方式註冊：

```csharp
// Startup.cs（節錄）
services.AddKeyedTransient<IDataSourceAction, LeaveForm_DS01>("LeaveForm_DS01");
services.AddKeyedTransient<IDataSourceAction, LeaveForm_DS02>("LeaveForm_DS02");
services.AddKeyedTransient<IDataSourceAction, LeaveForm_DS03>("LeaveForm_DS03");
services.AddKeyedTransient<IDataSourceAction, OvertimeForm_DS01>("OvertimeForm_DS01");
services.AddKeyedTransient<IDataSourceAction, OvertimeForm_DS02>("OvertimeForm_DS02");
// ... 再來 189 行 ...
```

194 行，全長這樣。每一行的 pattern 完全一致：介面一樣、生命週期一樣、Key 就是類別名稱。

## 真正的問題不是行數，是「忘記加」

行數多只是不好看，真正危險的是——**每新增一支 Action，開發者必須記得來這裡手動加一行**。

忘了會怎樣？編譯不會報錯，測試如果沒覆蓋到也抓不到。直到上線後，使用者操作表單時觸發那支 Action，DI Container 找不到對應的 Key，直接噴 `InvalidOperationException`。

這不是假設性風險——我們確實因為「忘記註冊」吃過 Bug。

## 15 行解法

```csharp
public static class DataSourceActionExtensions
{
    public static IServiceCollection AddDataSourceActions(this IServiceCollection services)
    {
        var actionTypes = Assembly.GetExecutingAssembly()
            .GetTypes()
            .Where(t => !t.IsAbstract
                     && !t.IsInterface
                     && typeof(IDataSourceAction).IsAssignableFrom(t));

        foreach (var type in actionTypes)
        {
            services.AddKeyedTransient(typeof(IDataSourceAction), type.Name, type);
        }

        return services;
    }
}
```

使用時只需一行：

```csharp
// Startup.cs
services.AddDataSourceActions();
```

做的事情很單純：

1. **掃描當前 Assembly** 的所有型別
2. **過濾**出實作 `IDataSourceAction` 的非抽象類別
3. **以類別名稱為 Key** 自動註冊到 DI Container

從此，新增 Action 只需要建立一個實作 `IDataSourceAction` 的類別，不用再去任何地方「登記」。

## 為什麼用類別名稱當 Key？

因為我們的表單引擎在觸發 Action 時，本來就是用**類別名稱**當識別碼去 DI Container 撈的。所以 Key = 類別名稱是現有行為的延續，不是新發明的 Convention。

```csharp
// 表單引擎觸發時的呼叫方式（簡化）
var action = serviceProvider.GetKeyedService<IDataSourceAction>(actionName);
await action.ExecuteAsync(context, cancellationToken);
```

`actionName` 就是設定在表單設計器裡的值，跟類別名稱一一對應。

## 擴散效應

這個模式上線後，團隊在做信件模板（MailBodyBuilder）時直接參考同樣的做法，又消除了一批手動註冊代碼。

```csharp
// 同樣的 pattern，換個介面就能複用
services.AddKeyedServices<IMailBodyBuilder>();
```

一個好的 Convention，最大的價值不是它本身省了多少行，而是它建立了一個**團隊可以複製的模式**。

## 什麼時候不該這樣做？

Reflection 掃描不是萬能解。幾個不適合的場景：

1. **Key 不等於類別名稱**：如果 Key 有自己的命名邏輯（例如版本號、租戶碼），Reflection 掃不出來
2. **不同的生命週期**：如果有些要 Singleton、有些要 Scoped，統一 Transient 會出事
3. **跨 Assembly**：`GetExecutingAssembly()` 只掃當前組件，如果 Action 散落在多個專案需要改用 `AppDomain` 或明確指定 Assembly
4. **啟動效能敏感**：Reflection 在啟動時有成本，如果型別數量上千可能需要考慮 Source Generator

我們的場景剛好全部符合：Key = 類別名稱、生命週期統一、同一個 Assembly、型別數量在百級——所以 Reflection 是最簡單直接的解法。

## 這件事教會我的

> **最好的抽象，是讓「正確的做法」變成「唯一的做法」。**

手動註冊的問題不在於「麻煩」，而在於「忘記是合法的」——編譯器不攔你、測試不一定抓得到、Code Review 也不一定注意到少了一行。

自動掃描之後，開發者只需要做一件事：**建立一個實作 `IDataSourceAction` 的類別**。不需要去別的檔案加任何東西。正確的做法就是唯一的做法，沒有「忘記」的空間。

194 行代碼不是被刪掉了，是被**設計掉了**。

---

## 參考資料

- [Microsoft — Assembly.GetTypes()](https://learn.microsoft.com/en-us/dotnet/api/system.reflection.assembly.gettypes)：取得 Assembly 中定義的所有型別。
- [Microsoft — Keyed services in .NET DI](https://learn.microsoft.com/en-us/dotnet/core/extensions/dependency-injection#keyed-services)：.NET 8 引入的 Keyed DI 服務註冊方式。
- [Microsoft — Dependency injection guidelines](https://learn.microsoft.com/en-us/dotnet/core/extensions/dependency-injection-guidelines)：DI 最佳實踐，包含生命週期選擇與註冊模式。
