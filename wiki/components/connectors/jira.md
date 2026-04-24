# Jira Connector

**File:** `src/lib/connectors/jira.ts`
**Purpose:** Fetches completed Jira ticket activity via Jira REST API v3.
**Created:** 2026-04-24

## What it does
Queries Jira Cloud's search endpoint with a JQL filter for Done tickets updated within the date range. Normalizes to ActivityItem[].

## Interface
```typescript
export type JiraConfig = { baseUrl: string; email: string; apiToken: string; projectKey: string }
export async function fetchJiraActivity(config: JiraConfig, dateRange: DateRange): Promise<ConnectorResult>
```

## Dependencies
- [[components/types]] — ActivityItem, ConnectorResult, DateRange

## Known limitations
- Jira Cloud only (Basic auth with API token)
- Capped at 50 results per query
