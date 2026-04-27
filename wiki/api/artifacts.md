# Artifacts API Route

**File:** `app/api/artifacts/route.ts`
**Method:** `GET /api/artifacts?clientId=...`
**Last updated:** 2026-04-27

## Purpose

Returns the 20 most recent artifacts for a client. Used by the Sidebar to show history and by the dashboard to display past drafts.

## Query Parameters

| Param | Required | Description |
|-------|----------|-------------|
| `clientId` | Yes | Returns 400 if missing |

## Response

Array of artifact objects (up to 20, ordered by `createdAt` desc):
```typescript
{
  id: string
  type: string
  content: string
  sourcesUsed: string[]
  dateRangeFrom: Date
  dateRangeTo: Date
  createdAt: Date
}
```

## Auth & Ownership

Requires session. Verifies the client belongs to the authenticated user before returning artifacts (404 if not).

## Related

- [[components/ui/sidebar]] — fetches on client change, shows last 5
- [[api/generate]] — creates the artifacts returned here
