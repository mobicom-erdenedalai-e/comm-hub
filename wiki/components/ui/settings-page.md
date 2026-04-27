# Settings Page

**File:** `app/settings/page.tsx`
**Last updated:** 2026-04-27

## Purpose

Form for adding a new client with integration configuration. On save, POSTs to `/api/clients` and redirects to `/dashboard`.

## Fields

| Section | Fields |
|---------|--------|
| Client | Name, Tone (formal/friendly/technical), Format (email-prose/bullet-points), Language |
| GitHub | Owner/Org, Repo (token injected server-side from `GITHUB_TOKEN`) |
| Jira | Base URL, Email, API Token, Project Key |
| Slack | Bot Token, Channel ID |

## Behaviour

- Save button disabled if name is blank
- On success: shows "Saved!" for 1.2s then navigates to `/dashboard`
- On failure: displays error message below the save button; button re-enables
- Network errors and non-2xx responses are caught and surfaced to the user (no silent failures)
- Integration sections are optional — only populated ones are sent

## Security note

GitHub token is **not** in this form — it's always from `process.env.GITHUB_TOKEN` server-side. Jira and Slack tokens are stored in `Integration.config` (JSON field in DB).

## Related

- [[api/clients]] — POST endpoint this form submits to
- [[components/ui/sidebar]] — shows client list populated from this form's data
