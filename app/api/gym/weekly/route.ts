import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { MUSCLE_GROUPS, MUSCLE_GROUP_META } from '@/lib/gym/constants'
import { startOfIsoWeekUTC } from '@/lib/gym/week'
import { parseSets } from '@/lib/gym/sets'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const userId = parseInt(session.user.id)

  const weekStart = startOfIsoWeekUTC(new Date())
  const weekEnd = new Date(weekStart)
  weekEnd.setUTCDate(weekEnd.getUTCDate() + 7)

  const sessions = await prisma.gymSession.findMany({
    where: { userId, date: { gte: weekStart, lt: weekEnd } },
    include: { exercises: true },
    orderBy: { date: 'desc' },
  })

  const setsByGroup = new Map<string, number>()
  for (const s of sessions) {
    for (const ex of s.exercises) {
      const group = ex.muscleGroup ?? 'other'
      setsByGroup.set(group, (setsByGroup.get(group) ?? 0) + parseSets(ex.setsJson).length)
    }
  }

  const volume = MUSCLE_GROUPS
    .filter((g) => g !== 'other')
    .map((group) => ({
      group,
      label: MUSCLE_GROUP_META[group].label,
      color: MUSCLE_GROUP_META[group].color,
      sets: setsByGroup.get(group) ?? 0,
      target: MUSCLE_GROUP_META[group].weeklyTarget,
    }))

  const recentSessions = await prisma.gymSession.findMany({
    where: { userId },
    include: { exercises: true },
    orderBy: { date: 'desc' },
    take: 10,
  })

  return NextResponse.json({
    weekStart: weekStart.toISOString().slice(0, 10),
    volume,
    recentSessions: recentSessions.map((s) => ({
      id: s.id,
      date: s.date.toISOString().slice(0, 10),
      rawLog: s.rawLog,
      exercises: s.exercises.map((e) => ({
        id: e.id,
        name: e.name,
        muscleGroup: e.muscleGroup,
        sets: e.setsJson,
        isPr: e.isPr,
      })),
    })),
  })
}
