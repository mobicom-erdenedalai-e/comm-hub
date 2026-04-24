# [Task 7]: GitHub Connector

**Date:** 2026-04-24
**Files changed:** src/lib/connectors/github.ts (created), tests/unit/connectors/github.test.ts (created)
**Status:** completed

## What was added
- `fetchGitHubActivity(token, owner, repo, dateRange)` — fetches commits and merged PRs via Octokit
- Normalizes commits to ActivityItem with type='commit', title=first line of commit message
- Normalizes merged PRs to ActivityItem with type='pull-request', filters by merged_at within dateRange
- Never throws — returns `{ error }` on failure per [[patterns/connector-pattern]]

## What changed
- Nothing

## Why (purpose)
- GitHub is the primary activity source. Commits and merged PRs describe what the dev team delivered in a given week.

## Patterns introduced
- Follows [[patterns/connector-pattern]] — never throws, error field instead

## Open questions / known limitations
- Fetches last 50 PRs by updated date — if a client has very active repos and lots of old PRs being updated, some merged PRs in the date range could be missed
