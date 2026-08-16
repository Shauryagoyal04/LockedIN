import { prisma } from '@/lib/prisma'
import { MUSCLE_GROUPS, MUSCLE_GROUP_META, type MuscleGroup } from '@/lib/gym/constants'
import { startOfIsoWeekUTC, endOfIsoWeekUTC } from '@/lib/gym/week'
import { parseSets } from '@/lib/gym/sets'

export interface MuscleRecommendation {
  group: MuscleGroup
  label: string
  color: string
  sets: number
  target: number
  daysSinceLastTrained: number | null
}

export async function getTrainingRecommendation(userId: number): Promise<MuscleRecommendation[]> {
  const now = new Date()
  const weekStart = startOfIsoWeekUTC(now)
  const weekEnd = endOfIsoWeekUTC(now)

  const weekSessions = await prisma.gymSession.findMany({
    where: { userId, date: { gte: weekStart, lt: weekEnd } },
    include: { exercises: true },
  })

  const setsByGroup = new Map<string, number>()
  for (const s of weekSessions) {
    for (const ex of s.exercises) {
      const group = ex.muscleGroup ?? 'other'
      setsByGroup.set(group, (setsByGroup.get(group) ?? 0) + parseSets(ex.setsJson).length)
    }
  }

  const recentSessions = await prisma.gymSession.findMany({
    where: { userId, exercises: { some: {} } },
    include: { exercises: { select: { muscleGroup: true } } },
    orderBy: { date: 'desc' },
    take: 200,
  })

  const lastTrainedByGroup = new Map<string, Date>()
  for (const s of recentSessions) {
    for (const ex of s.exercises) {
      const group = ex.muscleGroup ?? 'other'
      if (!lastTrainedByGroup.has(group)) {
        lastTrainedByGroup.set(group, s.date)
      }
    }
  }

  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)

  const candidates = MUSCLE_GROUPS.filter((g) => g !== 'other').map((group) => {
    const meta = MUSCLE_GROUP_META[group]
    const sets = setsByGroup.get(group) ?? 0
    const lastTrained = lastTrainedByGroup.get(group) ?? null
    const daysSinceLastTrained = lastTrained
      ? Math.round((today.getTime() - lastTrained.getTime()) / (1000 * 60 * 60 * 24))
      : null
    return {
      group,
      label: meta.label,
      color: meta.color,
      sets,
      target: meta.weeklyTarget,
      ratio: meta.weeklyTarget > 0 ? sets / meta.weeklyTarget : 1,
      daysSinceLastTrained,
    }
  })

  candidates.sort((a, b) => {
    if (a.ratio !== b.ratio) return a.ratio - b.ratio
    const aDays = a.daysSinceLastTrained ?? Infinity
    const bDays = b.daysSinceLastTrained ?? Infinity
    return bDays - aDays
  })

  return candidates.slice(0, 3).map(({ group, label, color, sets, target, daysSinceLastTrained }) => ({
    group,
    label,
    color,
    sets,
    target,
    daysSinceLastTrained,
  }))
}
