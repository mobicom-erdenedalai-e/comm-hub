# [Task 9]: Aggregator

**Date:** 2026-04-24
**Files changed:** src/lib/aggregator.ts (created), tests/unit/aggregator.test.ts (created)
**Status:** completed

## What was added
- `AggregatorConfig` type — optional github and jira connector configs
- `aggregate(clientId, config, dateRange)` — calls configured connectors in parallel via Promise.allSettled, merges items, tracks sourcesUsed vs sourcesFailed
- Items sorted by date descending in output bundle

## What changed
- Nothing

## Why (purpose)
- Centralizes the multi-connector orchestration so the generate API route (Task 12) only has to call one function. Promise.allSettled ensures a failing connector doesn't block the others.

## Patterns introduced
- None new (connector pattern and partial failure handling already documented)

## Open questions / known limitations
- Slack and Meeting connectors will be added to AggregatorConfig in Tasks 17-18
