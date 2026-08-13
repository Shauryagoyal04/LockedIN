// app/api/dsa/summary/route.ts
//
// Aggregates the bits the new DSA page needs that don't have routes yet:
//   - streak.current / streak.best   (computed from DSASnapshot days where solved > 0)
//   - topics                          (aggregated from DSASubmission.tags)
//   - recent                          (last 4 DSASubmission rows)
//   - nextContest                     (next Codeforces contest, if cfHandle set)
//
// All four fields are optional on the client — empty arrays / nulls render
// graceful empty states. Wire your Phase-2 submission fetchers to populate
// DSASubmission and topics + recent become populated automatically.

import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface CfContest {
  id: number
  name: string
  phase: string
  type: string
  startTimeSeconds: number
  durationSeconds: number
}

// Rough heuristic for "weak": below the 35th percentile of solved counts,
// OR < 5 problems solved in the topic. Tweak as you collect more data.
function markWeak(rows: { name: string; solved: number }[]) {
  if (rows.length === 0) return []
  const sorted = [...rows].sort((a, b) => a.solved - b.solved)
  const cutIdx = Math.floor(sorted.length * 0.35)
  const cut = sorted[cutIdx]?.solved ?? 5
  return rows.map(r => ({ ...r, isWeak: r.solved <= cut || r.solved < 5 }))
}

function timeAgo(d: Date): string {
  const sec = Math.floor((Date.now() - d.getTime()) / 1000)
  if (sec < 60) return `${sec}s ago`
  if (sec < 3600) return `${Math.floor(sec / 60)}m ago`
  if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`
  return `${Math.floor(sec / 86400)}d ago`
}

async function getStreak(userId: number): Promise<{ current: number; best: number }> {
  // Pull last 365 days of snapshots.
  // Use UTC consistently: snapshot dates are stored at UTC midnight (@db.Date)
  // and bucket keys are derived via toISOString() (UTC). Walking the calendar in
  // local time would offset the date keys by a day for non-UTC users.
  const since = new Date()
  since.setUTCDate(since.getUTCDate() - 365)
  since.setUTCHours(0, 0, 0, 0)

  const rows = await prisma.dSASnapshot.findMany({
    where: { userId, date: { gte: since } },
    orderBy: { date: 'asc' },
  })

  // Bucket by date → did the user solve any problem that day?
  const byDate = new Map<string, number>()
  for (const r of rows) {
    const key = r.date.toISOString().slice(0, 10)
    byDate.set(key, (byDate.get(key) ?? 0) + r.problemsSolvedToday)
  }

  // Walk backwards from today for current streak.
  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)
  let current = 0
  for (let i = 0; i < 365; i++) {
    const d = new Date(today)
    d.setUTCDate(today.getUTCDate() - i)
    const v = byDate.get(d.toISOString().slice(0, 10)) ?? 0
    if (v > 0) current++
    else if (i === 0) continue // ignore today if not logged yet
    else break
  }

  // Best streak — sweep chronologically.
  let best = 0
  let run = 0
  for (let i = 0; i < 365; i++) {
    const d = new Date(since)
    d.setUTCDate(since.getUTCDate() + i)
    const v = byDate.get(d.toISOString().slice(0, 10)) ?? 0
    if (v > 0) {
      run++
      if (run > best) best = run
    } else {
      run = 0
    }
  }

  return { current, best }
}

async function getTopicsAndRecent(userId: number) {
  // pull last 90 days of submissions to keep this cheap
  const since = new Date()
  since.setDate(since.getDate() - 90)
  const subs = await prisma.dSASubmission.findMany({
    where: { userId, submittedAt: { gte: since } },
    orderBy: { submittedAt: 'desc' },
  })

  // recent: last 4 AC + WA
  const recent = subs.slice(0, 4).map(s => {
    const tags = (s.tags ?? []) as string[] | null
    return {
      status: s.status === 'AC' ? 'ac' as const : 'wa' as const,
      title: s.problemTitle,
      platform: s.platform,
      difficulty: s.difficulty,
      tag: tags && tags.length > 0 ? tags[0] : null,
      ago: timeAgo(s.submittedAt),
    }
  })

  // topics: tally unique-solved (status=AC) by tag, lifetime — pull all-time accepted
  const acAll = await prisma.dSASubmission.findMany({
    where: { userId, status: 'AC' },
    select: { tags: true, problemId: true, platform: true },
  })

  const seen = new Set<string>()
  const tally = new Map<string, number>()
  for (const s of acAll) {
    const key = `${s.platform}:${s.problemId}`
    if (seen.has(key)) continue
    seen.add(key)
    const tags = (s.tags ?? []) as string[] | null
    if (!tags || tags.length === 0) continue
    for (const t of tags) {
      tally.set(t, (tally.get(t) ?? 0) + 1)
    }
  }

  const rows = Array.from(tally.entries()).map(([name, solved]) => ({ name, solved }))
  const topics = markWeak(rows)

  return { topics, recent }
}

async function getNextContest(cfHandle: string | null): Promise<{
  name: string
  startsAt: string
  durationMin: number
  ratingChanging: boolean
  daysSinceLast: number | null
} | null> {
  try {
    const res = await fetch('https://codeforces.com/api/contest.list?gym=false', {
      next: { revalidate: 600 },
    })
    if (!res.ok) return null
    const json = await res.json()
    if (json.status !== 'OK') return null
    const all: CfContest[] = json.result

    const upcoming = all
      .filter(c => c.phase === 'BEFORE')
      .sort((a, b) => a.startTimeSeconds - b.startTimeSeconds)
    const next = upcoming[0]
    if (!next) return null

    // days since last finished contest the user attended (rough — just use any finished contest)
    let daysSinceLast: number | null = null
    if (cfHandle) {
      const finished = all
        .filter(c => c.phase === 'FINISHED')
        .sort((a, b) => b.startTimeSeconds - a.startTimeSeconds)
      const last = finished[0]
      if (last) {
        daysSinceLast = Math.floor((Date.now() / 1000 - last.startTimeSeconds) / 86400)
      }
    }

    return {
      name: next.name,
      startsAt: new Date(next.startTimeSeconds * 1000).toISOString(),
      durationMin: Math.round(next.durationSeconds / 60),
      ratingChanging: next.type === 'CF',
      daysSinceLast,
    }
  } catch {
    return null
  }
}

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const userId = parseInt(session.user.id)

  const profile = await prisma.dSAProfile.findUnique({ where: { userId } })

  const [streak, tr, nextContest] = await Promise.all([
    getStreak(userId),
    getTopicsAndRecent(userId),
    getNextContest(profile?.cfHandle ?? null),
  ])

  return NextResponse.json({
    streak,
    topics: tr.topics,
    recent: tr.recent,
    nextContest,
  })
}
