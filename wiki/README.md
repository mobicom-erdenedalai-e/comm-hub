# CommHub Wiki

This wiki follows the [[raw-sources/karpathy-llm-wiki|Karpathy LLM Wiki pattern]] — a markdown knowledge layer maintained by LLMs between raw sources and the codebase.

**The LLM owns this layer.** Every agent that modifies code must update the wiki before finishing.

---

## How to use this wiki

**If you are a subagent starting a task:**
1. Read [[architecture/overview]] first — understand the system before touching code
2. Read the component page(s) relevant to your task (see index below)
3. Complete your task
4. Write your changelog entry and update component pages per [[SCHEMA]]

**If you are a developer opening Obsidian:**
- Start at [[architecture/overview]] for the big picture
- Use `[[wiki-links]]` to navigate between pages
- The `CHANGELOG.md` shows what changed and why, task by task

---

## Index

### Architecture
- [[architecture/overview]] — System architecture, tech stack, data flow, build phases
- [[architecture/decisions/ADR-001-nextjs]] — Why Next.js 14
- [[architecture/decisions/ADR-002-github-models]] — Why GitHub Models API
- [[architecture/decisions/ADR-003-postgresql]] — Why PostgreSQL + Prisma
- [[architecture/decisions/ADR-004-github-oauth]] — Why GitHub OAuth

### Core Library (`src/lib/`)
- [[components/types]] — Shared TypeScript types
- [[components/prisma-client]] — DB singleton (Prisma 7.x pattern)
- [[components/github-models-client]] — AI API client (GPT-4o via GitHub Models)
- [[components/aggregator]] — Parallel connector orchestration
- [[components/prompt-engine]] — Artifact prompt templates

### Connectors (`src/lib/connectors/`)
- [[components/connectors/github]] — Commits + merged PRs via Octokit
- [[components/connectors/jira]] — Completed tickets via Jira REST API v3
- [[components/connectors/slack]] — Channel messages via conversations.history
- [[components/connectors/meeting]] — Meeting transcript parser (pure function)

### UI Components
- [[components/ui/sidebar]] — Client selector, artifact nav, history list
- [[components/ui/artifact-panel]] — Date range, generate, draft display, copy
- [[components/ui/banner]] — Inline error/warning display
- [[components/ui/settings-page]] — Add client + integration config form

### API Routes
- [[api/generate]] — POST /api/generate — full generation pipeline
- [[api/clients]] — GET/POST /api/clients, PUT/DELETE /api/clients/[id]
- [[api/artifacts]] — GET /api/artifacts?clientId=...

### Patterns
- [[patterns/connector-pattern]] — How every data source connector is structured
- [[patterns/prompt-template-pattern]] — How artifact prompts are built

### Raw Sources (immutable)
- [[raw-sources/karpathy-llm-wiki]] — Foundational pattern for this wiki

---

## Wiki health

Run a lint pass periodically:
- Do all component pages reference real file paths?
- Does the architecture overview match the current build phase status?
- Are there component pages for every file in `src/lib/`?
- Do changelog entries cover every completed task?
