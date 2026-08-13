'use client'

import type { DashboardToday } from '@/types/dashboard'
import ScoreRing from './ScoreRing'

interface ScoreHeroProps {
  data: DashboardToday
}

const BAR_COLORS: Record<string, string> = {
  dsa:    '#ff5b1f',
  skill:  '#ff8a47',
  gym:    '#ffa572',
  github: '#5bd06b',
  weight: '#ffc299',
}

/** The Athletic-style hero: gradient bg, huge gradient-text score, ring,
 *  and 5 mini progress bars for the score breakdown. */
export default function ScoreHero({ data }: ScoreHeroProps) {
  const total = data.score ?? 0
  const remaining = Math.max(0, 100 - total)
  return (
    <div className="relative overflow-hidden rounded-2xl border border-brand-900/60 bg-gradient-to-br from-[#1a0f08] via-[#13100c] to-[#0e0a08] p-7">
      {/* glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(255,91,31,0.18), transparent 60%)' }}
      />

      <div className="relative flex items-start justify-between gap-6">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-gray-500">Today&apos;s score</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span
              className="text-[96px] font-black leading-none tracking-tight bg-gradient-to-b from-white to-brand-400 bg-clip-text text-transparent"
            >
              {data.score ?? '--'}
            </span>
            <span className="text-lg font-semibold text-gray-500">/ 100</span>
          </div>
          <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.15em] text-brand-500">
            {data.score == null ? 'Start logging to earn points' : `${remaining} points to perfect day`}
          </p>
        </div>

        <div className="relative">
          <ScoreRing score={total} max={100} size={140} stroke={10} />
        </div>
      </div>

      {/* Component bars */}
      <div className="mt-5 grid grid-cols-5 gap-2">
        {data.parts.map(p => (
          <div key={p.key}>
            <div className="h-1 overflow-hidden rounded-full bg-[#241612]">
              <div
                className="h-full transition-[width] duration-500"
                style={{
                  width: `${(p.earned / p.max) * 100}%`,
                  background: BAR_COLORS[p.key] ?? '#ff5b1f',
                }}
              />
            </div>
            <p className="mt-1.5 font-mono text-[9px] uppercase tracking-[0.1em] text-gray-500">
              {p.label}
            </p>
            <p className="mt-px text-xs font-bold text-white">
              {p.earned}
              <span className="font-normal text-gray-500">/{p.max}</span>
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
