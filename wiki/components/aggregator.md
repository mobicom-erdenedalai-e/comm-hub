# Aggregator

**File:** `src/lib/aggregator.ts`
**Purpose:** Calls all configured connectors in parallel and merges their results into an ActivityBundle.
**Created:** 2026-04-24

## What it does
Accepts an AggregatorConfig (which connectors to call and their configs), calls them via Promise.allSettled, and produces a unified ActivityBundle with items sorted by date. Connectors that return an error field go into sourcesFailed; successful ones go into sourcesUsed.

## Interface
```typescript
export type AggregatorConfig = {
  github?: { token: string; owner: string; repo: string }
  jira?: { baseUrl: string; email: string; apiToken: string; projectKey: string }
}
export async function aggregate(clientId: string, config: AggregatorConfig, dateRange: DateRange): Promise<ActivityBundle>
```

## Dependencies
- [[components/connectors/github]] — GitHub commits/PRs
- [[components/connectors/jira]] — Jira tickets
- [[components/types]] — ActivityBundle, DateRange

## Known limitations
- Only GitHub and Jira connectors currently wired. Slack/Meeting added in Tasks 17-18.
