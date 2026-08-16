'use client'

import type { MuscleRecommendation } from './types'

interface TrainingRecommendationProps {
  recommendations: MuscleRecommendation[]
  lastSession: { label: string; daysAgo: number } | null
  weeklySets: number
  weeklyTonnageKg: number
}

export default function TrainingRecommendation({
  recommendations,
  lastSession,
  weeklySets,
  weeklyTonnageKg,
}: TrainingRecommendationProps) {
  const hasAnyData = recommendations.some((r) => r.sets > 0 || r.daysSinceLastTrained !== null)
  const allOnTrack = recommendations.every((r) => r.sets >= r.target)
  const top = recommendations[0]
  const heading = recommendations
    .slice(0, 2)
    .map((r) => r.label)
    .join(' + ')

  return (
    <div className="relative overflow-hidden rounded-2xl border border-brand-900/60 bg-gradient-to-br from-[#1a0f08] via-[#13100c] to-[#0e0a08] p-7">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(255,91,31,0.18), transparent 60%)' }}
      />

      <div className="relative">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-gray-500">Train Today</p>

        {!hasAnyData ? (
          <p className="mt-4 text-sm text-gray-400">
            Log a workout to get a training recommendation.
          </p>
        ) : allOnTrack ? (
          <p className="mt-4 text-lg font-semibold text-green-400">
            You&apos;re on track this week — every muscle group has hit its target.
          </p>
        ) : (
          <>
            <div className="mt-2 flex items-baseline gap-3 flex-wrap">
              <h2 className="text-4xl font-black leading-tight tracking-tight text-white">{heading}</h2>
              {top && (
                <span className="text-sm text-gray-500">
                  {top.label} is {Math.max(0, top.target - top.sets)} sets under target
                </span>
              )}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {recommendations.map((r) => (
                <span
                  key={r.group}
                  className="flex items-center gap-1.5 rounded-full bg-black/30 border border-white/10 px-3 py-1.5 text-xs text-gray-200"
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: r.color }} />
                  {r.label} {r.sets}×{r.target}
                </span>
              ))}
            </div>
          </>
        )}

        <div className="mt-6 grid grid-cols-3 gap-4 border-t border-white/10 pt-4">
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-gray-500">Last Session</p>
            <p className="mt-1 text-sm font-semibold text-white">
              {lastSession ? `${lastSession.label} · ${lastSession.daysAgo}d ago` : '—'}
            </p>
          </div>
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-gray-500">Weekly Sets</p>
            <p className="mt-1 text-sm font-semibold text-white">{weeklySets}</p>
          </div>
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-gray-500">Tonnage</p>
            <p className="mt-1 text-sm font-semibold text-white">{weeklyTonnageKg.toLocaleString()} kg</p>
          </div>
        </div>
      </div>
    </div>
  )
}
