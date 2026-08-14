'use client'

import type { VolumeRow } from './types'

export default function WeeklyVolume({ volume }: { volume: VolumeRow[] }) {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-5 mb-4">
      <h2 className="font-semibold text-white mb-3">Weekly Muscle Score</h2>
      <div className="space-y-2.5">
        {volume.map((v) => {
          const pct = Math.min(100, (v.sets / v.target) * 100)
          const done = v.sets >= v.target
          return (
            <div key={v.group} className="grid grid-cols-[90px_1fr_50px] items-center gap-3 text-xs">
              <span className="text-gray-300">{v.label}</span>
              <div className="h-[6px] overflow-hidden rounded-full bg-gray-700">
                <div
                  className={`h-full transition-all ${done ? 'bg-green-400' : 'bg-indigo-500'}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="text-right font-mono text-[11px] text-gray-500">
                {v.sets}/{v.target}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
