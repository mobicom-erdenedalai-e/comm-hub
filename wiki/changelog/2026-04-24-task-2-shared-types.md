# [Task 2]: Shared Types

**Date:** 2026-04-24
**Files changed:** src/lib/types.ts (created)
**Status:** completed

## What was added
- `ArtifactType` — union type of the four artifact kinds: weekly-report, meeting-summary, status-reply, handover-doc
- `ToneConfig` — per-client tone settings: tone (formal/friendly/technical), language, format (email-prose/bullet-points)
- `ActivityItem` — normalized activity record from any connector source
- `ConnectorResult` — return type for every connector module; error field replaces throwing
- `DateRange` — from/to pair used in aggregator calls and generate requests
- `ActivityBundle` — merged output from aggregator: items + sourcesUsed + sourcesFailed
- `GenerateRequest` — API input for the generate endpoint
- `GenerateResponse` — API output including draft, sourcesUsed, sourcesFailed, artifactId

## What changed
- Nothing (new file)

## Why (purpose)
- Central type definitions shared by connectors, aggregator, prompt engine, API routes, and UI components. Defining them once prevents drift between modules.

## Patterns introduced
- ConnectorResult uses an optional `error` field instead of throwing — see [[patterns/connector-pattern]]

## Open questions / known limitations
- `question` field in GenerateRequest is only used by status-reply artifact type
