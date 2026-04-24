# Prompt Engine

**File:** `src/lib/prompt-engine.ts`
**Purpose:** Builds artifact-specific prompts from an ActivityBundle and ToneConfig.
**Created:** 2026-04-24

## What it does
Dispatches to a private builder function per artifact type. Each builder constructs a prompt that instructs GPT-4o to produce the artifact. Tone and format instructions are injected from lookup maps.

## Interface
```typescript
export function buildPrompt(
  type: ArtifactType,
  bundle: ActivityBundle,
  tone: ToneConfig,
  extra?: { question?: string; transcript?: string }
): string
```

## Dependencies
- [[components/types]] — ArtifactType, ActivityBundle, ToneConfig

## Known limitations
- `extra.question` used only by status-reply
- `extra.transcript` used only by meeting-summary
