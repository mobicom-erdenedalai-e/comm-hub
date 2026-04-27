import type { ActivityItem, ConnectorResult, DateRange } from '../types'

export type SlackConfig = { token: string; channelId: string }

export async function fetchSlackActivity(config: SlackConfig, dateRange: DateRange): Promise<ConnectorResult> {
  const { token, channelId } = config
  const oldest = Math.floor(dateRange.from.getTime() / 1000).toString()
  const latest = Math.floor(dateRange.to.getTime() / 1000).toString()

  try {
    const res = await fetch(
      `https://slack.com/api/conversations.history?channel=${channelId}&oldest=${oldest}&latest=${latest}&limit=100`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    const data = await res.json()
    if (!data.ok) throw new Error(data.error ?? 'Slack API error')

    const items: ActivityItem[] = (data.messages as Record<string, unknown>[])
      .filter(m => m.text && !m.subtype)
      .map(m => ({
        source: 'slack' as const,
        type: 'message',
        title: (m.text as string).slice(0, 120),
        description: m.text as string,
        date: new Date(parseFloat(m.ts as string) * 1000),
        author: (m.username ?? m.user) as string,
      }))

    return { source: 'slack', items }
  } catch (error) {
    return { source: 'slack', items: [], error: String(error) }
  }
}
