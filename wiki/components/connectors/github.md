# GitHub Connector

**File:** `src/lib/connectors/github.ts`
**Purpose:** Fetches commit and merged PR activity from a GitHub repository via the Octokit REST API.
**Created:** 2026-04-24

## What it does
Calls GitHub API to list commits (filtered by since/until) and merged pull requests within the given date range. Normalizes both into `ActivityItem[]`.

## Interface
```typescript
export async function fetchGitHubActivity(
  token: string,
  owner: string,
  repo: string,
  dateRange: DateRange
): Promise<ConnectorResult>
```

## Dependencies
- `@octokit/rest` — GitHub REST API client
- [[components/types]] — ActivityItem, ConnectorResult, DateRange

## Known limitations
- PR list is capped at 50 items sorted by updated_at — busy repos may miss some merged PRs
- Requires `repo` OAuth scope (set in Task 5 NextAuth config)
