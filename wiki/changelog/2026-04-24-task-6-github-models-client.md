# [Task 6]: GitHub Models API Client

**Date:** 2026-04-24
**Files changed:** src/lib/github-models.ts (created), tests/unit/github-models.test.ts (created)
**Status:** completed

## What was added
- `generateWithGitHubModels(options)` — sends a prompt to GitHub Models API (GPT-4o) and returns the text response
- Retry loop: attempts up to `maxRetries` (default 2) times on failure
- Throws `'GITHUB_TOKEN environment variable is not set'` if env var is missing
- Throws `'GitHub Models API error: {status}'` after exhausting retries

## What changed
- `vitest.config.ts` — added resolve.alias for @/* → src/ to fix module resolution in tests

## Why (purpose)
- The prompt engine (Task 10) uses this function to call GPT-4o via GitHub Copilot Enterprise. Centralizing the API call here keeps retry logic out of the prompt engine.

## Patterns introduced
- None

## Open questions / known limitations
- `max_tokens: 1500` is hardcoded. Could be made configurable if longer artifacts are needed.
