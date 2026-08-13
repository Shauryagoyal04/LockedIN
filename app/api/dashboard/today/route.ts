import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getDayNumber, getDaysRemaining } from '@/lib/utils'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: parseInt(session.user.id) },
    select: { lockInStart: true, lockInDays: true },
  })

  const startDate = user?.lockInStart?.toISOString().slice(0, 10) ?? null
  const totalDays = user?.lockInDays ?? 30

  return NextResponse.json({
    date: new Date().toISOString(),
    dayNumber: getDayNumber(startDate, totalDays),
    daysRemaining: getDaysRemaining(startDate, totalDays),
    totalDays,
    lockInStart: startDate,
    dsaToday: null,
    gymToday: null,
    score: null,
  })
}
