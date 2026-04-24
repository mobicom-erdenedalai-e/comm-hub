# GitHub Models API Client

**File:** `src/lib/github-models.ts`
**Purpose:** Sends prompts to GitHub Models API (GPT-4o) with automatic retry on failure.
**Created:** 2026-04-24

## What it does
Wraps the GitHub Models API (OpenAI-compatible endpoint at models.inference.ai.azure.com) with retry logic. Returns the first choice's message content as a string.

## Interface
```typescript
export type GenerateOptions = {
  prompt: string
  maxRetries?: number  // default 2
}
export async function generateWithGitHubModels(options: GenerateOptions): Promise<string>
```

## Dependencies
- Env: `GITHUB_TOKEN` (GitHub PAT with models:read permission)
- [[architecture/decisions/ADR-002-github-models]]

## Known limitations
- `max_tokens: 1500` hardcoded
- No streaming support
