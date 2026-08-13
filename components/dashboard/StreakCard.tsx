'use client'

import { Flame } from 'lucide-react'

interface StreakCardProps {
  current: number
  threshold: number
}

export default function StreakCard({ current, threshold }: StreakCardProps) {
  const toBonus = Math.max(0, 7 - current)
  return (
    <div className="relative flex-1 overflow-hidden rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 p-6 text-white">
      <Flame
        size={200}
        strokeWidth={1.5}
        className="pointer-events-none absolute -right-5 -top-5 opacity-20"
      />
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] opacity-80">Current streak</p>
      <div className="mt-1 flex items-end gap-2">
        <span className="text-[76px] font-black leading-none tracking-tight">{current}</span>
        <span className="pb-3 text-lg font-bold">days</span>
      </div>
      <p className="mt-2 text-sm opacity-90">
        {current === 0
          ? `Hit ${threshold}+ today to start your streak.`
          : toBonus === 0
          ? 'Streak bonus unlocked — +10 pts/day.'
          : `Don't break it now — ${toBonus} ${toBonus === 1 ? 'day' : 'days'} until your streak bonus unlocks.`}
      </p>
    </div>
  )
}
