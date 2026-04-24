# ADR-003: PostgreSQL + Prisma for Storage

**Date:** 2026-04-24
**Status:** accepted

## Context
Need to persist: user accounts, client configs, integration credentials, and generated artifact history.

## Decision
PostgreSQL via Prisma ORM. Schema defined in `prisma/schema.prisma`. Tables: `users`, `clients`, `integrations`, `artifacts`.

## Consequences
- Prisma provides type-safe DB access with generated client
- `integrations.config` is a `Json` field — stores connector-specific config (Jira URL, Slack channel ID, GitHub repo) per client
- GitHub token is NOT stored in DB — injected from `GITHUB_TOKEN` env var server-side to avoid credential leakage
- Trade-off: requires a running PostgreSQL instance; for local dev, Docker is simplest
