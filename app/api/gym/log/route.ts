import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { parseWorkoutLog } from '@/lib/gym/gemini'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const userId = parseInt(session.user.id)

  const body = await req.json().catch(() => null)
  const text: string | undefined = body?.text?.trim()
  if (!text) {
    return NextResponse.json({ error: 'Missing workout description' }, { status: 400 })
  }

  let parsed
  try {
    parsed = await parseWorkoutLog(text)
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Failed to parse workout log' },
      { status: 422 }
    )
  }

  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)

  const created = await prisma.gymSession.create({
    data: {
      userId,
      date: today,
      rawLog: text,
      exercises: {
        create: parsed.exercises.map((ex) => {
          const totalVolumeKg = ex.sets.reduce(
            (sum, s) => sum + (s.weightKg ?? 0) * s.reps, 0
          )
          return {
            name: ex.name,
            muscleGroup: ex.muscleGroup,
            setsJson: ex.sets as unknown as Prisma.InputJsonValue,
            totalVolumeKg: totalVolumeKg > 0 ? totalVolumeKg : null,
          }
        }),
      },
    },
    include: { exercises: true },
  })

  return NextResponse.json(created)
}
