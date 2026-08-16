import { prisma } from '@/lib/prisma'
import { parseSets, maxWeight } from '@/lib/gym/sets'

export interface ExercisePR {
  normalizedName: string
  displayName: string
  bestWeightKg: number
  reps: number
  date: string
}

export async function getPersonalRecords(userId: number): Promise<ExercisePR[]> {
  const exercises = await prisma.gymExercise.findMany({
    where: { session: { userId } },
    include: { session: { select: { date: true } } },
    orderBy: { session: { date: 'asc' } },
  })

  const bestByName = new Map<string, ExercisePR>()

  for (const ex of exercises) {
    const sets = parseSets(ex.setsJson)
    const best = maxWeight(sets)
    if (best === null) continue // bodyweight-only exercise, no weight to compare

    const reps = sets.find((s) => s.weight === best)?.reps ?? 0
    const date = ex.session.date.toISOString().slice(0, 10)

    const existing = bestByName.get(ex.normalizedName)
    if (!existing || best >= existing.bestWeightKg) {
      bestByName.set(ex.normalizedName, {
        normalizedName: ex.normalizedName,
        displayName: ex.name,
        bestWeightKg: best,
        reps,
        date,
      })
    }
  }

  return Array.from(bestByName.values()).sort((a, b) => (a.date < b.date ? 1 : -1))
}

export interface NewPR {
  exerciseId: number
  normalizedName: string
  displayName: string
  weightKg: number
}

export async function checkForNewPRs(userId: number, sessionId: number): Promise<NewPR[]> {
  const newExercises = await prisma.gymExercise.findMany({
    where: { sessionId, session: { userId } },
  })
  if (newExercises.length === 0) return []

  const normalizedNames = newExercises.map((ex) => ex.normalizedName)

  const priorExercises = await prisma.gymExercise.findMany({
    where: {
      session: { userId },
      normalizedName: { in: normalizedNames },
      sessionId: { not: sessionId },
    },
    select: { normalizedName: true, setsJson: true },
  })

  const priorBestByName = new Map<string, number>()
  for (const ex of priorExercises) {
    const best = maxWeight(parseSets(ex.setsJson))
    if (best === null) continue
    const current = priorBestByName.get(ex.normalizedName)
    if (current === undefined || best > current) {
      priorBestByName.set(ex.normalizedName, best)
    }
  }

  const newPRs: NewPR[] = []
  for (const ex of newExercises) {
    const best = maxWeight(parseSets(ex.setsJson))
    if (best === null) continue

    const priorBest = priorBestByName.get(ex.normalizedName)
    if (priorBest === undefined) continue // first-ever log of this exercise, not a PR

    if (best > priorBest) {
      newPRs.push({
        exerciseId: ex.id,
        normalizedName: ex.normalizedName,
        displayName: ex.name,
        weightKg: best,
      })
    }
  }

  return newPRs
}
