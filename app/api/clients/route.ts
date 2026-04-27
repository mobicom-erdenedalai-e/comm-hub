import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '../auth/[...nextauth]/auth'
import { prisma } from '@/lib/prisma'
import { encryptCredential } from '@/lib/crypto'
import { IntegrationInputSchema } from '@/lib/integration-schemas'

const ClientBodySchema = z.object({
  name: z.string().min(1, 'name is required').max(200).transform(s => s.trim()),
  tone: z.enum(['formal', 'friendly', 'technical']).default('formal'),
  language: z.string().min(1).max(50).default('en'),
  format: z.enum(['email-prose', 'bullet-points']).default('email-prose'),
  integrations: z.array(IntegrationInputSchema).default([]),
})

function encryptIntegrationConfig(source: string, config: Record<string, string>): Record<string, string> {
  const out = { ...config }
  if (source === 'jira' && out.apiToken) out.apiToken = encryptCredential(out.apiToken)
  if (source === 'slack' && out.token) out.token = encryptCredential(out.token)
  return out
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const clients = await prisma.client.findMany({
    where: { userId: session.user.id },
    include: { integrations: true },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(clients)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let parsed: z.infer<typeof ClientBodySchema>
  try {
    parsed = ClientBodySchema.parse(await req.json())
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0].message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { name, tone, language, format, integrations } = parsed

  const client = await prisma.client.create({
    data: {
      userId: session.user.id,
      name,
      tone,
      language,
      format,
      integrations: {
        create: integrations.map(i => ({
          source: i.source,
          config: encryptIntegrationConfig(i.source, i.config as Record<string, string>),
        })),
      },
    },
    include: { integrations: true },
  })

  return NextResponse.json(client, { status: 201 })
}
