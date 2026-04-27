import { describe, it, expect, vi, beforeEach } from 'vitest'
import { generateWithGitHubModels } from '@/lib/github-models'

describe('generateWithGitHubModels', () => {
  beforeEach(() => {
    process.env.GITHUB_TOKEN = 'test-token'
    vi.stubGlobal('fetch', vi.fn())
  })

  it('returns the generated text on success', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ choices: [{ message: { content: 'Generated text' } }] }),
    } as Response)

    const result = await generateWithGitHubModels({ prompt: 'Hello' })
    expect(result).toBe('Generated text')
  })

  it('retries up to maxRetries times then throws', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 500,
      text: async () => 'Internal Server Error',
    } as Response)

    await expect(generateWithGitHubModels({ prompt: 'Hello', maxRetries: 2 }))
      .rejects.toThrow('GitHub Models API error: 500')
    expect(fetch).toHaveBeenCalledTimes(3) // 1 initial + 2 retries
  })

  it('throws when GITHUB_TOKEN is not set', async () => {
    delete process.env.GITHUB_TOKEN
    await expect(generateWithGitHubModels({ prompt: 'Hello' }))
      .rejects.toThrow('Missing required environment variable: GITHUB_TOKEN')
  })
})
