# Prompt Engine

**File:** `src/lib/prompt-engine.ts`
**Last updated:** 2026-04-27

## Purpose

Turns an `ActivityBundle` + client `ToneConfig` + artifact type into a ready-to-send prompt string for the AI model.

## Interface

```typescript
buildPrompt(
  type: ArtifactType,
  bundle: ActivityBundle,
  tone: ToneConfig,
  extras?: { question?: string; transcript?: string }
): string
```

## Artifact Types → Builders

| ArtifactType | Private builder | Extra context used |
|---|---|---|
| `weekly-report` | `weeklyReportPrompt` | — |
| `meeting-summary` | `meetingSummaryPrompt` | `transcript` |
| `status-reply` | `statusReplyPrompt` | `question` |
| `handover-doc` | `handoverDocPrompt` | — |

## Tone & Format Injection

Two lookup maps translate enum values to natural-language instructions:

```typescript
TONE_TEXT: { formal: 'formal and professional', friendly: 'warm and friendly', technical: 'technical and precise' }
FORMAT_TEXT: { 'email-prose': 'well-structured prose suitable for email', 'bullet-points': 'concise bullet points' }
```

These phrases are injected into every prompt so the model applies the right style.

## Design Principle

See [[patterns/prompt-template-pattern]] — each prompt includes: role, tone/format instructions, activity summary, and specific task instruction.

## Related

- [[components/types]] — `ArtifactType`, `ToneConfig`, `ActivityBundle`
- [[api/generate]] — calls `buildPrompt` after aggregation
