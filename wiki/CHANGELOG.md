# CommHub Changelog

## Task 20: Full Test Suite & Coverage Check (2026-04-27)
- All 36 unit tests passing
- Coverage: 96% statements, 80.28% branches, 100% functions, 96.8% lines
- Added meeting connector tests, extended prompt-engine and aggregator branch coverage
- Added GitHub connector test for PRs outside date range

## Task 19: Artifact History Click-Through (2026-04-27)
- `Sidebar` now emits `onHistorySelect(artifactId)` when a history item is clicked
- Dashboard page fetches and displays selected past artifact inline above the panel
- Close button dismisses the historic view

## Task 18: Client Settings Page (2026-04-27)
- Added `app/settings/page.tsx` — form for adding a client with GitHub/Jira/Slack integrations
- Save posts to `/api/clients` then redirects to dashboard after 1.2s
- GitHub token not in form (always from env); Jira + Slack tokens stored in `Integration.config`

## Task 17: Meeting Connector (2026-04-27)
- Added `src/lib/connectors/meeting.ts` — pure function, no network
- Generate route now accepts `transcript` in body; appends parsed items to bundle
- Slack connector wired into generate route (was TODO in Task 12)

## Task 16: Slack Connector (2026-04-27)
- Added `src/lib/connectors/slack.ts` — calls `conversations.history` API
- Filters out subtype messages (bot/join/leave)
- Wired into `AggregatorConfig` and `aggregate()`
- 4 unit tests added

## Task 15: E2E Tests (2026-04-27)
- Added `tests/e2e/generate-report.spec.ts`
- Test 1: unauthenticated `/dashboard` redirects to `/login`
- Test 2: login page shows GitHub sign-in button

## Task 14: ArtifactPanel Component (2026-04-27)
- Added `src/components/artifact-panel/ArtifactPanel.tsx` + CSS
- Added `src/components/ui/Banner.tsx` for error display
- Features: date range picker, Generate button with loading state, draft display, Copy + Regenerate, retry logic (max 3), sources used/failed note
- Dashboard page updated to compose Sidebar + ArtifactPanel

## Task 13: Dashboard Layout & Sidebar (2026-04-27)
- Added `src/components/sidebar/Sidebar.tsx` + CSS
- Added `app/dashboard/layout.tsx` — server component auth guard (redirects to `/login`)
- Added `app/dashboard/page.tsx` — shell with Sidebar (ArtifactPanel added in Task 14)

## Task 12: Clients CRUD & Artifacts API (2026-04-27)
- Added `app/api/clients/route.ts` — GET (list) + POST (create with integrations)
- Added `app/api/clients/[id]/route.ts` — PUT (update + replace integrations) + DELETE
- Added `app/api/artifacts/route.ts` — GET with `?clientId=` param, returns last 20
- All routes auth-guarded; ownership verified before mutations
- Unit tests: 7 new cases for input validation and integration sanitization
