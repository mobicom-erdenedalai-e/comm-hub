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
2. Load Client + Integrations from DB
3. Build AggregatorConfig from integrations
4. aggregate() — parallel connector calls
5. Append meeting transcript items (if transcript provided)
6. buildPrompt() — artifact-type + tone template
7. generateWithGitHubModels() — GPT-4o API call
8. prisma.artifact.create() — persist draft
9. Return GenerateResponse
```

## Security

- Requires authenticated session (401 if not)
- `GITHUB_TOKEN` injected server-side only — never from client or DB
- Client ownership not re-verified here (client is loaded by `clientId` from the DB)

## Related

- [[components/aggregator]], [[components/prompt-engine]], [[components/github-models-client]]
- [[components/connectors/meeting]]
- [[components/ui/artifact-panel]] — the frontend caller
