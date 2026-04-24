# AI Communication Hub — Design Spec
**Date:** 2026-04-24
**Status:** Approved

## Overview

An internal web app for a software outsourcing team that eliminates manual client communication effort. It pulls activity data from GitHub, Jira, and Slack, then uses GitHub Copilot Enterprise (via GitHub Models API / GPT-4o) to generate polished client-facing artifacts on demand: weekly reports, meeting summaries, status replies, and handover docs.

## Problem

The dev team spends significant time every week writing client updates, summarizing meetings, responding to status questions, and producing handover documentation. This is repetitive work that delays actual development and introduces inconsistency in tone and quality across team members.

## Goals

- Reduce time spent on client communication by 70%+
- Ensure consistent tone and format per client
- Work entirely within the existing GitHub Copilot Enterprise subscription
- Be usable by any dev on the team with no training

## Non-Goals

- Automating the actual sending of emails (the dev always reviews and sends manually)
- A client-facing product (internal tooling only for now)
- Replacing Jira or Slack

---

## Architecture

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Web app | Next.js 14 + TypeScript |
| AI engine | GitHub Models API (GPT-4o via GitHub token) |
| Database | PostgreSQL + Prisma ORM |
| Auth | GitHub OAuth |
| Deployment | Vercel or self-hosted Node |

### Data Flow

1. Dev logs in via GitHub OAuth
2. Selects a client and date range
3. System calls all connectors in parallel (GitHub, Jira, Slack)
4. Aggregator merges results into a normalized `ActivityBundle`
5. Prompt Engine injects bundle + client tone settings into the selected template
6. GitHub Models API returns the generated draft
7. Dev reviews, edits if needed, copies and sends

---

## Components

### Connector Layer

One module per data source. Each exposes a single `fetch(clientId, dateRange)` function returning normalized activity items.

- `lib/connectors/github.ts` — commits, merged PRs, open issues
- `lib/connectors/jira.ts` — completed tickets, sprint velocity, blockers
- `lib/connectors/slack.ts` — channel messages, standup threads, pinned decisions
- `lib/connectors/meeting.ts` — accepts uploaded transcript file or pasted text

### Aggregator

`lib/aggregator.ts` — calls all connectors in parallel, merges into a single `ActivityBundle`. If a connector fails, it is skipped and flagged in the bundle metadata.

### Prompt Engine

`lib/prompt-engine.ts` — one template per artifact type. Injects `ActivityBundle` + client tone config. Calls GitHub Models API and returns the draft string.

**Artifact templates:**

| Artifact | Inputs | Output format |
|----------|--------|---------------|
| Weekly Report | Commits, PRs, Jira tickets, sprint velocity | 3-section email: Done / In Progress / Next Week |
| Meeting Summary | Raw transcript text | Bullets: decisions, action items (owner + deadline), open questions |
| Status Reply | Client's question + latest activity bundle | Concise professional reply paragraph |
| Handover Doc | Full commit history, all tickets, open issues | Structured markdown: architecture summary, deployment steps, known issues |

### Storage (PostgreSQL + Prisma)

| Table | Purpose |
|-------|---------|
| `users` | Team members, GitHub OAuth tokens |
| `clients` | Client config: name, tone, format, language |
| `integrations` | Per-client API keys for GitHub repo, Jira project, Slack channel |
| `artifacts` | Generated artifact history: type, content, created_at |

### Dashboard UI

Sidebar navigation layout (Option A):
- Left sidebar: client selector (dropdown), artifact type list, history
- Main panel: date range picker, generate button, draft editor, Copy / Edit / Regenerate actions
- Settings page: per-client tone, format, and integration configuration

---

## Per-Client Tone Settings

Each client record stores:
- **Tone**: `formal` | `friendly` | `technical`
- **Language**: e.g. `en`, `jp`, `de`
- **Format**: `email-prose` | `bullet-points`

These are injected into every prompt for that client, ensuring output always matches the client's expectations regardless of which dev generates it.

---

## Error Handling

| Scenario | Behavior |
|----------|----------|
| Source API unavailable | Skip source, continue with remaining. Draft notes which sources were used. |
| GitHub Models API failure | Inline error + Retry button. After 2 retries: "AI unavailable — try again later." |
| Expired / missing credentials | Banner linking to Settings → reconnect. Never silent failure. |
| No activity in date range | Confirmation prompt before calling AI: "No activity found — generate anyway?" |

---

## Testing Strategy

**Unit tests** (Vitest):
- Each connector's data normalization logic
- Aggregator merge and partial-failure handling
- Prompt template rendering with sample data
- Client tone injection

**Integration tests**:
- GitHub connector against a sandbox repo
- Jira connector against a test project
- GitHub Models API (real call, minimal prompt)
- PostgreSQL read/write for artifact history

**E2E tests** (Playwright):
- Login via GitHub OAuth
- Add a client and connect Jira
- Generate a weekly report → verify draft appears → copy
- Upload a meeting transcript → verify summary generated

---

## Build Order

| Phase | Scope |
|-------|-------|
| 1 | GitHub + Jira connectors, Aggregator, Weekly Report template, basic dashboard UI |
| 2 | Slack connector, Meeting transcript uploader, Meeting Summary template |
| 3 | Status Reply template, Handover Doc template |
| 4 | Per-client tone settings UI, Artifact history, Regenerate with feedback |

Phase 1 alone is usable and delivers the highest-value artifact (weekly report). Each subsequent phase adds an artifact type independently.

---

## Security

- All API keys and tokens stored as environment variables — never in source code
- GitHub OAuth scopes limited to `read:user`, `repo` (read-only)
- Jira and Slack tokens stored encrypted in the `integrations` table
- No client data sent to any third party beyond GitHub Models API (which is within the Copilot Enterprise subscription)
