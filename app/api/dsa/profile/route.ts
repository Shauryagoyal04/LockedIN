import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = parseInt(session.user.id)

  const profile = await prisma.dSAProfile.upsert({
    where: { userId },
    update: {},
    create: { userId },
  })

  return NextResponse.json(profile)
}

export async function PUT(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = parseInt(session.user.id)
  const body = await req.json()

  const { lcUsername, cfHandle, ccUsername, dailyTarget, targetCfRating } = body

  const profile = await prisma.dSAProfile.upsert({
    where: { userId },
    update: {
      lcUsername: lcUsername ?? null,
      cfHandle: cfHandle ?? null,
      ccUsername: ccUsername ?? null,
      dailyTarget: dailyTarget ? parseInt(dailyTarget) : 5,
      targetCfRating: targetCfRating ? parseInt(targetCfRating) : null,
    },
    create: {
      userId,
      lcUsername: lcUsername ?? null,
      cfHandle: cfHandle ?? null,
      ccUsername: ccUsername ?? null,
      dailyTarget: dailyTarget ? parseInt(dailyTarget) : 5,
      targetCfRating: targetCfRating ? parseInt(targetCfRating) : null,
    },
  })

  return NextResponse.json(profile)
}
