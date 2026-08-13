import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { fetchLeetCode } from '@/lib/dsa/leetcode'
import { fetchCodeforces } from '@/lib/dsa/codeforces'
import { fetchCodeChef } from '@/lib/dsa/codechef'

interface PlatformResult {
  platform: string
  status: 'ok' | 'skipped' | 'error'
  totalSolved?: number
  problemsSolvedToday?: number
  rating?: number | null
  error?: string
}

export async function POST() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = parseInt(session.user.id)
  const profile = await prisma.dSAProfile.findUnique({ where: { userId } })

  if (!profile) {
    return NextResponse.json({ error: 'DSA profile not found' }, { status: 404 })
  }

  // Use UTC midnight so snapshot dates align with CF's UTC-based timestamps
  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)

  const yesterday = new Date(today)
  yesterday.setUTCDate(yesterday.getUTCDate() - 1)

  const prevSnapshots = await prisma.dSASnapshot.findMany({
    where: { userId, date: yesterday },
  })
  const prevByPlatform = Object.fromEntries(
    prevSnapshots.map((s) => [s.platform, s.problemsSolvedTotal])
  )

  const results: PlatformResult[] = []
  const tasks: Promise<void>[] = []

  if (profile.lcUsername) {
    tasks.push(
      fetchLeetCode(profile.lcUsername)
        .then(async (data) => {
          const prev = prevByPlatform['leetcode'] ?? data.totalSolved
          const solvedToday = Math.max(0, data.totalSolved - prev)
          await prisma.dSASnapshot.upsert({
            where: { userId_date_platform: { userId, date: today, platform: 'leetcode' } },
            update: { problemsSolvedTotal: data.totalSolved, problemsSolvedToday: solvedToday, rating: data.contestRating, rawData: data as object },
            create: { userId, date: today, platform: 'leetcode', problemsSolvedTotal: data.totalSolved, problemsSolvedToday: solvedToday, rating: data.contestRating, rawData: data as object },
          })
          results.push({ platform: 'leetcode', status: 'ok', totalSolved: data.totalSolved, problemsSolvedToday: solvedToday, rating: data.contestRating })
        })
        .catch((e) => void results.push({ platform: 'leetcode', status: 'error', error: String(e) }))
    )
  } else {
    results.push({ platform: 'leetcode', status: 'skipped' })
  }

  if (profile.cfHandle) {
    tasks.push(
      fetchCodeforces(profile.cfHandle)
        .then(async (data) => {
          const solvedToday = data.todayAC

          // 1. Upsert today's snapshot
          await prisma.dSASnapshot.upsert({
            where: { userId_date_platform: { userId, date: today, platform: 'codeforces' } },
            update: { problemsSolvedTotal: data.totalSolved, problemsSolvedToday: solvedToday, rating: data.rating },
            create: { userId, date: today, platform: 'codeforces', problemsSolvedTotal: data.totalSolved, problemsSolvedToday: solvedToday, rating: data.rating },
          })

          // 2. Backfill historical snapshots from dailyFirstAC map.
          //    Only touch past dates — today is already handled above.
          const todayKey = today.toISOString().slice(0, 10)
          const historicalEntries = Object.entries(data.dailyFirstAC).filter(
            ([dateKey]) => dateKey !== todayKey
          )
          await Promise.all(
            historicalEntries.map(([dateKey, count]) => {
              const date = new Date(dateKey + 'T00:00:00.000Z')
              return prisma.dSASnapshot.upsert({
                where: { userId_date_platform: { userId, date, platform: 'codeforces' } },
                // Don't overwrite a real snapshot with backfill data
                update: {},
                create: {
                  userId,
                  date,
                  platform: 'codeforces',
                  problemsSolvedToday: count,
                  problemsSolvedTotal: 0,  // cumulative total not tracked historically
                },
              })
            })
          )

          // 3. Upsert all submissions into DSASubmission (one row per unique problem)
          await Promise.all(
            data.submissions.map((sub) =>
              prisma.dSASubmission.upsert({
                where: { userId_platform_problemId: { userId, platform: 'codeforces', problemId: sub.problemId } },
                update: {
                  problemTitle: sub.problemTitle,
                  tags: sub.tags,
                  difficulty: sub.difficulty != null ? String(sub.difficulty) : null,
                  status: sub.status,
                  submittedAt: sub.submittedAt,
                },
                create: {
                  userId,
                  platform: 'codeforces',
                  problemId: sub.problemId,
                  problemTitle: sub.problemTitle,
                  tags: sub.tags,
                  difficulty: sub.difficulty != null ? String(sub.difficulty) : null,
                  status: sub.status,
                  submittedAt: sub.submittedAt,
                },
              })
            )
          )

          results.push({ platform: 'codeforces', status: 'ok', totalSolved: data.totalSolved, problemsSolvedToday: solvedToday, rating: data.rating })
        })
        .catch((e) => void results.push({ platform: 'codeforces', status: 'error', error: String(e) }))
    )
  } else {
    results.push({ platform: 'codeforces', status: 'skipped' })
  }

  if (profile.ccUsername) {
    tasks.push(
      fetchCodeChef(profile.ccUsername)
        .then(async (data) => {
          const prev = prevByPlatform['codechef'] ?? data.totalSolved
          const solvedToday = Math.max(0, data.totalSolved - prev)
          await prisma.dSASnapshot.upsert({
            where: { userId_date_platform: { userId, date: today, platform: 'codechef' } },
            update: { problemsSolvedTotal: data.totalSolved, problemsSolvedToday: solvedToday, rating: data.rating, rawData: data as object },
            create: { userId, date: today, platform: 'codechef', problemsSolvedTotal: data.totalSolved, problemsSolvedToday: solvedToday, rating: data.rating, rawData: data as object },
          })
          results.push({ platform: 'codechef', status: 'ok', totalSolved: data.totalSolved, problemsSolvedToday: solvedToday, rating: data.rating })
        })
        .catch((e) => void results.push({ platform: 'codechef', status: 'error', error: String(e) }))
    )
  } else {
    results.push({ platform: 'codechef', status: 'skipped' })
  }

  await Promise.all(tasks)

  const totalToday = results.reduce((sum, r) => sum + (r.problemsSolvedToday ?? 0), 0)

  return NextResponse.json({
    fetchedAt: new Date().toISOString(),
    totalSolvedToday: totalToday,
    platforms: results,
  })
}
