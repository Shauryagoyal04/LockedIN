import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { parseWorkoutLog } from '@/lib/gym/gemini'
import { normalizeExerciseName } from '@/lib/gym/exerciseName'
import { checkForNewPRs } from '@/lib/gym/prs'

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
            normalizedName: normalizeExerciseName(ex.name),
            muscleGroup: ex.muscleGroup,
            setsJson: ex.sets as unknown as Prisma.InputJsonValue,
            totalVolumeKg: totalVolumeKg > 0 ? totalVolumeKg : null,
          }
        }),
      },
    },
    include: { exercises: true },
  })

  const newPRs = await checkForNewPRs(userId, created.id)
  const prExerciseIds = new Set(newPRs.map((pr) => pr.exerciseId))
  if (prExerciseIds.size > 0) {
    await prisma.gymExercise.updateMany({
      where: { id: { in: Array.from(prExerciseIds) } },
      data: { isPr: true },
    })
  }

  return NextResponse.json({
    id: created.id,
    date: created.date.toISOString().slice(0, 10),
    rawLog: created.rawLog,
    exercises: created.exercises.map((e) => ({
      id: e.id,
      name: e.name,
      normalizedName: e.normalizedName,
      muscleGroup: e.muscleGroup,
      sets: e.setsJson,
      isPr: prExerciseIds.has(e.id),
    })),
    newPRs,
  })
}
