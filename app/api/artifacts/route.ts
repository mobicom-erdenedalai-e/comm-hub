import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const clientId = searchParams.get('clientId')

  if (!clientId) return NextResponse.json({ error: 'clientId is required' }, { status: 400 })

  const client = await prisma.client.findFirst({
    where: { id: clientId, userId: session.user.id },
  })
  if (!client) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const artifacts = await prisma.artifact.findMany({
    where: { clientId },
    orderBy: { createdAt: 'desc' },
    take: 20,
    select: {
      id: true,
      type: true,
      content: true,
      sourcesUsed: true,
      dateRangeFrom: true,
      dateRangeTo: true,
      createdAt: true,
    },
  })

  return NextResponse.json(artifacts)
}
