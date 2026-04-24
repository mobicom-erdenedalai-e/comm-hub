import { Octokit } from '@octokit/rest'
import type { ActivityItem, ConnectorResult, DateRange } from '../types'

export async function fetchGitHubActivity(
  token: string,
  owner: string,
  repo: string,
  dateRange: DateRange
): Promise<ConnectorResult> {
  const octokit = new Octokit({ auth: token })
  const items: ActivityItem[] = []

  try {
    const { data: commits } = await octokit.repos.listCommits({
      owner,
      repo,
      since: dateRange.from.toISOString(),
      until: dateRange.to.toISOString(),
      per_page: 100,
    })

    for (const c of commits) {
      items.push({
        source: 'github',
        type: 'commit',
        title: c.commit.message.split('\n')[0],
        description: c.commit.message,
        url: c.html_url,
        date: new Date(c.commit.author?.date ?? ''),
        author: c.commit.author?.name,
      })
    }

    const { data: prs } = await octokit.pulls.list({
      owner,
      repo,
      state: 'closed',
      sort: 'updated',
      direction: 'desc',
      per_page: 50,
    })

    for (const pr of prs) {
      if (
        pr.merged_at &&
        new Date(pr.merged_at) >= dateRange.from &&
        new Date(pr.merged_at) <= dateRange.to
      ) {
        items.push({
          source: 'github',
          type: 'pull-request',
          title: pr.title,
          url: pr.html_url,
          date: new Date(pr.merged_at),
          author: pr.user?.login,
        })
      }
    }

    return { source: 'github', items }
  } catch (error) {
    return { source: 'github', items: [], error: String(error) }
  }
}
