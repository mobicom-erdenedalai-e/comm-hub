# Pattern: Prompt Template Per Artifact

**First seen:** `src/lib/prompt-engine.ts`
**Date:** 2026-04-24

## Description

Each artifact type (weekly-report, meeting-summary, status-reply, handover-doc) has its own private builder function inside `prompt-engine.ts`. The public `buildPrompt()` function dispatches to the right builder via a switch statement. Client tone settings are injected into every prompt.

## Interface

```typescript
export function buildPrompt(
  type: ArtifactType,
  bundle: ActivityBundle,
  tone: ToneConfig,
  extra?: { question?: string; transcript?: string }
): string
```

## Tone injection

Two lookup maps provide tone and format instructions:
```typescript
const TONE_TEXT: Record<ToneConfig['tone'], string>    // formal / friendly / technical
const FORMAT_TEXT: Record<ToneConfig['format'], string> // email-prose / bullet-points
```

These are injected as natural language instructions at the top of every prompt.

## Adding a new artifact type

1. Add the new type to `ArtifactType` in `src/lib/types.ts`
2. Write a private builder function in `prompt-engine.ts`
3. Add a case to the `buildPrompt` switch
4. Add a unit test in `tests/unit/prompt-engine.test.ts`
5. Update this page
