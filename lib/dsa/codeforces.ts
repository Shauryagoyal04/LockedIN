export interface CFSubmission {
  problemId: string
  problemTitle: string
  tags: string[]
  difficulty: number | null
  status: 'AC' | 'WA'
  submittedAt: Date   // latest submission timestamp
  firstAcAt: Date | null  // when this problem was first AC'd (null if never AC'd)
}

export interface CodeforcesResult {
  rating: number | null
  maxRating: number | null
  rank: string | null
  totalSolved: number
  todayAC: number
  submissions: CFSubmission[]
  // date → unique problems first-AC'd on that UTC date (used for heatmap backfill)
  dailyFirstAC: Record<string, number>
}

export async function fetchCodeforces(handle: string): Promise<CodeforcesResult> {
  const [infoRes, statusRes] = await Promise.all([
    fetch(`https://codeforces.com/api/user.info?handles=${handle}`, { next: { revalidate: 0 } }),
    fetch(`https://codeforces.com/api/user.status?handle=${handle}&from=1&count=10000`, {
      next: { revalidate: 0 },
    }),
  ])

  if (!infoRes.ok) throw new Error(`CF user.info error: ${infoRes.status}`)
  if (!statusRes.ok) throw new Error(`CF user.status error: ${statusRes.status}`)

  const infoJson = await infoRes.json()
  const statusJson = await statusRes.json()

  if (infoJson.status !== 'OK') throw new Error(`CF: ${infoJson.comment}`)
  if (statusJson.status !== 'OK') throw new Error(`CF: ${statusJson.comment}`)

  const user = infoJson.result[0]
  const rawSubs: {
    verdict: string
    creationTimeSeconds: number
    problem: { contestId?: number; index: string; name: string; rating?: number; tags?: string[] }
  }[] = statusJson.result

  const problemKey = (s: typeof rawSubs[0]) =>
    `${s.problem.contestId ?? 'gym'}-${s.problem.index}`

  // Today's boundary in UTC (CF timestamps are UTC)
  const todayUTCStart = new Date()
  todayUTCStart.setUTCHours(0, 0, 0, 0)
  const todayStartSec = todayUTCStart.getTime() / 1000

  // CF returns submissions newest-first. We need:
  //   - first AC time per problem  → iterate in reverse (oldest first)
  //   - latest submission per problem → iterate forward (newest first)

  // Pass 1 (oldest→newest): find first AC time per problem
  const firstAcSec = new Map<string, number>()
  for (let i = rawSubs.length - 1; i >= 0; i--) {
    const s = rawSubs[i]
    if (s.verdict === 'OK') {
      const key = problemKey(s)
      const existing = firstAcSec.get(key)
      if (existing === undefined || s.creationTimeSeconds < existing) {
        firstAcSec.set(key, s.creationTimeSeconds)
      }
    }
  }

  // Pass 2 (newest→oldest): build one entry per unique problem
  const seenProblems = new Map<string, CFSubmission>()
  for (const s of rawSubs) {
    const key = problemKey(s)
    if (seenProblems.has(key)) continue  // already captured the latest
    // A problem counts as solved ('AC') if it was EVER accepted — not just if the
    // most recent submission happened to pass. Otherwise re-attempting a solved
    // problem with a failing verdict would wrongly mark it unsolved and drop it
    // from topic tallies.
    const firstAcSec_ = firstAcSec.get(key) ?? null
    const isAC = firstAcSec_ != null
    seenProblems.set(key, {
      problemId: key,
      problemTitle: s.problem.name,
      tags: s.problem.tags ?? [],
      difficulty: s.problem.rating ?? null,
      status: isAC ? 'AC' : 'WA',
      submittedAt: new Date(s.creationTimeSeconds * 1000),
      firstAcAt: firstAcSec_ != null ? new Date(firstAcSec_ * 1000) : null,
    })
  }

  // Unique AC problems (total count)
  const acProblems = new Set(firstAcSec.keys())

  // Today's newly-solved problems = problems whose FIRST AC happened today.
  // (Counting any AC today would also include re-solves of old problems, which
  //  would be inconsistent with the heatmap's dailyFirstAC counts below.)
  let todayFirstAC = 0
  firstAcSec.forEach((sec) => {
    if (sec >= todayStartSec) todayFirstAC++
  })

  // dailyFirstAC: for each UTC date, how many problems were first AC'd that day
  const dailyFirstAC: Record<string, number> = {}
  firstAcSec.forEach((sec) => {
    const d = new Date(sec * 1000)
    const dateKey = d.toISOString().slice(0, 10)
    dailyFirstAC[dateKey] = (dailyFirstAC[dateKey] ?? 0) + 1
  })

  return {
    rating: user.rating ?? null,
    maxRating: user.maxRating ?? null,
    rank: user.rank ?? null,
    totalSolved: acProblems.size,
    todayAC: todayFirstAC,
    submissions: Array.from(seenProblems.values()),
    dailyFirstAC,
  }
}
