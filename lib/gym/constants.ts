export const MUSCLE_GROUPS = [
  'chest', 'back', 'shoulders', 'biceps', 'triceps',
  'quads', 'hamstrings', 'glutes', 'calves', 'core', 'forearms', 'other',
] as const

export type MuscleGroup = typeof MUSCLE_GROUPS[number]

export const MUSCLE_GROUP_META: Record<MuscleGroup, { label: string; color: string; weeklyTarget: number }> = {
  chest:      { label: 'Chest',      color: '#f97316', weeklyTarget: 16 },
  back:       { label: 'Back',       color: '#3b82f6', weeklyTarget: 16 },
  shoulders:  { label: 'Shoulders',  color: '#eab308', weeklyTarget: 14 },
  biceps:     { label: 'Biceps',     color: '#a855f7', weeklyTarget: 12 },
  triceps:    { label: 'Triceps',    color: '#ec4899', weeklyTarget: 12 },
  quads:      { label: 'Quads',      color: '#22c55e', weeklyTarget: 14 },
  hamstrings: { label: 'Hamstrings', color: '#14b8a6', weeklyTarget: 12 },
  glutes:     { label: 'Glutes',     color: '#f43f5e', weeklyTarget: 12 },
  calves:     { label: 'Calves',     color: '#84cc16', weeklyTarget: 12 },
  core:       { label: 'Core',       color: '#06b6d4', weeklyTarget: 12 },
  forearms:   { label: 'Forearms',   color: '#8b5cf6', weeklyTarget: 8 },
  other:      { label: 'Other',      color: '#6b7280', weeklyTarget: 0 },
}

export const DEFAULT_SETS = 3
export const DEFAULT_REPS = 10
