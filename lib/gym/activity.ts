import { prisma } from '@/lib/prisma'
import { parseSets } from '@/lib/gym/sets'
import { isoDateUTC } from '@/lib/gym/week'

export interface ActivityDay {
  date: string
  value: number
}

export async function getGymActivity(userId: number, weeks: number): Promise<ActivityDay[]> {
  const since = new Date()
  since.setUTCDate(since.getUTCDate() - weeks * 7)
  since.setUTCHours(0, 0, 0, 0)

  const sessions = await prisma.gymSession.findMany({
    where: { userId, date: { gte: since }, isRestDay: false },
    include: { exercises: { select: { setsJson: true } } },
  })

  const byDate = new Map<string, number>()
  for (const s of sessions) {
    const key = isoDateUTC(s.date)
    const setsToday = s.exercises.reduce((sum, ex) => sum + parseSets(ex.setsJson).length, 0)
    byDate.set(key, (byDate.get(key) ?? 0) + setsToday)
  }

  return Array.from(byDate.entries()).map(([date, value]) => ({ date, value }))
}

export interface StreakInfo {
  current: number
  longest: number
  thisMonth: { active: number; total: number }
}

export async function getGymStreak(userId: number): Promise<StreakInfo> {
  const activity = await getGymActivity(userId, 52)
  const activeDates = new Set(activity.filter((d) => d.value > 0).map((d) => d.date))

  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)

  const daysInMonth = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() + 1, 0)).getUTCDate()
  let activeThisMonth = 0
  for (const dateStr of Array.from(activeDates)) {
    const d = new Date(dateStr + 'T00:00:00.000Z')
    if (d.getUTCFullYear() === today.getUTCFullYear() && d.getUTCMonth() === today.getUTCMonth()) {
      activeThisMonth++
    }
  }
  const thisMonth = { active: activeThisMonth, total: daysInMonth }

  if (activeDates.size === 0) return { current: 0, longest: 0, thisMonth }

  let current = 0
  const cursor = new Date(today)
  if (!activeDates.has(isoDateUTC(cursor))) {
    cursor.setUTCDate(cursor.getUTCDate() - 1)
  }
  while (activeDates.has(isoDateUTC(cursor))) {
    current++
    cursor.setUTCDate(cursor.getUTCDate() - 1)
  }

  const sortedDates = Array.from(activeDates).sort()
  let longest = 0
  let run = 0
  let prevTime: number | null = null
  for (const dateStr of sortedDates) {
    const t = new Date(dateStr + 'T00:00:00.000Z').getTime()
    if (prevTime !== null && t - prevTime === 86400000) {
      run++
    } else {
      run = 1
    }
    longest = Math.max(longest, run)
    prevTime = t
  }

  return { current, longest: Math.max(longest, current), thisMonth }
}
