# Banner Component

**File:** `src/components/ui/Banner.tsx`
**Last updated:** 2026-04-27

## Purpose

Inline alert strip for error and warning messages. Used by `ArtifactPanel` to surface generation errors.

## Props

```typescript
type Props = {
  type: 'error' | 'warning'
  message: string
  action?: { label: string; href: string }
}
```

- `error` → red background (`#fff0f0`)
- `warning` → yellow background (`#fff8e1`)
- Optional `action` renders a right-aligned link

## Related

- [[components/ui/artifact-panel]] — primary consumer
