const PUSH = new Set(['chest', 'shoulders', 'triceps'])
const PULL = new Set(['back', 'biceps'])
const LEGS = new Set(['quads', 'hamstrings', 'glutes', 'calves'])

export function deriveSplitLabel(muscleGroups: (string | null | undefined)[]): string {
  const groups = new Set(muscleGroups.filter((g): g is string => !!g && g !== 'other'))
  if (groups.size === 0) return 'Workout'

  const groupList = Array.from(groups)
  const hasPush = groupList.some((g) => PUSH.has(g))
  const hasPull = groupList.some((g) => PULL.has(g))
  const hasLegs = groupList.some((g) => LEGS.has(g))
  const hasCore = groups.has('core')
  const hasForearms = groups.has('forearms')

  const categories = [hasPush, hasPull, hasLegs].filter(Boolean).length

  if (categories > 1) return 'Full Body'
  if (hasPush) return 'Push'
  if (hasPull) return 'Pull'
  if (hasLegs) return 'Legs'
  if (hasCore) return 'Core'
  if (hasForearms) return 'Forearms'
  return 'Workout'
}
