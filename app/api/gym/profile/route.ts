import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = parseInt(session.user.id)

  const profile = await prisma.gymProfile.upsert({
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

  const {
    heightCm,
    currentWeightKg,
    targetWeightKg,
    goal,
    experienceLevel,
    trainingDaysPerWeek,
    programSplit,
    injuryNotes,
  } = body

  const data = {
    heightCm: heightCm ? parseInt(heightCm) : null,
    currentWeightKg: currentWeightKg ? parseFloat(currentWeightKg) : null,
    targetWeightKg: targetWeightKg ? parseFloat(targetWeightKg) : null,
    goal: goal ?? null,
    experienceLevel: experienceLevel ?? null,
    trainingDaysPerWeek: trainingDaysPerWeek ? parseInt(trainingDaysPerWeek) : null,
    programSplit: programSplit ?? null,
    injuryNotes: injuryNotes ?? null,
  }

  const profile = await prisma.gymProfile.upsert({
    where: { userId },
    update: data,
    create: { userId, ...data },
  })

  return NextResponse.json(profile)
}
