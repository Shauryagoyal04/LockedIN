import { prisma } from '@/lib/prisma'
import { parseSets, type GymSet } from '@/lib/gym/sets'

export interface ExerciseHistoryPoint {
  date: string
  maxWeightKg: number | null
  totalSets: number
  totalReps: number
  estimatedOneRepMax: number | null
  isPr: boolean
}

export interface ExerciseHistory {
  displayName: string
  normalizedName: string
  points: ExerciseHistoryPoint[]
}

function epley(set: GymSet): number | null {
  if (set.weight === null) return null
  return set.weight * (1 + set.reps / 30)
}

export async function getExerciseHistory(
  userId: number,
  normalizedName: string
): Promise<ExerciseHistory | null> {
  const exercises = await prisma.gymExercise.findMany({
    where: { normalizedName, session: { userId } },
    include: { session: { select: { date: true } } },
    orderBy: { session: { date: 'asc' } },
  })

  if (exercises.length === 0) return null

  const points: ExerciseHistoryPoint[] = exercises.map((ex) => {
    const sets = parseSets(ex.setsJson)
    const weighted = sets.filter((s) => s.weight !== null)
    const maxWeightKg = weighted.length > 0 ? Math.max(...weighted.map((s) => s.weight as number)) : null
    const totalReps = sets.reduce((sum, s) => sum + s.reps, 0)

    let bestOneRepMax: number | null = null
    for (const s of sets) {
      const orm = epley(s)
      if (orm !== null && (bestOneRepMax === null || orm > bestOneRepMax)) {
        bestOneRepMax = orm
      }
    }

    return {
      date: ex.session.date.toISOString().slice(0, 10),
      maxWeightKg,
      totalSets: sets.length,
      totalReps,
      estimatedOneRepMax: bestOneRepMax !== null ? Math.round(bestOneRepMax * 10) / 10 : null,
      isPr: ex.isPr,
    }
  })

  return {
    displayName: exercises[exercises.length - 1].name,
    normalizedName,
    points,
  }
}
