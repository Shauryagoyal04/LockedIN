'use client'

import { Target } from 'lucide-react'
import type { MuscleRecommendation } from './types'

export default function TrainingRecommendation({ recommendations }: { recommendations: MuscleRecommendation[] }) {
  const hasAnyData = recommendations.some((r) => r.sets > 0 || r.daysSinceLastTrained !== null)
  const allOnTrack = recommendations.every((r) => r.sets >= r.target)

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-5 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <Target size={16} className="text-indigo-400" />
        <h2 className="font-semibold text-white">Train Today</h2>
      </div>

      {!hasAnyData ? (
        <p className="text-sm text-gray-500 py-2 text-center">
          Log a workout to get a training recommendation.
        </p>
      ) : allOnTrack ? (
        <p className="text-sm text-green-400 py-2 text-center">
          You&apos;re on track this week — every muscle group has hit its target.
        </p>
      ) : (
        <div className="space-y-2.5">
          {recommendations.map((r) => (
            <div key={r.group} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: r.color }}
                />
                <span className="text-gray-300">{r.label}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-[11px] text-gray-500">
                  {r.sets}/{r.target}
                </span>
                <span className="text-xs text-gray-500">
                  {r.daysSinceLastTrained === null
                    ? 'never trained'
                    : r.daysSinceLastTrained === 0
                    ? 'trained today'
                    : `${r.daysSinceLastTrained}d since last`}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
