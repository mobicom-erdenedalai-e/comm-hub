import { describe, it, expect, vi, beforeEach } from 'vitest'
import { aggregate } from '@/lib/aggregator'

vi.mock('@/lib/connectors/github', () => ({
  fetchGitHubActivity: vi.fn(),
}))
vi.mock('@/lib/connectors/jira', () => ({
  fetchJiraActivity: vi.fn(),
}))

import { fetchGitHubActivity } from '@/lib/connectors/github'
import { fetchJiraActivity } from '@/lib/connectors/jira'

const dateRange = { from: new Date('2026-04-14'), to: new Date('2026-04-20') }

describe('aggregate', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('merges items from all successful connectors', async () => {
    vi.mocked(fetchGitHubActivity).mockResolvedValue({
      source: 'github', items: [{ source: 'github', type: 'commit', title: 'fix: bug', date: new Date() }],
    })
    vi.mocked(fetchJiraActivity).mockResolvedValue({
      source: 'jira', items: [{ source: 'jira', type: 'ticket', title: 'PROJ-1: Task', date: new Date() }],
    })

    const bundle = await aggregate('client-1', {
      github: { token: 'tok', owner: 'org', repo: 'repo' },
      jira: { baseUrl: 'https://x.atlassian.net', email: 'a@b.com', apiToken: 'tok', projectKey: 'PROJ' },
    }, dateRange)

    expect(bundle.items).toHaveLength(2)
    expect(bundle.sourcesUsed).toContain('github')
    expect(bundle.sourcesUsed).toContain('jira')
    expect(bundle.sourcesFailed).toHaveLength(0)
  })

  it('marks a connector as failed and continues when it returns an error', async () => {
    vi.mocked(fetchGitHubActivity).mockResolvedValue({ source: 'github', items: [], error: 'rate limit' })
    vi.mocked(fetchJiraActivity).mockResolvedValue({
      source: 'jira', items: [{ source: 'jira', type: 'ticket', title: 'PROJ-2: Done', date: new Date() }],
    })

    const bundle = await aggregate('client-1', {
      github: { token: 'tok', owner: 'org', repo: 'repo' },
      jira: { baseUrl: 'https://x.atlassian.net', email: 'a@b.com', apiToken: 'tok', projectKey: 'PROJ' },
    }, dateRange)

    expect(bundle.items).toHaveLength(1)
    expect(bundle.sourcesFailed).toContain('github')
    expect(bundle.sourcesUsed).toContain('jira')
  })

  it('only calls connectors that have config', async () => {
    vi.mocked(fetchJiraActivity).mockResolvedValue({ source: 'jira', items: [] })
    await aggregate('client-1', { jira: { baseUrl: 'x', email: 'a', apiToken: 't', projectKey: 'P' } }, dateRange)
    expect(fetchGitHubActivity).not.toHaveBeenCalled()
    expect(fetchJiraActivity).toHaveBeenCalledOnce()
  })
})
