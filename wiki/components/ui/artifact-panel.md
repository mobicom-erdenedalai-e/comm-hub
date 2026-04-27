# ArtifactPanel Component

**File:** `src/components/artifact-panel/ArtifactPanel.tsx`
**CSS:** `src/components/artifact-panel/artifact-panel.css`
**Last updated:** 2026-04-27

## Purpose

The main content area of the dashboard. Lets the user configure a date range, trigger generation, and view/copy the resulting draft.

## Props

```typescript
type Props = { clientId: string; artifactType: ArtifactType }
```

## State

| State | Description |
|-------|-------------|
| `from / to` | Date range (defaults: today-7 to today) |
| `question` | Shown only for `status-reply` |
| `transcript` | Shown only for `meeting-summary` |
| `draft` | Generated text |
| `sourcesUsed / sourcesFailed` | Displayed below the draft |
| `loading` | Disables the Generate button |
| `error` | Shown in a `<Banner>` above the form |
| `retries` | After 3 failures, shows "AI unavailable" |
| `copied` | Momentary "Copied!" feedback on the Copy button |

## Conditional UI

- `status-reply`: shows a "Client question" text input
- `meeting-summary`: shows a transcript textarea for pasting
- After generation: shows draft box, sources note, Copy + Regenerate buttons

## Related

- [[components/ui/banner]] — error display
- [[api/generate]] — the endpoint this component calls
- [[components/ui/sidebar]] — sibling component in dashboard layout
