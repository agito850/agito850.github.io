---
title: "From Manually Grepping Logs to One-Click Queries: An OpenTelemetry + Grafana Loki Observability Story"
published: 2026-02-21
description: "Debugging production bugs meant manually digging through logs, often half an hour from report to root cause — wiring up OpenTelemetry + Grafana Loki so logs auto-carry user identity and 8 sources query as one."
tags: [OpenTelemetry, Grafana, Loki, Observability, C#]
category: Tech
draft: false
---

## How long does it take to debug one bug?

Before wiring up observability tooling, our process for debugging a production bug looked like this:

```
1. PM/support reports a bug (Jira ticket)
2. RD reads the description, tries to reproduce in a test environment
3. Opens F12 to decide whether it's a frontend or backend issue
4. If backend → confirm the API path
5. Search logs in ELK or Application Insights
6. Hunt for a stack trace by keyword, hoping to get lucky
7. Once the error is found, go back to the project to locate the code
8. Understand the context, infer the root cause
```

One full pass: 30 minutes if smooth, a whole afternoon if not.

The most time-wasting part is **steps 5–6**: logs are scattered across different sources (DB tables, ELK, Console, Application Insights…), each queried differently, with inconsistent search conditions. You might know which tenant has the problem, but not which system that tenant's logs live in.

## The goal: one place to query all logs, using user identity as the condition

What I wanted was simple:

1. **Unify all log sources into Grafana** — no more jumping around
2. **Every log auto-carries user identity** — TenantCode, EmployeeCode, no manual tracing needed
3. **Query directly by user identity** — "what did employee B of tenant A do in the past hour", done in one query

## Architecture: OpenTelemetry → Grafana Loki

```
ASP.NET Core App
    │
    ├── AccessLog (HTTP request in/out)
    ├── application logs (ILogger)
    └── other log sources (8 total)
    │
    ▼
OpenTelemetry SDK
    │
    ├── Enrich: auto-inject TenantCode / EmployeeCode from the JWT token
    └── Filter: remove noise requests like / and /health
    │
    ▼
Exporter → Grafana Loki
    │
    ▼
Grafana Dashboard (unified query UI)
```

### Key #1: Log Enrichment (auto-inject user identity)

This is the most valuable part of the whole solution. Our APIs all require JWT authentication, and the token carries `TenantCode` and `EmployeeCode`. Via OpenTelemetry's Enrich mechanism, every log automatically wears this info:

```csharp
builder.Services.AddOpenTelemetry()
    .WithLogging(logging =>
    {
        logging.AddOtlpExporter(options =>
        {
            options.Endpoint = new Uri(lokiEndpoint);
        });
    });

// Custom Enricher: parse user info from the HttpContext JWT token
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

From then on, every log automatically carries user identity — no need for developers to manually add it to each `_logger.LogInformation(...)`.

### Key #2: filter out noise

Health checks hit `/health` every few seconds, and the load balancer periodically hits `/`. These requests produce huge but worthless log volume, badly polluting query results.

```csharp
// Filter out health-check and root-path AccessLog
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

This filter seems trivial, but in practice it **cut log volume by about 70%**, and Grafana query speed noticeably improved.

### Key #3: unify 8 log sources

Our form engine has its own internal LogFactory, and different modules' logs took different paths:

| Source | Original destination | After unifying |
| --- | --- | --- |
| HTTP AccessLog | Application Insights | Grafana Loki |
| Application ILogger | Console + ELK | Grafana Loki |
| Form-engine internal log | DB table | Grafana Loki |
| Scheduled job log | DB table | Grafana Loki |
| Cross-product comms log | Each system's own logs | Grafana Loki |
| …(8 total) | Scattered everywhere | Grafana Loki |

After unifying, Grafana's Explore page can query across sources with LogQL:

```logql
{service="form-engine"} | json | tenant_code="TENANT_A" | employee_code="EMP001"
```

One line, and you get this employee's complete operation trail across all log sources.

## Real effect: Before vs After

| | Before | After |
|---|---|---|
| Log tools | ELK + AppInsights + manual DB queries | Grafana single entry |
| Query conditions | API path, time range, luck | TenantCode + EmployeeCode |
| Confirming "whose problem" | Cross-reference timestamps across systems | Logs auto-carry identity, query directly |
| Debugging one bug | 30 min ~ half a day | usually 5–10 min |

## What I didn't do: Traces and Metrics

OpenTelemetry has three pillars: **Logs, Traces, Metrics**. This time I only did **Logs**.

The reason is pragmatic:
- **Traces** (distributed tracing): our service call chains aren't that complex, and the CorrelationId in logs already links requests, so a full trace system has low ROI right now
- **Metrics** (metric monitoring): Application Insights and Azure Workbook already do this, no need to rebuild in the short term

Observability isn't an all-at-once thing — solve the most painful point first (log querying), and fill in the rest as needs emerge.

## Extension: AI-assisted investigation

After unifying logs into Grafana Loki, I went further and built an AI-assisted investigation tool. Its workflow:

```
Jira bug ticket
    ↓ AI reads the bug description, extracts key info (tenant, employee, time range)
Grafana Loki API
    ↓ AI queries relevant logs with LogQL
DB data
    ↓ AI pulls actual business data to compare
Project source code
    ↓ AI locates the likely problem code
Debug suggestions
    ↓ AI produces an analysis report
RD Review
```

RD went from "walking the whole process themselves" to "reviewing the AI's findings". The prerequisite for this tool is that Grafana Loki provides a unified query API — if logs were still scattered across 5 systems, the AI couldn't stitch them together either.

## What this taught me

> **The core value of observability isn't "seeing more" — it's "finding faster".**

Logs were never lacking. ELK has them, Application Insights has them, the DB has them too. The problem is that when you need to find a specific issue, you don't know where to look or what conditions to use.

Doing observability isn't monitoring everything — it's answering one question: **"When a bug comes, what info do I need, and how long does it take to get it?"**

If the answer is "30 minutes of luck across 5 systems", it's worth unifying. If the answer is "3 minutes to locate", you don't need to add anything.

Observability is a means, not an end.

---

## References

- [OpenTelemetry .NET — Getting Started](https://opentelemetry.io/docs/languages/dotnet/getting-started/): the official guide to wiring OpenTelemetry into a .NET project.
- [Grafana Loki — Documentation](https://grafana.com/docs/loki/latest/): Loki's architecture concepts, deployment, and LogQL query syntax.
- [Grafana — LogQL: Log query language](https://grafana.com/docs/loki/latest/query/): the complete syntax reference for Loki's query language.
- [Microsoft — Logging in .NET Core and ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/logging/): the design and best practices of .NET's logging framework.
- [OpenTelemetry — Observability Primer](https://opentelemetry.io/docs/concepts/observability-primer/): an intro to the three pillars of observability (Logs, Traces, Metrics).
