'use client'

import { Flame } from 'lucide-react'

interface GymStreakCardProps {
  current: number
  longest: number
  thisMonth: { active: number; total: number }
}

export default function GymStreakCard({ current, longest, thisMonth }: GymStreakCardProps) {
  return (
    <div className="relative flex-1 overflow-hidden rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 p-6 text-white">
      <Flame
        size={200}
        strokeWidth={1.5}
        className="pointer-events-none absolute -right-5 -top-5 opacity-20"
      />
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] opacity-80">Gym Streak</p>
      <div className="mt-1 flex items-end gap-2">
        <span className="text-[76px] font-black leading-none tracking-tight">{current}</span>
        <span className="pb-3 text-lg font-bold">days</span>
      </div>
      <p className="mt-2 text-sm opacity-90">
        {current === 0
          ? 'Train today to start your streak.'
          : 'Train today to keep it alive — rest day allowance used.'}
      </p>
      <div className="relative mt-5 flex items-center gap-8 border-t border-white/20 pt-4">
        <div>
          <p className="font-mono text-[9px] uppercase tracking-[0.18em] opacity-70">Longest</p>
          <p className="mt-0.5 text-lg font-extrabold">{longest} days</p>
        </div>
        <div>
          <p className="font-mono text-[9px] uppercase tracking-[0.18em] opacity-70">This Month</p>
          <p className="mt-0.5 text-lg font-extrabold">
            {thisMonth.active} / {thisMonth.total}
          </p>
        </div>
      </div>
    </div>
  )
}
