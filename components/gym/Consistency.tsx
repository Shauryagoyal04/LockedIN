'use client'

import { Flame } from 'lucide-react'
import ActivityHeatmap from '@/components/shared/ActivityHeatmap'

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

interface ConsistencyProps {
  days: { date: string; value: number }[]
  streak: { current: number; longest: number }
}

function computeRangeLabel(): string {
  const now = new Date()
  const start = new Date(now)
  start.setUTCDate(start.getUTCDate() - 26 * 7)
  const startLabel = MONTH_NAMES[start.getUTCMonth()]
  const endLabel = `${MONTH_NAMES[now.getUTCMonth()]} ${now.getUTCFullYear()}`
  return `${startLabel} — ${endLabel}`
}

export default function Consistency({ days, streak }: ConsistencyProps) {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-white">Consistency</h2>
        <div className="flex items-center gap-4 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <Flame size={13} className="text-brand-500" />
            <span className="text-white font-medium">{streak.current}</span> day streak
          </span>
          <span>
            Longest: <span className="text-white font-medium">{streak.longest}</span>
          </span>
        </div>
      </div>
      <ActivityHeatmap
        data={days}
        accent="#ff5b1f"
        label="sets"
        showLegend
        rangeLabel={computeRangeLabel()}
      />
    </div>
  )
}
