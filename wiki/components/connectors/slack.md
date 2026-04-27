# Slack Connector

**File:** `src/lib/connectors/slack.ts`
**Last updated:** 2026-04-27

## Purpose

Fetches messages from a Slack channel for a given date range using the `conversations.history` API.

## Interface

```typescript
fetchSlackActivity(config: SlackConfig, dateRange: DateRange): Promise<ConnectorResult>
```

```typescript
type SlackConfig = { token: string; channelId: string }
```

## What it fetches

- Channel messages in the date range (converted from Slack `ts` Unix timestamps)
- Filters out messages with a `subtype` (bot messages, join/leave events, etc.)
- Normalizes `username ?? user` as the author field

## Error handling

Never throws. Returns error field if `data.ok === false` or network fails.

## Configuration

The Slack bot token is stored per-integration in the `Integration.config` JSON field in the DB (set via the Settings page).

## Related

- [[patterns/connector-pattern]]
- [[components/aggregator]]
- [[components/ui/settings-page]]
