# [Task 4]: Prisma Client Singleton

**Date:** 2026-04-24
**Files changed:** src/lib/prisma.ts (created)
**Status:** completed

## What was added
- `prisma` export — singleton PrismaClient instance stored on `globalThis` in non-production environments

## What changed
- Nothing

## Why (purpose)
- Next.js hot-reload in development creates new module instances on each reload. Without the global singleton pattern, each reload would open a new database connection pool, exhausting available connections quickly.

## Patterns introduced
- Global singleton pattern for database clients in Next.js — storing on `globalThis` in dev only

## Open questions / known limitations
- None
