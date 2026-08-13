// Types shared between the dashboard page and its sub-components.
// These match the existing /api/* responses where they exist, and
// extend them with fields the new dashboard needs (score breakdown,
// streak, heatmap). Implement these on the backend when ready — the
// components degrade gracefully when fields are absent.

export type ScoreBreakdownKey = 'dsa' | 'skill' | 'gym' | 'github' | 'weight'

export interface ScorePart {
  key: ScoreBreakdownKey
  label: string
  earned: number
  max: number
  detail: string
}

export interface DashboardToday {
  date: string
  dayNumber: number
  daysRemaining: number
  /** Productivity score 0–100. null until first activity logged. */
  score: number | null
  /** Per-component breakdown of the score. */
  parts: ScorePart[]
  /** Bonus pts (e.g. +10 streak bonus). */
  bonus: number
  streak: { current: number; best: number; threshold: number }
  /** AI / coach blurb. */
  coachLine: string | null
}

export interface HeatmapDay {
  /** 1-indexed day in the 57-day vacation window. */
  day: number
  /** 0–100 score for that day, or null for future / unlogged. */
  score: number | null
  date: string
}

export interface PlatformRow {
  name: string
  short: string
  total: number
  delta: number
  rating: number | null
}

export interface VolumeRow {
  group: string
  sets: number
  target: number
}

export interface SkillRow {
  id: string | number
  name: string
  hoursDone: number
  hoursGoal: number
  deadline: string // "Jul 10"
  pace: number    // hours ahead/behind
}

export interface PillarsData {
  dsa: { todaySolved: number; target: number; platforms: PlatformRow[]; behindBy: number }
  gym: { weightKg: number; deltaPerWeek: string; volume: VolumeRow[]; spark7: number[] }
  skills: { totalHours: number; goalHours: number; list: SkillRow[] }
}
