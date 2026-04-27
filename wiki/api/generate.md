# Generate API Route

**File:** `app/api/generate/route.ts`
**Method:** `POST /api/generate`
**Last updated:** 2026-04-27

## Purpose

Core endpoint that orchestrates the full generation pipeline: data aggregation → prompt building → AI generation → artifact storage.

## Request Body

```typescript
{
  clientId: string
  artifactType: ArtifactType
  dateRange: { from: string; to: string }   // ISO date strings
  question?: string      // for status-reply
  transcript?: string    // for meeting-summary
}
```

## Response

```typescript
{
  draft: string
  sourcesUsed: string[]
  sourcesFailed: string[]
  artifactId: string
}
```

## Pipeline

```
1. Auth check (getServerSession)
2. Parse + validate request body (400 on malformed JSON)
3. Load Client + Integrations from DB (ownership-checked via userId)
4. Build AggregatorConfig from integrations
5. aggregate() — parallel connector calls
6. Append meeting transcript items (if transcript provided)
7. buildPrompt() — artifact-type + tone template
8. generateWithGitHubModels() — GPT-4o API call
9. prisma.artifact.create() — persist draft
10. Return GenerateResponse
```

## Security

- Requires authenticated session (401 if not)
- Client loaded with `findFirst({ where: { id: clientId, userId: session.user.id } })` — returns 404 if the client belongs to another user
- `GITHUB_TOKEN` resolved through `src/lib/env.ts` at request time — never from client or DB
- Malformed request body returns 400 (req.json wrapped in try/catch)

## Related

- [[components/aggregator]], [[components/prompt-engine]], [[components/github-models-client]]
- [[components/connectors/meeting]]
- [[components/ui/artifact-panel]] — the frontend caller
