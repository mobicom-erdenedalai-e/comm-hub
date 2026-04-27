# Prisma Client Singleton

**File:** `src/lib/prisma.ts`
**Last updated:** 2026-04-27

## Purpose

Exports a single `PrismaClient` instance for the entire app. Prevents multiple connections during Next.js hot-reload in development.

## Pattern

```typescript
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }
export const prisma = globalForPrisma.prisma ?? new PrismaClient({ ... })
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

- In production: a new client is created once per Lambda/process
- In development: the instance is cached on `globalThis` to survive hot-reloads

## Schema Models

| Model | Key fields |
|-------|-----------|
| `User` | `id` (cuid), `githubId`, `email` |
| `Client` | `userId`, `name`, `tone`, `language`, `format` |
| `Integration` | `clientId`, `source` (github/jira/slack), `config` (Json) |
| `Artifact` | `clientId`, `type`, `content`, `sourcesUsed`, `dateRangeFrom/To` |

## Prisma 7.x Note

Config in `prisma.config.ts` (not in `schema.prisma`). The `datasource` block in `schema.prisma` has **no `url` field** — that moved to `prisma.config.ts` which reads `DATABASE_URL` via `dotenv`.

## Related

- [[architecture/decisions/ADR-003-postgresql]]
- [[api/clients]] — main consumer for CRUD
- [[api/generate]] — creates `Artifact` records
