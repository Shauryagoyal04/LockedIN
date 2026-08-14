export type Goal = 'lean_bulk' | 'cut' | 'recomposition' | 'maintain'
export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced'

export interface DSAProfileData {
  userId: number
  lcUsername: string | null
  cfHandle: string | null
  ccUsername: string | null
  dailyTarget: number
  targetCfRating: number | null
  updatedAt: string
}

export interface GymProfileData {
  userId: number
  heightCm: number | null
  currentWeightKg: number | null
  targetWeightKg: number | null
  goal: string | null
  experienceLevel: string | null
  trainingDaysPerWeek: number | null
  programSplit: string | null
  injuryNotes: string | null
  updatedAt: string
}

export interface DashboardTodayData {
  date: string
  dayNumber: number
  daysRemaining: number
  dsaToday: null
  gymToday: null
  score: null
}
