# Pattern: Connector Module

**First seen:** `src/lib/connectors/github.ts`
**Date:** 2026-04-24

## Description

Each data source gets its own module. Every connector exports a single async `fetch*Activity(config, dateRange)` function that returns a `ConnectorResult` — never throws. Errors are captured and returned in the `error` field so the [[components/aggregator]] can continue with partial data.

## Interface

```typescript
// Every connector follows this exact shape
export async function fetch<Source>Activity(
  config: <Source>Config,
  dateRange: DateRange
): Promise<ConnectorResult>

// ConnectorResult from src/lib/types.ts
type ConnectorResult = {
  source: 'github' | 'jira' | 'slack' | 'meeting'
  items: ActivityItem[]
  error?: string   // set instead of throwing
}
```

## Why never throw

The aggregator calls all connectors in parallel via `Promise.allSettled`. If a connector throws, it becomes a rejected promise. Returning `{ error }` instead keeps all results in the `fulfilled` bucket, making partial-failure handling uniform.

## When to use

Any time you add a new data source to CommHub, create a new file in `src/lib/connectors/` following this pattern. Register it in [[components/aggregator]] by adding it to `AggregatorConfig` and calling it inside `aggregate()`.
