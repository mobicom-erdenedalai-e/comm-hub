import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/auth'
import { prisma } from '@/lib/prisma'

async function getAuthorizedClient(id: string, userId: string) {
  return prisma.client.findFirst({ where: { id, userId } })
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const existing = await getAuthorizedClient(params.id, session.user.id)
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const body = await req.json()
  const { name, tone, language, format, integrations } = body

  await prisma.integration.deleteMany({ where: { clientId: params.id } })

  const client = await prisma.client.update({
    where: { id: params.id },
    data: {
      ...(name !== undefined && { name: name.trim() }),
      ...(tone !== undefined && { tone }),
      ...(language !== undefined && { language }),
      ...(format !== undefined && { format }),
      ...(integrations !== undefined && {
        integrations: {
          create: integrations.map((i: { source: string; config: unknown }) => ({
            source: i.source,
            config: i.config ?? {},
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
