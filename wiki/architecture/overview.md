# Architecture Overview

**Project:** CommHub — AI Communication Hub
**Last updated:** 2026-04-27
**Source:** [[raw-sources/karpathy-llm-wiki]] pattern applied to [[../docs/superpowers/specs/2026-04-24-ai-communication-hub-design]]

## What This Project Does

An internal Next.js web app for a software outsourcing team. It pulls activity from GitHub, Jira, Slack, and meeting transcripts, then uses GitHub Copilot Enterprise (GitHub Models API / GPT-4o) to generate polished client-facing communication artifacts on demand.

## System Layers

```
[Data Sources]     GitHub · Jira · Slack · Meetings
      ↓
[Connector Layer]  src/lib/connectors/github.ts
                   src/lib/connectors/jira.ts
                   src/lib/connectors/slack.ts
                   src/lib/connectors/meeting.ts
      ↓
[Aggregator]       src/lib/aggregator.ts
                   Calls connectors in parallel → ActivityBundle
      ↓
[Prompt Engine]    src/lib/prompt-engine.ts
                   Injects ActivityBundle + client tone → prompt string
      ↓
[AI Engine]        src/lib/github-models.ts
                   GitHub Models API (GPT-4o) via GITHUB_TOKEN
      ↓
[API Routes]       src/app/api/generate/route.ts
                   src/app/api/clients/route.ts
                   src/app/api/artifacts/route.ts
      ↓
[Dashboard UI]     src/components/sidebar/Sidebar.tsx
                   src/components/artifact-panel/ArtifactPanel.tsx
```

## Tech Stack

| Layer | Technology | Decision |
|-------|-----------|----------|
| Web app | Next.js 14 + TypeScript | [[decisions/ADR-001-nextjs]] |
| AI engine | GitHub Models API (GPT-4o) | [[decisions/ADR-002-github-models]] |
| Database | PostgreSQL + Prisma | [[decisions/ADR-003-postgresql]] |
| Auth | GitHub OAuth (NextAuth) | [[decisions/ADR-004-github-oauth]] |

## Data Flow (request lifecycle)

1. Dev opens CommHub → logs in via GitHub OAuth
2. Selects a client + date range + artifact type
3. POST `/api/generate` → fetches GitHub, Jira, Slack in parallel
4. Aggregator merges results into `ActivityBundle` (skips failed sources)
5. Prompt engine builds prompt from template + bundle + client tone config
6. GitHub Models API returns draft
7. Draft saved to `artifacts` table, returned to UI
8. Dev edits if needed → copies and sends to client

## Build Phases

| Phase | Scope | Status |
|-------|-------|--------|
| 1 | GitHub + Jira + Weekly Report + Dashboard | ✅ complete |
| 2 | Slack + Meeting Summary | ✅ complete |
| 3 | Status Reply + Handover Doc + Settings page | ✅ complete |
| 4 | Artifact history + Tone settings UI | ✅ complete |
