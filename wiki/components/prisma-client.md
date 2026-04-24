# Prisma Client Singleton

**File:** `src/lib/prisma.ts`
**Purpose:** Singleton PrismaClient instance that avoids connection pool exhaustion during Next.js hot-reload.
**Created:** 2026-04-24

## What it does
Exports a single `prisma` instance reused across all API routes. In development, stores the instance on `globalThis` so it persists across hot-reload module re-evaluations. In production, creates one instance per process.

## Interface
```typescript
import { prisma } from '@/lib/prisma'
// prisma is a PrismaClient — use directly:
const users = await prisma.user.findMany()
```

## Dependencies
- [[components/prisma-client]] (schema — Task 3)

## Known limitations
- Requires DATABASE_URL to be set (or Prisma config url). Will throw at runtime if not configured.
