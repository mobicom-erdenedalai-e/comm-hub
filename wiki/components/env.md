# Env Module

**File:** `src/lib/env.ts`
**Last updated:** 2026-04-27

## Purpose

Validates required environment variables at access time and throws a descriptive error if any are missing. Replaces `process.env.X!` non-null assertions scattered across the codebase.

## Interface

```typescript
import { env } from '@/lib/env'

env.GITHUB_TOKEN         // throws if GITHUB_TOKEN not set
env.GITHUB_CLIENT_ID     // throws if GITHUB_CLIENT_ID not set
env.GITHUB_CLIENT_SECRET // throws if GITHUB_CLIENT_SECRET not set
```

Each property is a getter — validation runs at access time (i.e. request time), not at module load, so cold-start does not fail if a variable is temporarily missing.

## Why not startup validation?

Next.js App Router builds run `import` chains at build time where `process.env` values may not be set. Access-time validation surfaces the error at the first request that actually needs the value, with a clear message instead of a cryptic `TypeError: Cannot read properties of undefined`.

## Consumers

| File | Variable used |
|------|---------------|
| `app/api/auth/[...nextauth]/auth.ts` | `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` |
| `app/api/generate/route.ts` | `GITHUB_TOKEN` |

## Related

- [[architecture/decisions/ADR-002-github-models]] — `GITHUB_TOKEN` usage
- [[architecture/decisions/ADR-004-github-oauth]] — `GITHUB_CLIENT_ID/SECRET` usage
