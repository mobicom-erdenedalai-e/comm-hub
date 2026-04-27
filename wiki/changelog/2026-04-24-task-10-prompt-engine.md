# [Task 10]: Prompt Engine

**Date:** 2026-04-24
**Files changed:** src/lib/prompt-engine.ts (created), tests/unit/prompt-engine.test.ts (created)
**Status:** completed

## What was added
- `buildPrompt(type, bundle, tone, extra?)` — dispatches to private builder per artifact type
- `weeklyReportPrompt` — 3-section weekly report from commits, PRs, tickets
- `meetingSummaryPrompt` — decisions/actions/open-questions from meeting transcript
- `statusReplyPrompt` — concise reply to a client question using recent activity
- `handoverDocPrompt` — 5-section handover doc from full activity history
- TONE_TEXT and FORMAT_TEXT lookup maps for tone injection

## What changed
- Nothing

## Why (purpose)
- Centralized prompt construction keeps the AI instructions versioned and reviewable. Each artifact type has different structure/tone requirements.

## Patterns introduced
- Prompt template per artifact type — see [[patterns/prompt-template-pattern]]

## Open questions / known limitations
- Prompts are English meta-instructions regardless of tone.language; only the output language varies
