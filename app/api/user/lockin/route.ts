import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const user = await prisma.user.findUnique({
    where: { id: parseInt(session.user.id) },
    select: { lockInStart: true, lockInDays: true },
  })
  return NextResponse.json(user)
}

export async function PUT(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { lockInStart, lockInDays } = await req.json()
  const user = await prisma.user.update({
    where: { id: parseInt(session.user.id) },
    data: {
      lockInStart: lockInStart ? new Date(lockInStart) : null,
      lockInDays: lockInDays ? parseInt(lockInDays) : 30,
    },
    select: { lockInStart: true, lockInDays: true },
  })
  return NextResponse.json(user)
}
