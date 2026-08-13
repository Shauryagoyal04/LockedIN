'use client'

import { Flame } from 'lucide-react'
import type { DashboardToday } from '@/types/dashboard'

interface ScoreBreakdownProps {
  data: DashboardToday
}

/** The Focused-style operator table: 1 row per score component with a
 *  status dot, detail text, mini bar, and earned/max readout. */
export default function ScoreBreakdown({ data }: ScoreBreakdownProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-800 bg-gray-900">
      <div className="flex items-center justify-between border-b border-gray-800 px-5 py-4">
        <h2 className="text-sm font-semibold text-white">Score breakdown</h2>
        <p className="font-mono text-[11px] text-gray-500">
          {data.score ?? '--'} / 100
        </p>
      </div>

      <ul>
        {data.parts.map((p, i) => {
          const pct = (p.earned / p.max) * 100
          const done = p.earned === p.max
          const zero = p.earned === 0
          const dot = done ? 'bg-green-400' : zero ? 'bg-red-500' : 'bg-brand-500'
          return (
            <li
              key={p.key}
              className={`grid grid-cols-[120px_1fr_120px_80px] items-center gap-4 px-5 py-3.5 ${
                i < data.parts.length - 1 ? 'border-b border-gray-800' : ''
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
                <span className="text-[13px] font-semibold text-white">{p.label}</span>
              </div>
              <span className="text-xs text-gray-500">{p.detail}</span>
              <div className="h-1 overflow-hidden rounded-full bg-gray-800">
                <div
                  className={`h-full transition-[width] duration-500 ${
                    done ? 'bg-green-400' : 'bg-brand-500'
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p
                className={`text-right font-mono text-xs ${
                  done ? 'text-green-400' : zero ? 'text-gray-500' : 'text-white'
                }`}
              >
                {p.earned}
                <span className="text-gray-500"> / {p.max}</span>
              </p>
            </li>
          )
        })}

        {/* Streak bonus row */}
        <li className="grid grid-cols-[120px_1fr_120px_80px] items-center gap-4 bg-gray-900/60 px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <Flame size={14} className="text-gray-500" />
            <span className="text-[13px] font-semibold text-gray-500">Streak bonus</span>
          </div>
          <span className="text-xs text-gray-500">
            Unlocks at 7-day streak (currently {data.streak.current})
          </span>
          <span />
          <p className="text-right font-mono text-xs text-gray-500">+{data.bonus} / 10</p>
        </li>
      </ul>
    </div>
  )
}
