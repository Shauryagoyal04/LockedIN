export type GymSet = { reps: number; weight: number | null }

interface RawSet {
  reps?: unknown
  weightKg?: unknown
}

export function parseSets(setsJson: unknown): GymSet[] {
  let value: unknown = setsJson
  if (typeof value === 'string') {
    try {
      value = JSON.parse(value)
    } catch {
      return []
    }
  }
  if (!Array.isArray(value)) return []

  const sets: GymSet[] = []
  for (const entry of value as RawSet[]) {
    if (!entry || typeof entry !== 'object') continue
    const reps = typeof entry.reps === 'number' && Number.isFinite(entry.reps) ? entry.reps : 0
    const weight = typeof entry.weightKg === 'number' && Number.isFinite(entry.weightKg) ? entry.weightKg : null
    sets.push({ reps, weight })
  }
  return sets
}

export function totalReps(sets: GymSet[]): number {
  return sets.reduce((sum, s) => sum + s.reps, 0)
}

export function tonnage(sets: GymSet[]): number {
  return sets.reduce((sum, s) => sum + (s.weight ?? 0) * s.reps, 0)
}

export function maxWeight(sets: GymSet[]): number | null {
  const weights = sets.map((s) => s.weight).filter((w): w is number => w !== null)
  if (weights.length === 0) return null
  return Math.max(...weights)
}
