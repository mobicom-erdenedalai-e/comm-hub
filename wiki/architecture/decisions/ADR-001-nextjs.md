# ADR-001: Next.js 14 as Web Framework

**Date:** 2026-04-24
**Status:** accepted

## Context
Needed a full-stack TypeScript framework that handles both the dashboard UI and the API routes (generate, clients, artifacts) without running a separate backend service.

## Decision
Use Next.js 14 with App Router. API routes live in `src/app/api/`. Dashboard UI in `src/app/dashboard/`.

## Consequences
- Single deployment unit (Vercel or Node server)
- Server components handle auth checks without client-side round trips
- API routes share types with the frontend via `src/lib/types.ts`
- Trade-off: tighter coupling between UI and API than a separate backend, acceptable for an internal tool
