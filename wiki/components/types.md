# Shared Types

**File:** `src/lib/types.ts`
**Last updated:** 2026-04-27

## Purpose

Single source of truth for all TypeScript types shared across the codebase. No logic — pure type definitions only.

## Exported Types

| Type | Description |
|------|-------------|
| `ArtifactType` | Union: `'weekly-report' \| 'meeting-summary' \| 'status-reply' \| 'handover-doc'` |
| `ToneConfig` | `{ tone, language, format }` — per-client communication style |
| `ActivityItem` | Normalized item from any data source (github/jira/slack/meeting) |
| `ConnectorResult` | `{ source, items[], error? }` — return type of all connectors |
| `DateRange` | `{ from: Date, to: Date }` |
| `ActivityBundle` | Output of aggregator — all items + metadata |
| `GenerateRequest` | Body of `POST /api/generate` |
| `GenerateResponse` | Response from `POST /api/generate` |

## Key Design Decisions

- `ConnectorResult.error` is optional — connectors never throw, they return errors in-band
- `ActivityItem.source` is a const union matching connector names exactly
- `ToneConfig.tone` and `.format` are string literal unions enforced at the type level

## Related

- [[components/aggregator]] — consumes `ActivityBundle`, `ConnectorResult`
- [[components/prompt-engine]] — consumes `ActivityBundle`, `ToneConfig`
- [[patterns/connector-pattern]] — every connector returns `ConnectorResult`
