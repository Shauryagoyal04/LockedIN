export interface LeetCodeResult {
  totalSolved: number
  easySolved: number
  mediumSolved: number
  hardSolved: number
  ranking: number | null
  contestRating: number | null
  globalRanking: number | null
  attendedContests: number
  topPercentage: number | null
}

const GRAPHQL_URL = 'https://leetcode.com/graphql'

const QUERY = `
  query userData($username: String!) {
    matchedUser(username: $username) {
      profile { ranking }
      submitStatsGlobal {
        acSubmissionNum {
          difficulty
          count
        }
      }
    }
    userContestRanking(username: $username) {
      rating
      globalRanking
      attendedContestsCount
      topPercentage
    }
  }
`

export async function fetchLeetCode(username: string): Promise<LeetCodeResult> {
  const res = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Referer: 'https://leetcode.com',
      Origin: 'https://leetcode.com',
      'User-Agent': 'Mozilla/5.0 (compatible; lockedIN/1.0)',
    },
    body: JSON.stringify({ query: QUERY, variables: { username } }),
    next: { revalidate: 0 },
  })

  if (!res.ok) throw new Error(`LeetCode API error: ${res.status}`)

  const json = await res.json()
  const user = json?.data?.matchedUser
  if (!user) throw new Error(`LeetCode user "${username}" not found`)

  const stats: { difficulty: string; count: number }[] =
    user.submitStatsGlobal?.acSubmissionNum ?? []

  const get = (d: string) => stats.find((s) => s.difficulty === d)?.count ?? 0

  // userContestRanking is null for users who have never attended a contest.
  const contest = json?.data?.userContestRanking

  return {
    totalSolved: get('All'),
    easySolved: get('Easy'),
    mediumSolved: get('Medium'),
    hardSolved: get('Hard'),
    ranking: user.profile?.ranking ?? null,
    contestRating: contest?.rating != null ? Math.round(contest.rating) : null,
    globalRanking: contest?.globalRanking ?? null,
    attendedContests: contest?.attendedContestsCount ?? 0,
    topPercentage: contest?.topPercentage ?? null,
  }
}
