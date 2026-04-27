import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/auth'
import { prisma } from '@/lib/prisma'

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

  const body = await req.json()
  const { name, tone = 'professional', language = 'English', format = 'bullet', integrations = [] } = body

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return NextResponse.json({ error: 'name is required' }, { status: 400 })
  }

  const client = await prisma.client.create({
    data: {
      userId: session.user.id,
      name: name.trim(),
      tone,
      language,
      format,
      integrations: {
        create: integrations.map((i: { source: string; config: unknown }) => ({
          source: i.source,
          config: i.config ?? {},
        })),
      },
    },
    include: { integrations: true },
  })

  return NextResponse.json(client, { status: 201 })
}
