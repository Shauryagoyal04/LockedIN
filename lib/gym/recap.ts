import { Type } from '@google/genai'
import { prisma } from '@/lib/prisma'
import { getClient } from '@/lib/gym/gemini'
import { parseSets, tonnage } from '@/lib/gym/sets'
import { startOfIsoWeekUTC, endOfIsoWeekUTC, weekKey } from '@/lib/gym/week'
import { MUSCLE_GROUPS, MUSCLE_GROUP_META } from '@/lib/gym/constants'

export interface WeeklyStatsSummary {
  weekStart: string
  totalSets: number
  totalTonnageKg: number
  trainingDays: number
  setsByGroup: { group: string; label: string; sets: number; target: number }[]
  newPRs: { name: string; weightKg: number }[]
  mostTrainedGroup: string | null
  leastTrainedGroup: string | null
}

export async function aggregateWeeklyStats(userId: number, weekStart: Date): Promise<WeeklyStatsSummary> {
  const weekEnd = endOfIsoWeekUTC(weekStart)

  const sessions = await prisma.gymSession.findMany({
    where: { userId, date: { gte: weekStart, lt: weekEnd } },
    include: { exercises: true },
  })

  let totalSets = 0
  let totalTonnageKg = 0
  const setsByGroupMap = new Map<string, number>()
  const trainingDays = new Set<string>()
  const newPRs: { name: string; weightKg: number }[] = []

  for (const s of sessions) {
    if (!s.isRestDay && s.exercises.length > 0) {
      trainingDays.add(s.date.toISOString().slice(0, 10))
    }
    for (const ex of s.exercises) {
      const sets = parseSets(ex.setsJson)
      totalSets += sets.length
      totalTonnageKg += tonnage(sets)
      const group = ex.muscleGroup ?? 'other'
      setsByGroupMap.set(group, (setsByGroupMap.get(group) ?? 0) + sets.length)
      if (ex.isPr) {
        const best = Math.max(...sets.map((s) => s.weight ?? 0))
        newPRs.push({ name: ex.name, weightKg: best })
      }
    }
  }

  const setsByGroup = MUSCLE_GROUPS.filter((g) => g !== 'other').map((group) => ({
    group,
    label: MUSCLE_GROUP_META[group].label,
    sets: setsByGroupMap.get(group) ?? 0,
    target: MUSCLE_GROUP_META[group].weeklyTarget,
  }))

  const trained = setsByGroup.filter((g) => g.sets > 0)
  const mostTrainedGroup = trained.length > 0
    ? trained.reduce((a, b) => (b.sets > a.sets ? b : a)).label
    : null
  const leastTrainedGroup = trained.length > 0
    ? trained.reduce((a, b) => (b.sets < a.sets ? b : a)).label
    : null

  return {
    weekStart: weekKey(weekStart),
    totalSets,
    totalTonnageKg: Math.round(totalTonnageKg),
    trainingDays: trainingDays.size,
    setsByGroup,
    newPRs,
    mostTrainedGroup,
    leastTrainedGroup,
  }
}

interface RecapContent {
  headline: string
  highlights: string[]
  focusNextWeek: string
}

function templateRecap(stats: WeeklyStatsSummary): RecapContent {
  const headline = stats.trainingDays === 0
    ? 'No workouts logged this week'
    : `${stats.trainingDays} training day${stats.trainingDays === 1 ? '' : 's'}, ${stats.totalSets} sets logged`
  const highlights: string[] = []
  if (stats.totalTonnageKg > 0) highlights.push(`Total tonnage: ${stats.totalTonnageKg}kg`)
  if (stats.newPRs.length > 0) {
    highlights.push(`New PRs: ${stats.newPRs.map((pr) => `${pr.name} ${pr.weightKg}kg`).join(', ')}`)
  }
  if (stats.mostTrainedGroup) highlights.push(`Most trained: ${stats.mostTrainedGroup}`)
  const focusNextWeek = stats.leastTrainedGroup
    ? `Prioritize ${stats.leastTrainedGroup} next week — it saw the least volume.`
    : 'Log a few workouts next week to get a tailored focus area.'
  return { headline, highlights: highlights.slice(0, 3), focusNextWeek }
}

async function callGemini(stats: WeeklyStatsSummary): Promise<RecapContent> {
  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      headline: { type: Type.STRING },
      highlights: { type: Type.ARRAY, items: { type: Type.STRING } },
      focusNextWeek: { type: Type.STRING },
    },
    required: ['headline', 'highlights', 'focusNextWeek'],
  }

  const prompt = 'Write a short, motivating weekly gym recap from this aggregated training summary. ' +
    'Return a headline (one short sentence), 2-3 highlights, and one focus recommendation for next week. ' +
    'Never invent numbers not present in the summary.\n\n' +
    JSON.stringify(stats)

  const res = await getClient().models.generateContent({
    model: 'gemini-3.6-flash',
    contents: prompt,
    config: { responseMimeType: 'application/json', responseSchema },
  })

  const raw = res.text
  if (!raw) throw new Error('Gemini returned an empty response')

  const parsed = JSON.parse(raw) as Partial<RecapContent>
  if (!parsed.headline || !Array.isArray(parsed.highlights) || !parsed.focusNextWeek) {
    throw new Error('Gemini returned an incomplete recap')
  }
  return {
    headline: parsed.headline,
    highlights: parsed.highlights.slice(0, 3),
    focusNextWeek: parsed.focusNextWeek,
  }
}

const REGENERATE_COOLDOWN_MS = 60 * 60 * 1000

export class RateLimitError extends Error {}

export async function generateWeeklyRecap(
  userId: number,
  weekStart: Date,
  force = false
) {
  const normalizedWeekStart = startOfIsoWeekUTC(weekStart)

  const existing = await prisma.weeklyRecap.findUnique({
    where: { userId_weekStart: { userId, weekStart: normalizedWeekStart } },
  })

  if (existing && !force) {
    return { recap: existing, cached: true }
  }

  if (force) {
    const mostRecent = await prisma.weeklyRecap.findFirst({
      where: { userId },
      orderBy: { generatedAt: 'desc' },
    })
    if (mostRecent && Date.now() - mostRecent.generatedAt.getTime() < REGENERATE_COOLDOWN_MS) {
      throw new RateLimitError('You can only regenerate a recap a few times per hour. Try again later.')
    }
  }

  const stats = await aggregateWeeklyStats(userId, normalizedWeekStart)

  let content: RecapContent
  if (stats.trainingDays === 0) {
    content = templateRecap(stats)
  } else {
    try {
      content = await callGemini(stats)
    } catch {
      content = templateRecap(stats)
    }
  }

  const recap = await prisma.weeklyRecap.upsert({
    where: { userId_weekStart: { userId, weekStart: normalizedWeekStart } },
    create: {
      userId,
      weekStart: normalizedWeekStart,
      headline: content.headline,
      highlights: content.highlights,
      focusNextWeek: content.focusNextWeek,
      totalSets: stats.totalSets,
      totalTonnageKg: stats.totalTonnageKg,
      trainingDays: stats.trainingDays,
    },
    update: {
      headline: content.headline,
      highlights: content.highlights,
      focusNextWeek: content.focusNextWeek,
      totalSets: stats.totalSets,
      totalTonnageKg: stats.totalTonnageKg,
      trainingDays: stats.trainingDays,
      generatedAt: new Date(),
    },
  })

  return { recap, cached: false }
}
