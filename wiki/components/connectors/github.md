# GitHub Connector

**File:** `src/lib/connectors/github.ts`
**Last updated:** 2026-04-27

## Purpose

Fetches commits and merged PRs from a GitHub repo for a given date range using the Octokit SDK.

## Interface

```typescript
fetchGitHubActivity(token: string, owner: string, repo: string, dateRange: DateRange): Promise<ConnectorResult>
```

## What it fetches

| Data | Endpoint | Normalized as |
|------|----------|---------------|
| Commits | `repos.listCommits` (since/until) | `type: 'commit'` |
| Merged PRs | `pulls.list` (filtered by `merged_at` in range) | `type: 'pull-request'` |

## Error handling

Never throws. Returns `{ source: 'github', items: [], error: String(error) }` on any failure.

## Security

Token passed per-call (from `process.env.GITHUB_TOKEN` injected server-side). Never stored in DB per-client.

## Related

- [[patterns/connector-pattern]]
- [[components/aggregator]]
