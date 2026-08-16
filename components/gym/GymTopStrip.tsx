'use client'

import { Dumbbell, Pencil, Plus } from 'lucide-react'

const GOAL_LABELS: Record<string, string> = {
  lean_bulk: 'Lean Bulk', cut: 'Cut', recomposition: 'Recomposition', maintain: 'Maintain',
}

interface GymTopStripProps {
  goal: string | null
  trainingDaysPerWeek: number | null
  onEditProfile: () => void
  onLogWorkout: () => void
}

export default function GymTopStrip({ goal, trainingDaysPerWeek, onEditProfile, onLogWorkout }: GymTopStripProps) {
  const goalLabel = goal ? GOAL_LABELS[goal] ?? goal : null
  const subtitleParts = [
    goalLabel?.toUpperCase(),
    trainingDaysPerWeek ? `${trainingDaysPerWeek} DAYS/WEEK` : null,
  ].filter(Boolean)

  return (
    <div
      className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-800 px-4 py-5 md:px-8"
      style={{ background: 'linear-gradient(180deg, rgba(255,91,31,0.04), transparent)' }}
    >
      <div>
        <div className="flex items-center gap-2.5">
          <Dumbbell size={22} className="text-brand-500" />
          <h1 className="text-xl font-extrabold tracking-tight text-white md:text-2xl">Gym Tracker</h1>
        </div>
        {subtitleParts.length > 0 && (
          <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.15em] text-gray-500">
            {subtitleParts.join(' · ')}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2.5">
        <button
          onClick={onEditProfile}
          className="flex items-center gap-2 rounded-full bg-gray-800 px-3.5 py-2.5 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
        >
          <Pencil size={14} />
          Edit profile
        </button>
        <button
          onClick={onLogWorkout}
          className="inline-flex items-center gap-1.5 rounded-lg bg-brand-500 px-3.5 py-2.5 text-sm font-bold text-white shadow-brand-glow transition hover:bg-brand-600"
        >
          <Plus size={14} />
          Log workout
        </button>
      </div>
    </div>
  )
}
