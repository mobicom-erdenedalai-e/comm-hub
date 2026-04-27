# ADR-004: GitHub OAuth via NextAuth

**Date:** 2026-04-24
**Status:** accepted

## Context
Team members all have GitHub accounts (required for Copilot Enterprise). Auth should be zero-friction and not require a separate credential system.

## Decision
Use NextAuth.js with GitHub provider. OAuth scopes: `read:user user:email repo`. On first sign-in, upsert user record in `users` table. Session includes the Prisma user `id` for DB queries.

## Consequences
- Zero additional accounts — team members use GitHub login they already have
- `repo` scope needed so the same token can be used for the GitHub connector (read commits/PRs)
- Session callback attaches `user.id` (Prisma cuid) so API routes can look up the user without re-querying by email; typed via `src/types/next-auth.d.ts` module augmentation (no `as any` casts needed)
- Trade-off: users must authorize the GitHub OAuth app once; scopes are broader than strictly needed for auth-only
