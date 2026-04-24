import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchJiraActivity } from '@/lib/connectors/jira'

const jiraConfig = {
  baseUrl: 'https://myorg.atlassian.net',
  email: 'dev@myorg.com',
  apiToken: 'test-token',
  projectKey: 'PROJ',
}
const dateRange = { from: new Date('2026-04-14'), to: new Date('2026-04-20') }

describe('fetchJiraActivity', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  it('returns normalized completed tickets', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        issues: [
          {
            key: 'PROJ-42',
            fields: {
              summary: 'Fix login redirect',
              updated: '2026-04-18T10:00:00Z',
              description: null,
            },
          },
        ],
      }),
    } as Response)

    const result = await fetchJiraActivity(jiraConfig, dateRange)
    expect(result.source).toBe('jira')
    expect(result.error).toBeUndefined()
    expect(result.items).toHaveLength(1)
    expect(result.items[0].title).toBe('PROJ-42: Fix login redirect')
    expect(result.items[0].url).toBe('https://myorg.atlassian.net/browse/PROJ-42')
  })

  it('returns error field when fetch fails', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({ ok: false, status: 401, json: async () => ({}) } as Response)
    const result = await fetchJiraActivity(jiraConfig, dateRange)
    expect(result.error).toContain('Jira API error: 401')
    expect(result.items).toEqual([])
  })
})
