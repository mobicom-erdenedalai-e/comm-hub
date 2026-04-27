# CommHub — AI Communication Hub

An internal tool for outsourcing dev teams. Pulls activity from GitHub, Jira, Slack, and meeting transcripts, then uses GPT-4o (via GitHub Models API) to generate polished client-facing communication: weekly reports, meeting summaries, status replies, and handover docs.

---

## Features

- **4 artifact types** — Weekly Report, Meeting Summary, Status Reply, Handover Doc
- **4 data sources** — GitHub (commits + PRs), Jira (completed tickets), Slack (channel messages), meeting transcripts (paste)
- **Per-client tone** — formal / friendly / technical, email prose or bullet points, any language
- **Artifact history** — past drafts saved and browsable in the sidebar
- **GitHub OAuth** — login with your GitHub account, no extra user management

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Web app | Next.js 14 (App Router) + TypeScript |
| AI | GitHub Models API (GPT-4o) |
| Database | PostgreSQL + Prisma 7 |
| Auth | NextAuth v4 — GitHub OAuth |
| Testing | Vitest (unit) + Playwright (E2E) |

## Prerequisites

- Node.js 20+
- PostgreSQL database
- GitHub OAuth App ([create one](https://github.com/settings/developers))
- GitHub personal access token with `repo` scope (for GitHub Models API)

## Setup

**1. Install dependencies**

```bash
npm install
```

**2. Configure environment**

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

```env
DATABASE_URL="postgresql://user:password@localhost:5432/commhub"

# GitHub OAuth (https://github.com/settings/developers)
GITHUB_ID="your_github_oauth_app_id"
GITHUB_SECRET="your_github_oauth_app_secret"

# NextAuth — generate with: openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your_nextauth_secret"

# GitHub Models API token (needs repo scope)
GITHUB_TOKEN="ghp_your_github_pat"
```

**3. Run database migrations**

```bash
npx prisma migrate dev
```

**4. Start the dev server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Usage

1. **Log in** with GitHub OAuth
2. Go to **Settings** → add a client with their GitHub repo, Jira project, and/or Slack channel
3. Return to the **Dashboard** → select the client
4. Pick an artifact type (e.g. Weekly Report), set the date range, and click **Generate**
5. Review the draft, copy it, or regenerate

## Project Structure

```
app/                    Next.js App Router pages and API routes
├── api/
│   ├── auth/           NextAuth OAuth handler
│   ├── clients/        CRUD for clients and integrations
│   ├── artifacts/      Artifact history
│   └── generate/       Main generation pipeline
├── dashboard/          Dashboard page (Sidebar + ArtifactPanel)
├── settings/           Add client form
└── login/              Sign-in page

src/
├── lib/
│   ├── types.ts        Shared TypeScript types
│   ├── prisma.ts       DB client singleton
│   ├── aggregator.ts   Parallel connector orchestration
│   ├── prompt-engine.ts  Artifact prompt templates
│   ├── github-models.ts  GPT-4o API client
│   └── connectors/
│       ├── github.ts   GitHub commits + PRs
│       ├── jira.ts     Jira completed tickets
│       ├── slack.ts    Slack channel messages
│       └── meeting.ts  Meeting transcript parser
└── components/
    ├── sidebar/        Client selector + artifact nav + history
    ├── artifact-panel/ Date range + generate + draft display
    └── ui/             Banner, shared UI

tests/
├── unit/               Vitest unit tests (80%+ coverage)
└── e2e/                Playwright E2E tests

wiki/                   LLM-maintained knowledge wiki (Obsidian-compatible)
prisma/schema.prisma    Database schema
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm test` | Run unit tests |
| `npm run test:coverage` | Unit tests with coverage report |
| `npx playwright test` | Run E2E tests |
| `npx prisma migrate dev` | Apply DB migrations |
| `npx prisma studio` | Browse database |

## Architecture

See [`wiki/architecture/overview.md`](wiki/architecture/overview.md) for the full system diagram, data flow, and architectural decision records.

## License

MIT
