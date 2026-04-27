# CommHub Changelog

## Security & Bug Fixes — PR Review (2026-04-27)

- **C1 — Credential encryption:** Added `src/lib/crypto.ts` (AES-256-GCM). Jira `apiToken` and Slack `token` encrypted before storing in `Integration.config`; decrypted on read in `/api/generate`. New env var `CREDENTIAL_ENCRYPTION_KEY` required (64-char hex).
- **C2 / SSRF — Jira baseUrl validation:** `fetchJiraActivity` now validates `baseUrl` is `https://*.atlassian.net` before making any network request; returns connector error if invalid.
- **H1 — Zod validation:** Added `src/lib/integration-schemas.ts`; all integration configs validated with per-source zod schemas in POST/PUT `/api/clients`. Unsafe `as` casts in `/api/generate` replaced with `decryptConfig` + typed access via schema types.
- **H2 — Generate body validation:** `/api/generate` validates `artifactType` enum and `dateRange` (valid dates, from ≤ to) before processing.
- **H3 — env.ts compliance:** `github-models.ts` updated to use `env.GITHUB_TOKEN` instead of `process.env.GITHUB_TOKEN` directly.
- **H4 — Security headers:** `next.config.mjs` now exports `headers()` with CSP, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`, and HSTS.
- **H5 — Rate limiting:** Added `src/lib/rate-limit.ts`; `/api/generate` limited to 10 requests/min per user (429 on breach).
- **I1 — Dashboard fetch error handling:** History artifact fetch in `dashboard/page.tsx` now has `.catch()` with error state displayed to user.
- **I2 — Aggregator source tracking:** Source names tracked before `Promise.allSettled`; rejected connectors now logged by name (not `'unknown'`).
- **I3 — GitHub merge commit date:** `github.ts` falls back to `committer.date` then `Date.now()` when `author.date` is absent.
- **I4 — GitHub Models null check:** `choices[0].message.content` null-checked; descriptive error thrown on unexpected API shape.
- **Prisma 7 compat:** Schema updated to use `@prisma/adapter-pg`; `prisma.ts` updated to use `PrismaPg` adapter. `env.ts` returns empty string during `NEXT_PHASE=phase-production-build` to allow `next build` without live env vars.
- **Cleanup:** Removed unused `app/page.module.css` (Next.js boilerplate).

## PR Review Fixes (2026-04-27)

- **Build fix:** renamed `next.config.ts` → `next.config.mjs` (Next.js 14 does not support `.ts` config)
- **Ownership check:** `POST /api/generate` now uses `findFirst({ where: { id, userId } })` — prevents cross-user data access
- **JQL injection guard:** Jira connector validates `projectKey` against `/^[A-Z][A-Z0-9_]{1,9}$/` and quotes it in JQL
- **Type safety:** added `src/types/next-auth.d.ts` module augmentation; removed `session.user as any` cast
- **Error handling:** `req.json()` in generate route wrapped in try/catch (400 on malformed body)
- **Settings page:** save() now surfaces network and API errors to the user
- **Env validation:** added `src/lib/env.ts` — validated getters replace `process.env.X!` non-null assertions

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
