# Meeting Connector

**File:** `src/lib/connectors/meeting.ts`
**Last updated:** 2026-04-27

## Purpose

Parses a pasted meeting transcript into a single `ActivityItem` so it can flow through the same aggregation pipeline as other sources.

## Interface

```typescript
parseMeetingTranscript(text: string): ConnectorResult
```

- Pure function — no network calls, no async
- Returns empty items for blank/whitespace input
- Returns one item of `type: 'transcript'` with the full text as `description`

## Usage in generate route

Called after `aggregate()` completes. If a transcript is provided in the POST body, its items are appended to the bundle and `'meeting'` is added to `sourcesUsed`.

## Related

- [[patterns/connector-pattern]]
- [[components/ui/artifact-panel]] — the textarea where users paste the transcript
- [[api/generate]] — wires the transcript into the bundle
