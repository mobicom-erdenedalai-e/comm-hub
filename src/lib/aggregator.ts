import type { ActivityBundle, ConnectorResult, DateRange } from './types'
import { fetchGitHubActivity } from './connectors/github'
import { fetchJiraActivity } from './connectors/jira'
import { fetchSlackActivity } from './connectors/slack'

export type AggregatorConfig = {
  github?: { token: string; owner: string; repo: string }
  jira?: { baseUrl: string; email: string; apiToken: string; projectKey: string }
  slack?: { token: string; channelId: string }
}

export async function aggregate(
  clientId: string,
  config: AggregatorConfig,
  dateRange: DateRange
): Promise<ActivityBundle> {
  const sources: string[] = []
  const tasks: Promise<ConnectorResult>[] = []

  if (config.github) {
    sources.push('github')
    tasks.push(fetchGitHubActivity(config.github.token, config.github.owner, config.github.repo, dateRange))
  }
  if (config.jira) {
    sources.push('jira')
    tasks.push(fetchJiraActivity(config.jira, dateRange))
  }
  if (config.slack) {
    sources.push('slack')
    tasks.push(fetchSlackActivity(config.slack, dateRange))
  }

  const results = await Promise.allSettled(tasks)

  const sourcesUsed: string[] = []
  const sourcesFailed: string[] = []
  const allItems: ActivityBundle['items'] = []

  for (let i = 0; i < results.length; i++) {
    const result = results[i]
    const source = sources[i]
    if (result.status === 'fulfilled') {
      if (result.value.error) {
        sourcesFailed.push(result.value.source)
      } else {
        sourcesUsed.push(result.value.source)
        allItems.push(...result.value.items)
      }
    } else {
      sourcesFailed.push(source)
    }
  }

  return {
    clientId,
    dateRange,
    items: allItems.sort((a, b) => b.date.getTime() - a.date.getTime()),
    sourcesUsed,
    sourcesFailed,
  }
}
