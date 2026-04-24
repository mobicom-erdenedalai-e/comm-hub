# Prisma Schema

**File:** `prisma/schema.prisma`
**Purpose:** Database schema defining User, Client, Integration, and Artifact tables.
**Created:** 2026-04-24

## Models

| Model | Purpose |
|-------|---------|
| User | GitHub OAuth user record |
| Client | A client project with tone/language settings |
| Integration | Per-client connector config (GitHub, Jira, Slack) stored as JSON |
| Artifact | Generated communication artifact with content and metadata |

## Key decisions
- `Integration.config` is `Json` — flexible per-connector shape without extra tables
- Cascade deletes on Integration and Artifact when Client is deleted
- GitHub token NOT stored in Integration.config (injected from env at runtime)

## Dependencies
- [[architecture/decisions/ADR-003-postgresql]]
