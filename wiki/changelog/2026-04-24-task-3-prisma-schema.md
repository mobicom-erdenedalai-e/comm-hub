# [Task 3]: Prisma Schema & Migration

**Date:** 2026-04-24
**Files changed:** prisma/schema.prisma (created)
**Status:** completed

## What was added
- `User` model: id (cuid), githubId (unique), name, email, image, createdAt, relation to Client[]
- `Client` model: id, userId (FK to User), name, tone, language, format, createdAt, relations to Integration[] and Artifact[]
- `Integration` model: id, clientId (FK, cascade delete), source (string), config (JSON), createdAt, updatedAt
- `Artifact` model: id, clientId (FK, cascade delete), type, content, sourcesUsed (String[]), dateRangeFrom, dateRangeTo, createdAt

## What changed
- Nothing (new file)

## Why (purpose)
- PostgreSQL persistence for users (via GitHub OAuth), per-client settings, integration configs (GitHub repo, Jira project, etc.), and generated artifact history.
- Integration.config is JSON so we can store different shapes per connector without separate tables.
- Cascade deletes on Integration and Artifact mean deleting a Client cleans up all related data.

## Patterns introduced
- None

## Open questions / known limitations
- `npx prisma migrate dev --name init` requires a live PostgreSQL instance. Run it manually when PostgreSQL is available. The Prisma client was generated with `prisma generate` which does not require a DB.
- GitHub PAT is NOT stored in Integration.config — it is injected server-side from GITHUB_TOKEN env var (security decision).
- Prisma 7 no longer supports `url` in `schema.prisma`; the DATABASE_URL is configured in `prisma.config.ts` (datasource.url) instead.
