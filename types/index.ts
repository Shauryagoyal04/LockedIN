export type Goal = 'lean_bulk' | 'cut' | 'recomposition' | 'maintain'
export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced'
export type LearningMode =
  | 'watch_lectures'
  | 'build_projects'
  | 'read_docs'
  | 'practice_problems'
  | 'mock_interviews'

export interface SkillFormData {
  name: string
  description: string
  totalHoursEstimated: number
  learningModes: LearningMode[]
  specificGoal: string
  deadline: string
  resources: string
}

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

export interface SkillPlanData {
  id: number
  userId: number
  name: string
  description: string | null
  totalHoursEstimated: number
  learningModes: LearningMode[]
  specificGoal: string | null
  deadline: string | null
  resources: string | null
  isActive: boolean
  createdAt: string
  milestones: MilestoneData[]
}

export interface MilestoneData {
  id: number
  skillId: number
  title: string
  completed: boolean
  completedAt: string | null
}

export interface DashboardTodayData {
  date: string
  dayNumber: number
  daysRemaining: number
  dsaToday: null
  gymToday: null
  score: null
}
