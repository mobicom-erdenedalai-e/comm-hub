import { z } from 'zod'

export const GitHubConfigSchema = z.object({
  owner: z.string().regex(/^[a-zA-Z0-9_-]{1,39}$/, 'Invalid GitHub owner'),
  repo: z.string().regex(/^[a-zA-Z0-9._-]{1,100}$/, 'Invalid GitHub repo name'),
})

export const JiraConfigSchema = z.object({
  baseUrl: z.string().refine(raw => {
    try {
      const u = new URL(raw)
      return u.protocol === 'https:' && /^[a-z0-9-]+\.atlassian\.net$/.test(u.hostname)
    } catch { return false }
  }, 'baseUrl must be https://<subdomain>.atlassian.net'),
  email: z.string().email('Invalid Jira email'),
  apiToken: z.string().min(1).max(512),
  projectKey: z.string().regex(/^[A-Z][A-Z0-9_]{1,9}$/, 'Invalid Jira project key'),
})

export const SlackConfigSchema = z.object({
  token: z.string().startsWith('xoxb-', 'Slack bot token must start with xoxb-'),
  channelId: z.string().regex(/^[A-Z0-9]{9,11}$/, 'Invalid Slack channel ID'),
})

export const IntegrationInputSchema = z.discriminatedUnion('source', [
  z.object({ source: z.literal('github'), config: GitHubConfigSchema }),
  z.object({ source: z.literal('jira'), config: JiraConfigSchema }),
  z.object({ source: z.literal('slack'), config: SlackConfigSchema }),
])

export type GitHubConfig = z.infer<typeof GitHubConfigSchema>
export type JiraConfig = z.infer<typeof JiraConfigSchema>
export type SlackConfig = z.infer<typeof SlackConfigSchema>
