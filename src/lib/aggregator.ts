import type { ActivityBundle, ConnectorResult, DateRange } from './types'
import { fetchGitHubActivity } from './connectors/github'
import { fetchJiraActivity } from './connectors/jira'

export type AggregatorConfig = {
  github?: { token: string; owner: string; repo: string }
  jira?: { baseUrl: string; email: string; apiToken: string; projectKey: string }
}

export async function aggregate(
  clientId: string,
  config: AggregatorConfig,
  dateRange: DateRange
): Promise<ActivityBundle> {
  const tasks: Promise<ConnectorResult>[] = []

  if (config.github) tasks.push(fetchGitHubActivity(config.github.token, config.github.owner, config.github.repo, dateRange))
  if (config.jira) tasks.push(fetchJiraActivity(config.jira, dateRange))

  const results = await Promise.allSettled(tasks)

  const sourcesUsed: string[] = []
  const sourcesFailed: string[] = []
  const allItems: ActivityBundle['items'] = []

  for (const result of results) {
    if (result.status === 'fulfilled') {
      if (result.value.error) {
        sourcesFailed.push(result.value.source)
      } else {
        sourcesUsed.push(result.value.source)
        allItems.push(...result.value.items)
      }
    } else {
      sourcesFailed.push('unknown')
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
