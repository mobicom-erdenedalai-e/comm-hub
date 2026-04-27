# [Task 8]: Jira Connector

**Date:** 2026-04-24
**Files changed:** src/lib/connectors/jira.ts (created), tests/unit/connectors/jira.test.ts (created)
**Status:** completed

## What was added
- `JiraConfig` type — baseUrl, email, apiToken, projectKey
- `fetchJiraActivity(config, dateRange)` — queries Jira REST API v3 for Done tickets updated in date range
- JQL: `project = X AND status = Done AND updated >= "from" AND updated <= "to"`
- Normalizes to ActivityItem with type='ticket', title='KEY: summary', url='baseUrl/browse/KEY'
- Never throws — returns `{ error }` on failure per [[patterns/connector-pattern]]

## What changed
- Nothing

## Why (purpose)
- Jira provides the project management view of what was completed. Combined with GitHub commits, gives a fuller picture of delivered work.

## Patterns introduced
- Follows [[patterns/connector-pattern]]

## Open questions / known limitations
- Uses Jira REST API v3 (Atlassian Cloud). Self-hosted Jira Server would need v2 endpoint.
- Basic auth with email:apiToken — Jira Cloud only (not Server)
