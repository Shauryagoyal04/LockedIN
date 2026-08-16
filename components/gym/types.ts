export interface SetEntry {
  reps: number
  weightKg: number | null
}

export interface ExerciseRow {
  id: number
  name: string
  normalizedName: string
  muscleGroup: string | null
  sets: SetEntry[]
  isPr: boolean
}

export interface SessionRow {
  id: number
  date: string
  rawLog: string | null
  exercises: ExerciseRow[]
}

export interface VolumeRow {
  group: string
  label: string
  color: string
  sets: number
  target: number
}

export interface WeeklyPayload {
  weekStart: string
  volume: VolumeRow[]
  recentSessions: SessionRow[]
}

export interface MuscleRecommendation {
  group: string
  label: string
  color: string
  sets: number
  target: number
  daysSinceLastTrained: number | null
}

export interface ExercisePR {
  normalizedName: string
  displayName: string
  bestWeightKg: number
  reps: number
  date: string
}
