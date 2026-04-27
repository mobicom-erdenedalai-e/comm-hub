import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '../auth/[...nextauth]/auth'
import { prisma } from '@/lib/prisma'
import { aggregate, type AggregatorConfig } from '@/lib/aggregator'
import { buildPrompt } from '@/lib/prompt-engine'
import { generateWithGitHubModels } from '@/lib/github-models'
import { parseMeetingTranscript } from '@/lib/connectors/meeting'
import { decryptCredential } from '@/lib/crypto'
import { checkRateLimit } from '@/lib/rate-limit'
import { env } from '@/lib/env'
import type { ToneConfig } from '@/lib/types'
import type { GitHubConfig, JiraConfig, SlackConfig } from '@/lib/integration-schemas'

const GenerateBodySchema = z.object({
  clientId: z.string().min(1),
  artifactType: z.enum(['weekly-report', 'meeting-summary', 'status-reply', 'handover-doc']),
  dateRange: z.object({
    from: z.string().min(1),
    to: z.string().min(1),
  }).refine(r => {
    const from = new Date(r.from)
    const to = new Date(r.to)
    return !isNaN(from.getTime()) && !isNaN(to.getTime()) && from <= to
  }, { message: 'dateRange must contain valid dates with from ≤ to' }),
  question: z.string().optional(),
  transcript: z.string().optional(),
})

function decryptConfig(source: string, config: Record<string, string>): Record<string, string> {
  const out = { ...config }
  if (source === 'jira' && out.apiToken) out.apiToken = decryptCredential(out.apiToken)
  if (source === 'slack' && out.token) out.token = decryptCredential(out.token)
  return out
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (!checkRateLimit(`generate:${session.user.id}`, 10, 60_000)) {
    return NextResponse.json({ error: 'Rate limit exceeded — try again in a minute' }, { status: 429 })
  }

  let body: z.infer<typeof GenerateBodySchema>
  try {
    body = GenerateBodySchema.parse(await req.json())
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0].message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { clientId, artifactType, dateRange, question, transcript } = body

  const client = await prisma.client.findFirst({
    where: { id: clientId, userId: session.user.id },
    include: { integrations: true },
  })
  if (!client) return NextResponse.json({ error: 'Client not found' }, { status: 404 })

  const tone: ToneConfig = {
    tone: client.tone as ToneConfig['tone'],
    language: client.language,
    format: client.format as ToneConfig['format'],
  }

  const githubToken = env.GITHUB_TOKEN
  const config: AggregatorConfig = {}

  for (const integration of client.integrations) {
    const rawConfig = integration.config as Record<string, string>
    const decrypted = decryptConfig(integration.source, rawConfig)

    if (integration.source === 'github') {
      const c = decrypted as unknown as GitHubConfig
      config.github = { token: githubToken, owner: c.owner, repo: c.repo }
    }
    if (integration.source === 'jira') {
      config.jira = decrypted as unknown as JiraConfig
    }
    if (integration.source === 'slack') {
      config.slack = decrypted as unknown as SlackConfig
    }
  }

  const parsedRange = {
    from: new Date(dateRange.from),
    to: new Date(dateRange.to),
  }

  const bundle = await aggregate(clientId, config, parsedRange)
  if (transcript) {
    const meetingResult = parseMeetingTranscript(transcript)
    bundle.items.push(...meetingResult.items)
    if (meetingResult.items.length > 0) bundle.sourcesUsed.push('meeting')
  }
  const prompt = buildPrompt(artifactType, bundle, tone, { question, transcript })
  const draft = await generateWithGitHubModels({ prompt })

  const artifact = await prisma.artifact.create({
    data: {
      clientId,
      type: artifactType,
      content: draft,
      sourcesUsed: bundle.sourcesUsed,
      dateRangeFrom: parsedRange.from,
      dateRangeTo: parsedRange.to,
    },
  })

  return NextResponse.json({
    draft,
    sourcesUsed: bundle.sourcesUsed,
    sourcesFailed: bundle.sourcesFailed,
    artifactId: artifact.id,
  })
}
