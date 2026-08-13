export interface DSAProfile {
  userId: number
  lcUsername: string | null
  cfHandle: string | null
  ccUsername: string | null
  dailyTarget: number
  targetCfRating: number | null
}

export interface Platform {
  platform: string
  problemsSolvedToday: number
  problemsSolvedTotal: number
  rating: number | null
  isStale?: boolean
}

export interface TodayPayload {
  totalToday: number
  dailyTarget: number
  byPlatform: Platform[]
  lastFetched: string | null
}

export interface TopicRow {
  name: string
  solved: number
  isWeak: boolean
}

export interface RecentRow {
  status: 'ac' | 'wa'
  title: string
  platform: string
  difficulty: string | null
  tag: string | null
  ago: string
}

export interface SummaryPayload {
  streak: { current: number; best: number }
  topics: TopicRow[]
  recent: RecentRow[]
  nextContest: {
    name: string
    startsAt: string
    durationMin: number
    ratingChanging: boolean
    daysSinceLast: number | null
  } | null
}

export const PLATFORM_META: Record<string, { name: string; short: string; color: string }> = {
  leetcode:   { name: 'LeetCode',   short: 'LC', color: '#ffa116' },
  codeforces: { name: 'Codeforces', short: 'CF', color: '#3b9eff' },
  codechef:   { name: 'CodeChef',   short: 'CC', color: '#8a6d3b' },
}
