# CommHub — Claude Instructions

## What this project is

CommHub is an internal Next.js 14 web app for a software outsourcing team. It pulls activity from GitHub, Jira, Slack, and meeting transcripts, then uses GitHub Models API (GPT-4o) to generate client-facing communication artifacts: weekly reports, meeting summaries, status replies, and handover docs.

## Commands

```bash
npm run dev              # Start dev server (http://localhost:3000)
npm run build            # Production build
npm test                 # Unit tests (Vitest)
npm run test:coverage    # Unit tests + coverage report
npx playwright test      # E2E tests
npx prisma migrate dev   # Apply DB migrations
npx prisma studio        # Browse DB
```

## Environment variables

Required in `.env`:

```
DATABASE_URL            PostgreSQL connection string
GITHUB_CLIENT_ID        GitHub OAuth App ID
GITHUB_CLIENT_SECRET    GitHub OAuth App secret
NEXTAUTH_SECRET         Random secret (openssl rand -base64 32)
NEXTAUTH_URL            App base URL (http://localhost:3000 in dev)
GITHUB_TOKEN            GitHub PAT with repo scope (used for GitHub Models API)
```

All env vars are accessed through `src/lib/env.ts` — never use `process.env.X!` directly.

## Architecture

```
Connectors (github/jira/slack/meeting)
  → Aggregator (parallel, Promise.allSettled)
    → Prompt Engine (type + tone → prompt string)
      → GitHub Models API (GPT-4o)
        → API Route /api/generate (auth + ownership check)
          → Dashboard UI (Sidebar + ArtifactPanel)
```

Key files:
- `src/lib/types.ts` — all shared types
- `src/lib/aggregator.ts` — connector orchestration
- `src/lib/prompt-engine.ts` — prompt templates
- `src/lib/github-models.ts` — GPT-4o client
- `src/lib/connectors/` — one file per data source
- `app/api/generate/route.ts` — main pipeline endpoint
- `app/api/clients/` — client CRUD
- `app/api/artifacts/` — artifact history

## Code conventions

- **Immutability** — never mutate objects; return new copies
- **No `as any`** — use module augmentation (`src/types/`) instead
- **No `process.env.X!`** — use `src/lib/env.ts` getters
- **Connectors never throw** — always return `{ source, items, error? }`
- **All API routes** — auth check first, then ownership check before any DB mutation
- **Tests** — 80%+ coverage required; unit tests in `tests/unit/`, E2E in `tests/e2e/`
- **Files** — max 800 lines; max 50 lines per function

## Wiki update protocol

**After every task is complete, you MUST update the wiki.** The wiki lives in `wiki/` and follows the schema defined in `wiki/SCHEMA.md`.

### What to update

| Change made | Wiki action required |
|---|---|
| Any task completed | Add entry to `wiki/CHANGELOG.md` under a new `## <Task name> (YYYY-MM-DD)` heading |
| New file/module created | Create `wiki/components/<name>.md` |
| New API route added | Create or update `wiki/api/<route>.md` |
| Existing file modified | Update the corresponding `wiki/components/` page — keep facts in sync with code |
| Security fix or behaviour change | Update the Security section of the affected component/API page |
| New connector added | Create `wiki/components/connectors/<source>.md` |
| Significant technical decision | Create `wiki/architecture/decisions/ADR-NNN-<slug>.md` |
| New reusable pattern introduced | Create `wiki/patterns/<pattern-name>.md` |

### Rules

- If a wiki page says something that contradicts the code, **trust the code and update the wiki**
- Changelog entries are **append-only** — never edit past entries
- `wiki/raw-sources/` is **immutable** — never modify those files
- Use `[[wiki-links]]` for cross-references between pages (Obsidian syntax)
- Dates always ISO 8601 (YYYY-MM-DD)

### CHANGELOG.md format

```markdown
## <Task name> (YYYY-MM-DD)

- What was added or changed (bullet points)
- Security fixes, behaviour changes, new files
```

### Component page format

```markdown
# <Component Name>

**File:** `src/lib/<name>.ts`
**Last updated:** YYYY-MM-DD

## Purpose
One paragraph.

## Interface
\`\`\`typescript
// exported functions/types
\`\`\`

## Security / Error handling
(if relevant)

## Related
- [[other/wiki/pages]]
```
