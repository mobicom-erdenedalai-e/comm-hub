# [Task 5]: GitHub OAuth with NextAuth

**Date:** 2026-04-24
**Files changed:** app/api/auth/[...nextauth]/auth.ts, app/api/auth/[...nextauth]/route.ts, app/login/page.tsx, app/layout.tsx (updated), app/page.tsx (updated), src/components/SessionProvider.tsx
**Status:** completed

## What was added
- `auth.ts` — NextAuth config with GitHub OAuth provider (scopes: read:user user:email repo), signIn callback upserts User in DB, session callback attaches Prisma user.id to session
- `route.ts` — exports NextAuth handler for GET and POST
- `app/login/page.tsx` — sign-in page with GitHub button
- `src/components/SessionProvider.tsx` — client component wrapping NextAuthSessionProvider
- `app/page.tsx` — redirects authenticated users to /dashboard, unauthenticated to /login

## What changed
- `app/layout.tsx` — replaced scaffold content with CommHub layout wrapping SessionProvider

## Why (purpose)
- GitHub OAuth lets team members sign in with their existing GitHub accounts. The repo scope is needed so the GitHub connector (Task 7) can read commits and pull requests on behalf of the user.
- session.user.id is the Prisma User.id (cuid), not the GitHub ID — used in all subsequent API routes to look up the authenticated user.

## Patterns introduced
- None

## Path note
- The `@/*` alias in tsconfig maps to the project root (`./*`), not `src/`. Since `prisma.ts` and `SessionProvider.tsx` live under `src/`, imports use `@/src/lib/prisma` and `@/src/components/SessionProvider` respectively.

## Open questions / known limitations
- The signIn callback upserts on githubId but the session callback looks up by githubId too. If the DB is unavailable, sign-in will fail silently (returns false) which redirects to /login with an error param.
