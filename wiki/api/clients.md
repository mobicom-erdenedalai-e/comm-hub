# Clients API Routes

**Files:**
- `app/api/clients/route.ts` — GET, POST
- `app/api/clients/[id]/route.ts` — PUT, DELETE
**Last updated:** 2026-04-27

## Endpoints

### GET /api/clients
Returns all clients (with integrations) for the authenticated user, ordered by `createdAt` desc.

### POST /api/clients
Creates a new client. Body:
```typescript
{
  name: string
  tone?: string           // default: 'professional'
  language?: string       // default: 'English'
  format?: string         // default: 'bullet'
  integrations?: Array<{ source: string; config: unknown }>
}
```
Returns 400 if `name` is blank. Returns 201 + created client.

### PUT /api/clients/[id]
Updates client fields. Replaces all integrations (delete + recreate). Returns 404 if not owned by user.

### DELETE /api/clients/[id]
Deletes client (cascades to integrations and artifacts via Prisma). Returns 204. Returns 404 if not owned by user.

## Auth & Ownership

All routes require a valid session. PUT/DELETE verify ownership via `findFirst({ where: { id, userId } })` before mutating.

## Related

- [[components/prisma-client]] — DB access
- [[components/ui/settings-page]] — POST consumer
- [[components/ui/sidebar]] — GET consumer
