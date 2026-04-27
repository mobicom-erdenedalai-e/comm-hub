# GitHub Models API Client

**File:** `src/lib/github-models.ts`
**Last updated:** 2026-04-27

## Purpose

Calls GitHub Models (GPT-4o) to generate text from a prompt. Handles retries with exponential backoff.

## Interface

```typescript
generateWithGitHubModels({ prompt: string, maxRetries?: number }): Promise<string>
```

- Throws if `GITHUB_TOKEN` is missing
- Returns the generated text string
- Retries up to `maxRetries` (default 3) times on transient errors

## Configuration

| Setting | Value |
|---------|-------|
| Endpoint | `https://models.inference.ai.azure.com/chat/completions` |
| Model | `gpt-4o` |
| Max tokens | 1500 |
| Auth | `Bearer $GITHUB_TOKEN` |

## Security

`GITHUB_TOKEN` is **server-side only** — never passed to the client. Injected at runtime from environment variables.

## Related

- [[architecture/decisions/ADR-002-github-models]]
- [[api/generate]] — sole caller
