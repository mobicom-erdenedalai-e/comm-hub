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

## Input validation

`projectKey` is validated against `/^[A-Z][A-Z0-9_]{1,9}$/` before use. Returns `{ source: 'jira', items: [], error: 'Invalid projectKey format' }` if the key fails — prevents JQL injection.

## Query

JQL: `project = "{KEY}" AND status = Done AND updated >= "{from}" AND updated <= "{to}"`

`projectKey` is quoted in the JQL string. Uses HTTP Basic auth (`email:apiToken` base64). Results capped at 50.

## Error handling

Never throws. Returns error field on network, API, or validation failure.

## Related

- [[patterns/connector-pattern]]
- [[components/aggregator]]
