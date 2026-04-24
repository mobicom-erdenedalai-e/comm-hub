import { describe, it, expect, vi } from 'vitest'
import { fetchGitHubActivity } from '@/lib/connectors/github'

vi.mock('@octokit/rest', () => ({
  Octokit: vi.fn().mockImplementation(function () {
    return {
      repos: {
        listCommits: vi.fn().mockResolvedValue({
          data: [
            {
              sha: 'abc123',
              commit: {
                message: 'fix: resolve auth bug\n\nDetailed description',
                author: { name: 'Alice', date: '2026-04-20T10:00:00Z' },
              },
              html_url: 'https://github.com/org/repo/commit/abc123',
            },
          ],
        }),
      },
      pulls: {
        list: vi.fn().mockResolvedValue({
          data: [
            {
              title: 'feat: add payment module',
              html_url: 'https://github.com/org/repo/pull/42',
              merged_at: '2026-04-19T15:00:00Z',
              user: { login: 'bob' },
            },
          ],
        }),
      },
    }
  }),
}))

describe('fetchGitHubActivity', () => {
  const dateRange = { from: new Date('2026-04-14'), to: new Date('2026-04-20') }

  it('returns normalized commits and merged PRs', async () => {
    const result = await fetchGitHubActivity('token', 'org', 'repo', dateRange)
    expect(result.source).toBe('github')
    expect(result.error).toBeUndefined()
    const commit = result.items.find(i => i.type === 'commit')
    expect(commit?.title).toBe('fix: resolve auth bug')
    expect(commit?.author).toBe('Alice')
    const pr = result.items.find(i => i.type === 'pull-request')
    expect(pr?.title).toBe('feat: add payment module')
  })

  it('returns error field when Octokit throws', async () => {
    const { Octokit } = await import('@octokit/rest')
    vi.mocked(Octokit).mockImplementationOnce(function () {
      return {
        repos: { listCommits: vi.fn().mockRejectedValue(new Error('API rate limit')) },
        pulls: { list: vi.fn() },
      } as any
    })
    const result = await fetchGitHubActivity('bad-token', 'org', 'repo', dateRange)
    expect(result.error).toContain('API rate limit')
    expect(result.items).toEqual([])
  })
})
