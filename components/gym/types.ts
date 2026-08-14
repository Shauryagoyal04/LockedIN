export interface SetEntry {
  reps: number
  weightKg: number | null
}

export interface ExerciseRow {
  id: number
  name: string
  muscleGroup: string | null
  sets: SetEntry[]
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
