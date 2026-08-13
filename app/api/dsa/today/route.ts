import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = parseInt(session.user.id)

  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)

  const profile = await prisma.dSAProfile.findUnique({ where: { userId } })
  const dailyTarget = profile?.dailyTarget ?? 5

  // Get today's snapshots first
  const todaySnapshots = await prisma.dSASnapshot.findMany({
    where: { userId, date: today },
  })
  const todayByPlatform = new Map(todaySnapshots.map((s) => [s.platform, s]))

  // For any platform that has no snapshot today, get its most recent snapshot
  const allPlatforms = ['leetcode', 'codeforces', 'codechef']
  const missingPlatforms = allPlatforms.filter((p) => !todayByPlatform.has(p))

  const recentSnapshots = missingPlatforms.length > 0
    ? await prisma.dSASnapshot.findMany({
        where: { userId, platform: { in: missingPlatforms } },
        orderBy: { date: 'desc' },
        distinct: ['platform'],
      })
    : []

  const recentByPlatform = new Map(recentSnapshots.map((s) => [s.platform, s]))
  const todayISO = today.toISOString().slice(0, 10)
  const totalToday = todaySnapshots.reduce((sum, s) => sum + s.problemsSolvedToday, 0)

  // Always return all 4 platform cards — zero out if no data exists yet
  const byPlatform = allPlatforms.map((platform) => {
    const snap = todayByPlatform.get(platform) ?? recentByPlatform.get(platform) ?? null
    const isToday = snap?.date.toISOString().slice(0, 10) === todayISO
    return {
      platform,
      problemsSolvedToday: isToday ? (snap?.problemsSolvedToday ?? 0) : 0,
      problemsSolvedTotal: snap?.problemsSolvedTotal ?? 0,
      rating: snap?.rating ?? null,
      isStale: snap != null && !isToday,
    }
  })

  const lastFetched = todaySnapshots.length > 0
    ? todaySnapshots.reduce(
        (latest, s) => (s.createdAt > latest ? s.createdAt : latest),
        todaySnapshots[0].createdAt
      )
    : null

  return NextResponse.json({
    date: today.toISOString(),
    totalToday,
    dailyTarget,
    progress: dailyTarget > 0 ? Math.min(100, Math.round((totalToday / dailyTarget) * 100)) : 0,
    byPlatform,
    lastFetched,
  })
}
