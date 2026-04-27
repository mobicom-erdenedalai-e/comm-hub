import type { ActivityItem, ConnectorResult, DateRange } from '../types'

export type JiraConfig = {
  baseUrl: string
  email: string
  apiToken: string
  projectKey: string
}

function validateBaseUrl(raw: string): string | null {
  try {
    const u = new URL(raw)
    if (u.protocol !== 'https:' || !/^[a-z0-9-]+\.atlassian\.net$/.test(u.hostname)) return null
    return u.origin
  } catch { return null }
}

export async function fetchJiraActivity(
  config: JiraConfig,
  dateRange: DateRange
): Promise<ConnectorResult> {
  const { baseUrl, email, apiToken, projectKey } = config

  const safeBaseUrl = validateBaseUrl(baseUrl)
  if (!safeBaseUrl) {
    return { source: 'jira', items: [], error: 'Invalid Jira baseUrl' }
  }

  const PROJECT_KEY_RE = /^[A-Z][A-Z0-9_]{1,9}$/
  if (!PROJECT_KEY_RE.test(projectKey)) {
    return { source: 'jira', items: [], error: 'Invalid projectKey format' }
  }

  const auth = Buffer.from(`${email}:${apiToken}`).toString('base64')
  const from = dateRange.from.toISOString().split('T')[0]
  const to = dateRange.to.toISOString().split('T')[0]
  // SECURITY: projectKey validated above; from/to derived from Date.toISOString() — safe for JQL interpolation
  const jql = `project = "${projectKey}" AND status = Done AND updated >= "${from}" AND updated <= "${to}"`

  try {
    const res = await fetch(
      `${safeBaseUrl}/rest/api/3/search?jql=${encodeURIComponent(jql)}&maxResults=50&fields=summary,description,updated`,
      {
        headers: { Authorization: `Basic ${auth}`, Accept: 'application/json' },
        signal: AbortSignal.timeout(15_000),
      }
    )

    if (!res.ok) throw new Error(`Jira API error: ${res.status}`)

    const data = await res.json()
    const items: ActivityItem[] = data.issues.map((issue: { key: string; fields: { summary: string; description: { content?: Array<{ content?: Array<{ text?: string }> }> } | null; updated: string } }) => ({
      source: 'jira' as const,
      type: 'ticket',
      title: `${issue.key}: ${issue.fields.summary}`,
      description: issue.fields.description?.content?.[0]?.content?.[0]?.text ?? undefined,
      url: `${safeBaseUrl}/browse/${issue.key}`,
      date: new Date(issue.fields.updated),
    }))

    return { source: 'jira', items }
  } catch (error) {
    return { source: 'jira', items: [], error: String(error) }
  }
}
