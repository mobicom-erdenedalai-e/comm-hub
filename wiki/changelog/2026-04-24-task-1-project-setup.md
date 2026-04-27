# [Task 1]: Project Setup

**Date:** 2026-04-24
**Files changed:** package.json, tsconfig.json, next.config.ts, vitest.config.ts, playwright.config.ts, .env.example
**Status:** completed

## What was added
- Next.js 14 scaffold with TypeScript and App Router
- `vitest.config.ts` for unit tests (covers `src/lib/**`, 80% threshold)
- `playwright.config.ts` for E2E tests against `tests/e2e/`
- `.env.example` documenting all required environment variables
- npm test scripts: `test`, `test:watch`, `test:coverage`, `test:e2e`

## What changed
- Nothing (greenfield)

## Why (purpose)
- Establishes the project foundation and toolchain that all subsequent tasks depend on.
- Next.js 14 App Router chosen per ADR-001; Vitest chosen over Jest for better ESM support.

## Patterns introduced
- None

## Open questions / known limitations
- PostgreSQL must be running locally before Task 3's migration can run
- GITHUB_TOKEN must be set to a real GitHub PAT before the GitHub Models API client (Task 6) can be tested against the live API
