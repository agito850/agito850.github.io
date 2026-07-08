---
title: "15 Lines of Reflection Kill 194 Lines of Manual Registration: When DI Registration Becomes a Ritual"
published: 2026-07-02
description: "Every new DataSource meant manually adding a line of DI registration — forget it and you have a bug you only find in production. Solved once with an assembly scan."
tags: [C#, DI, Reflection, Architecture, Refactoring]
category: Tech
draft: false
---

## Registration code full of ritual

Our form engine has a DataSource mechanism — each form, at various stages (open, change, submit…), triggers a corresponding Action, and the backend runs the business logic. Each Action implements the same interface `IDataSourceAction`, then gets registered in the DI container in a Keyed fashion:

```csharp
// Startup.cs (excerpt)
services.AddKeyedTransient<IDataSourceAction, LeaveForm_DS01>("LeaveForm_DS01");
services.AddKeyedTransient<IDataSourceAction, LeaveForm_DS02>("LeaveForm_DS02");
services.AddKeyedTransient<IDataSourceAction, LeaveForm_DS03>("LeaveForm_DS03");
services.AddKeyedTransient<IDataSourceAction, OvertimeForm_DS01>("OvertimeForm_DS01");
services.AddKeyedTransient<IDataSourceAction, OvertimeForm_DS02>("OvertimeForm_DS02");
// ... 189 more lines ...
```

194 lines, all like this. Every line's pattern is identical: same interface, same lifetime, and the Key is just the class name.

## The real problem isn't the line count — it's "forgetting to add it"

Lots of lines is just ugly; the real danger is — **every new Action, the developer has to remember to come here and add a line manually**.

What happens if you forget? Compilation doesn't error, and if tests don't cover it, they don't catch it either. Until production, when a user operates the form and triggers that Action, the DI container can't find the corresponding Key and throws `InvalidOperationException` outright.

This isn't a hypothetical risk — we did get bitten by a "forgot to register" bug.

## The 15-line fix

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

Usage is a single line:

```csharp
// Startup.cs
services.AddDataSourceActions();
```

What it does is simple:

1. **Scan all types** in the current assembly
2. **Filter** the non-abstract classes implementing `IDataSourceAction`
3. **Auto-register** them into the DI container with the class name as Key

From then on, adding an Action only requires creating a class implementing `IDataSourceAction` — no more "registering" anywhere.

## Why use the class name as the Key?

Because when the form engine triggers an Action, it already used the **class name** as the identifier to pull from the DI container. So Key = class name is a continuation of existing behavior, not a newly invented convention.

```csharp
// How the form engine triggers (simplified)
var action = serviceProvider.GetKeyedService<IDataSourceAction>(actionName);
await action.ExecuteAsync(context, cancellationToken);
```

`actionName` is the value set in the form designer, mapping one-to-one to the class name.

## The ripple effect

After this pattern shipped, the team directly referenced the same approach when building mail templates (MailBodyBuilder), eliminating another batch of manual registration code.

```csharp
// Same pattern, just swap the interface to reuse
services.AddKeyedServices<IMailBodyBuilder>();
```

The greatest value of a good convention isn't how many lines it itself saves — it's that it establishes a **pattern the team can replicate**.

## When should you NOT do this?

Reflection scanning isn't a cure-all. A few unsuitable scenarios:

1. **Key ≠ class name**: if the Key has its own naming logic (e.g. version, tenant code), Reflection can't derive it
2. **Different lifetimes**: if some need Singleton and some Scoped, forcing Transient will break things
3. **Cross-assembly**: `GetExecutingAssembly()` only scans the current assembly; if Actions are spread across multiple projects you need `AppDomain` or an explicitly specified assembly
4. **Startup-performance-sensitive**: Reflection has a startup cost; with thousands of types you may need a Source Generator

Our scenario happened to meet all of them: Key = class name, unified lifetime, same assembly, type count in the hundreds — so Reflection was the simplest, most direct solution.

## What this taught me

> **The best abstraction makes "the correct way" the "only way".**

The problem with manual registration isn't that it's "tedious" — it's that "forgetting is legal": the compiler doesn't stop you, tests don't necessarily catch it, and code review doesn't necessarily notice a missing line.

After auto-scanning, the developer only has to do one thing: **create a class implementing `IDataSourceAction`**. Nothing to add in any other file. The correct way is the only way — no room to "forget".

194 lines of code weren't deleted — they were **designed away**.

---

## References

- [Microsoft — Assembly.GetTypes()](https://learn.microsoft.com/en-us/dotnet/api/system.reflection.assembly.gettypes): getting all types defined in an assembly.
- [Microsoft — Keyed services in .NET DI](https://learn.microsoft.com/en-us/dotnet/core/extensions/dependency-injection#keyed-services): the Keyed DI service registration introduced in .NET 8.
- [Microsoft — Dependency injection guidelines](https://learn.microsoft.com/en-us/dotnet/core/extensions/dependency-injection-guidelines): DI best practices, including lifetime choices and registration patterns.
