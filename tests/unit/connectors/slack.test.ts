import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchSlackActivity } from '@/lib/connectors/slack'

const slackConfig = { token: 'xoxb-test', channelId: 'C12345' }
const dateRange = { from: new Date('2026-04-14'), to: new Date('2026-04-20') }

describe('fetchSlackActivity', () => {
  beforeEach(() => { vi.stubGlobal('fetch', vi.fn()) })

  it('returns normalized messages from the channel', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        ok: true,
        messages: [
          { text: 'Deployed v2.1 to staging', ts: '1713427200.000000', username: 'alice' },
          { text: 'Sprint review at 3pm', ts: '1713340800.000000', username: 'bob' },
        ],
      }),
    } as Response)

    const result = await fetchSlackActivity(slackConfig, dateRange)
    expect(result.source).toBe('slack')
    expect(result.error).toBeUndefined()
    expect(result.items[0].title).toBe('Deployed v2.1 to staging')
    expect(result.items[0].author).toBe('alice')
  })

  it('returns error when Slack API returns ok:false', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ok: false, error: 'invalid_auth' }),
    } as Response)
    const result = await fetchSlackActivity(slackConfig, dateRange)
    expect(result.error).toContain('invalid_auth')
    expect(result.items).toEqual([])
  })

  it('returns error on network failure', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error('Network failure'))
    const result = await fetchSlackActivity(slackConfig, dateRange)
    expect(result.error).toContain('Network failure')
    expect(result.items).toEqual([])
  })

  it('filters out subtype messages (bot_message etc)', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        ok: true,
        messages: [
          { text: 'Normal message', ts: '1713427200.000000', username: 'alice' },
          { text: 'Bot message', ts: '1713340800.000000', username: 'bot', subtype: 'bot_message' },
        ],
      }),
    } as Response)

    const result = await fetchSlackActivity(slackConfig, dateRange)
    expect(result.items).toHaveLength(1)
    expect(result.items[0].author).toBe('alice')
  })
})
