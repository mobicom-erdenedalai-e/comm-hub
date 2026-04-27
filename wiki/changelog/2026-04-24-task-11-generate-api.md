# [Task 11]: Generate API Route

**Date:** 2026-04-24
**Files changed:** app/api/generate/route.ts (created)
**Status:** completed

## What was added
- POST /api/generate — accepts GenerateRequest (clientId, artifactType, dateRange, question?), orchestrates aggregator + prompt engine + GitHub Models API, saves Artifact to DB, returns GenerateResponse

## What changed
- Nothing

## Why (purpose)
- The generate endpoint is the core action of CommHub. It chains all the library modules together into a single HTTP POST that the UI calls when the user clicks Generate.

## Patterns introduced
- None

## Open questions / known limitations
- GITHUB_TOKEN is injected server-side (not per-client), injected into github connector config
- slack and meeting integration configs are not yet wired (Tasks 17-18)
- No error recovery if aggregation partially fails — draft is generated from whatever data is available
