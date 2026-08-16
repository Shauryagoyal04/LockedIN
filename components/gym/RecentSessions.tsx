'use client'

import Link from 'next/link'
import { deriveSplitLabel } from '@/lib/gym/splitLabel'
import type { SessionRow } from './types'

export default function RecentSessions({ sessions }: { sessions: SessionRow[] }) {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-white">Recent Sessions</h2>
        {sessions.length > 0 && (
          <span className="text-xs text-brand-400 font-medium">View all</span>
        )}
      </div>
      {sessions.length === 0 ? (
        <p className="text-sm text-gray-500 py-4 text-center">No workouts logged yet.</p>
      ) : (
        <div className="space-y-3">
          {sessions.map((s) => {
            const splitLabel = deriveSplitLabel(s.exercises.map((ex) => ex.muscleGroup))
            return (
              <div key={s.id} className="pb-3 border-b border-gray-700 last:border-0 last:pb-0">
                <p className="text-xs text-gray-500 mb-1">{s.date}</p>
                <p className="text-sm text-gray-300">
                  <span className="text-white font-medium">{splitLabel}</span>
                  {' · '}
                  {s.exercises.map((ex, i) => (
                    <span key={ex.id}>
                      {i > 0 && ', '}
                      <Link href={`/gym/exercise/${encodeURIComponent(ex.normalizedName)}`} className="text-gray-300 hover:text-brand-400 transition-colors">
                        {ex.name}
                      </Link>
                      {ex.isPr && <span className="ml-1 text-yellow-400" title="New PR">🏆</span>}
                    </span>
                  ))}
                </p>
                {s.rawLog && (
                  <p className="text-xs text-gray-500 mt-1 italic truncate">&ldquo;{s.rawLog}&rdquo;</p>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
