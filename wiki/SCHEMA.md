# Wiki Schema

This document defines the structure, conventions, and rules for the CommHub wiki.
The LLM owns this wiki layer entirely — it is maintained by subagents, not humans.

## Structure

```
wiki/
  SCHEMA.md                    ← This file. Do not edit without updating conventions.
  README.md                    ← Entry point, index of all pages
  raw-sources/                 ← Immutable source documents. Never modified after ingestion.
    karpathy-llm-wiki.md
  architecture/
    overview.md                ← System architecture summary
    decisions/
      ADR-NNN-<slug>.md        ← One file per architectural decision
  components/
    <component-name>.md        ← One file per major module/file
    connectors/
      <source>.md              ← One file per data source connector
  patterns/
    <pattern-name>.md          ← Reusable patterns observed in the codebase
  changelog/
    YYYY-MM-DD-<slug>.md       ← One file per task/session
```

## Wiki Update Protocol (for subagents)

After every task, the executing subagent MUST write or update wiki pages following this protocol:

### 1. Changelog Entry (always required)

Create or append to `changelog/YYYY-MM-DD-<task-slug>.md`:

```markdown
# [Task N]: <Task Title>

**Date:** YYYY-MM-DD
**Files changed:** list of created/modified files
**Status:** completed

## What was added
- Bullet list of new files/functions/types created

## What changed
- Bullet list of modifications to existing files

## Why (purpose)
- The reason this was added. Link to ADR if a significant decision was made.

## Patterns introduced
- Any new pattern worth noting (link to patterns/ page if created)

## Open questions / known limitations
- Anything the next agent should be aware of
```

### 2. Component Page (when a new module is created)

Create `components/<name>.md`:

```markdown
# <ComponentName>

**File:** `src/lib/<name>.ts`
**Purpose:** One sentence.
**Created:** YYYY-MM-DD

## What it does
Paragraph description.

## Interface
```typescript
// Key exported functions/types
```

## Dependencies
- Links to other component pages

## Known limitations
- Any gotchas
```

### 3. ADR (when a significant technical decision is made)

Create `architecture/decisions/ADR-NNN-<slug>.md`:

```markdown
# ADR-NNN: <Decision Title>

**Date:** YYYY-MM-DD
**Status:** accepted

## Context
Why did this decision need to be made?

## Decision
What was decided?

## Consequences
What are the trade-offs?
```

### 4. Pattern Page (when a reusable pattern is observed)

Create `patterns/<name>.md`:

```markdown
# <Pattern Name>

**First seen:** `src/lib/<file>.ts`
**Date:** YYYY-MM-DD

## Description
What is this pattern?

## Example
```typescript
// Minimal code example
```

## When to use
Guidance for future agents.
```

## Conventions

- All pages use `[[wiki-links]]` for cross-references (Obsidian syntax)
- Dates always ISO 8601 (YYYY-MM-DD)
- Never delete raw-sources pages — they are immutable
- Keep component pages current — update them when the file changes
- Changelog entries are append-only — never edit past entries
- If a fact in the wiki contradicts the actual code, trust the code and update the wiki
