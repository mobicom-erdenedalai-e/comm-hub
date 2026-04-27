# Jira Connector

**File:** `src/lib/connectors/jira.ts`
**Last updated:** 2026-04-27

## Purpose

Fetches recently completed Jira issues via the REST API v3 using JQL.

## Interface

```typescript
fetchJiraActivity(config: JiraConfig, dateRange: DateRange): Promise<ConnectorResult>
```

```typescript
type JiraConfig = {
  baseUrl: string      // e.g. https://myorg.atlassian.net
  email: string
  apiToken: string
  projectKey: string
}
```

## Query

JQL: `project = {KEY} AND statusCategory = Done AND updated >= "{from}" ORDER BY updated DESC`

Uses HTTP Basic auth (`email:apiToken` base64).

## Error handling

Never throws. Returns error field on network or API failure.

## Related

- [[patterns/connector-pattern]]
- [[components/aggregator]]
