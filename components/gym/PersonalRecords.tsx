'use client'

import { useState } from 'react'
import { Trophy } from 'lucide-react'
import type { ExercisePR } from './types'

const CAP = 8

export default function PersonalRecords({ records }: { records: ExercisePR[] }) {
  const [showAll, setShowAll] = useState(false)
  const visible = showAll ? records : records.slice(0, CAP)

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-5 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <Trophy size={16} className="text-indigo-400" />
        <h2 className="font-semibold text-white">Personal Records</h2>
      </div>

      {records.length === 0 ? (
        <p className="text-sm text-gray-500 py-4 text-center">
          No personal records yet — log a workout to start tracking.
        </p>
      ) : (
        <>
          <div className="space-y-2">
            {visible.map((r) => (
              <div key={r.normalizedName} className="flex items-center justify-between text-sm">
                <span className="text-gray-300">{r.displayName}</span>
                <div className="flex items-center gap-3 text-xs">
                  <span className="font-mono text-white">
                    {r.bestWeightKg}kg × {r.reps}
                  </span>
                  <span className="text-gray-500">{r.date}</span>
                </div>
              </div>
            ))}
          </div>
          {records.length > CAP && (
            <button
              onClick={() => setShowAll((v) => !v)}
              className="mt-3 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              {showAll ? 'Show less' : `Show all (${records.length})`}
            </button>
          )}
        </>
      )}
    </div>
  )
}
