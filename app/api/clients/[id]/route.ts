import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '../../auth/[...nextauth]/auth'
import { prisma } from '@/lib/prisma'
import { encryptCredential } from '@/lib/crypto'
import { IntegrationInputSchema } from '@/lib/integration-schemas'

const UpdateBodySchema = z.object({
  name: z.string().min(1).max(200).transform(s => s.trim()).optional(),
  tone: z.enum(['formal', 'friendly', 'technical']).optional(),
  language: z.string().min(1).max(50).optional(),
  format: z.enum(['email-prose', 'bullet-points']).optional(),
  integrations: z.array(IntegrationInputSchema).optional(),
})

function encryptIntegrationConfig(source: string, config: Record<string, string>): Record<string, string> {
  const out = { ...config }
  if (source === 'jira' && out.apiToken) out.apiToken = encryptCredential(out.apiToken)
  if (source === 'slack' && out.token) out.token = encryptCredential(out.token)
  return out
}

async function getAuthorizedClient(id: string, userId: string) {
  return prisma.client.findFirst({ where: { id, userId } })
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const existing = await getAuthorizedClient(params.id, session.user.id)
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  let parsed: z.infer<typeof UpdateBodySchema>
  try {
    parsed = UpdateBodySchema.parse(await req.json())
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0].message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { name, tone, language, format, integrations } = parsed

  if (integrations !== undefined) {
    await prisma.integration.deleteMany({ where: { clientId: params.id } })
  }

  const client = await prisma.client.update({
    where: { id: params.id },
    data: {
      ...(name !== undefined && { name }),
      ...(tone !== undefined && { tone }),
      ...(language !== undefined && { language }),
      ...(format !== undefined && { format }),
      ...(integrations !== undefined && {
        integrations: {
          create: integrations.map(i => ({
            source: i.source,
            config: encryptIntegrationConfig(i.source, i.config as Record<string, string>),
          })),
        },
      }),
    },
    include: { integrations: true },
  })

  return NextResponse.json(client)
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const existing = await getAuthorizedClient(params.id, session.user.id)
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await prisma.client.delete({ where: { id: params.id } })

  return new NextResponse(null, { status: 204 })
}
