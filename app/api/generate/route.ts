import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/auth'
import { prisma } from '@/lib/prisma'
import { aggregate, type AggregatorConfig } from '@/lib/aggregator'
import { buildPrompt } from '@/lib/prompt-engine'
import { generateWithGitHubModels } from '@/lib/github-models'
import { parseMeetingTranscript } from '@/lib/connectors/meeting'
import type { GenerateRequest, ToneConfig } from '@/lib/types'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body: GenerateRequest & { transcript?: string } = await req.json()
  const { clientId, artifactType, dateRange, question, transcript } = body

  const client = await prisma.client.findUnique({
    where: { id: clientId },
    include: { integrations: true },
  })
  if (!client) return NextResponse.json({ error: 'Client not found' }, { status: 404 })

  const tone: ToneConfig = {
    tone: client.tone as ToneConfig['tone'],
    language: client.language,
    format: client.format as ToneConfig['format'],
  }

  const config: AggregatorConfig = {}
  const githubToken = process.env.GITHUB_TOKEN!
  for (const integration of client.integrations) {
    if (integration.source === 'github') {
      const c = integration.config as { owner: string; repo: string }
      config.github = { token: githubToken, owner: c.owner, repo: c.repo }
    }
    if (integration.source === 'jira') {
      config.jira = integration.config as AggregatorConfig['jira']
    }
    if (integration.source === 'slack') {
      config.slack = integration.config as AggregatorConfig['slack']
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
