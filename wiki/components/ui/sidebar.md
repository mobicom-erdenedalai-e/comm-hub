# Sidebar Component

**File:** `src/components/sidebar/Sidebar.tsx`
**CSS:** `src/components/sidebar/sidebar.css`
**Last updated:** 2026-04-27

## Purpose

Left-hand navigation panel for the dashboard. Lets the user pick a client, choose an artifact type, and click into artifact history.

## Props

```typescript
type Props = {
  selectedClientId: string | null
  selectedArtifactType: ArtifactType
  onClientChange: (id: string) => void
  onArtifactTypeChange: (type: ArtifactType) => void
  onHistorySelect: (artifactId: string) => void
}
```

## Behaviour

1. On mount: fetches `/api/clients` to populate the client dropdown
2. When `selectedClientId` changes: fetches `/api/artifacts?clientId=...` to load history (last 5 shown)
3. History items are clickable — fires `onHistorySelect(id)` which the dashboard uses to show the past draft inline

## Layout

```
sidebar-logo       "🐙 CommHub"
sidebar-section    CLIENT
client-select      <select dropdown>
sidebar-section    GENERATE
nav-items          Weekly Report / Meeting Summary / Status Reply / Handover Doc
sidebar-section    HISTORY
history-items      (up to 5, date + type label)
```

## Related

- [[components/ui/artifact-panel]] — sibling in the dashboard layout
- [[api/clients]], [[api/artifacts]]
