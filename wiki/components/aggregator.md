# Aggregator

**File:** `src/lib/aggregator.ts`
**Last updated:** 2026-04-27

## Purpose

Orchestrates all configured connectors in parallel and merges their results into a single `ActivityBundle`. Uses `Promise.allSettled` so one failing connector never blocks the others.

## Interface

```typescript
aggregate(clientId: string, config: AggregatorConfig, dateRange: DateRange): Promise<ActivityBundle>
```

### AggregatorConfig

```typescript
type AggregatorConfig = {
  github?: { token: string; owner: string; repo: string }
  jira?:   { baseUrl: string; email: string; apiToken: string; projectKey: string }
  slack?:  { token: string; channelId: string }
}
```

Only connectors with a config entry are called.

## Failure Handling

Each connector result is checked for the optional `error` field:
- `error` present → source added to `bundle.sourcesFailed`
- `error` absent → items merged into bundle, source added to `bundle.sourcesUsed`
- Promise rejects entirely → source pushed as `'unknown'` into `sourcesFailed`

The prompt engine and UI both surface `sourcesFailed` so the user knows which integrations were unavailable.

## Output: ActivityBundle

```typescript
{
  clientId: string
  dateRange: DateRange
  items: ActivityItem[]   // sorted by date desc
  sourcesUsed: string[]
  sourcesFailed: string[]
}
```

## Related

- [[components/connectors/github]], [[components/connectors/jira]], [[components/connectors/slack]], [[components/connectors/meeting]]
- [[patterns/connector-pattern]]
- [[api/generate]] — calls aggregate() on every request
