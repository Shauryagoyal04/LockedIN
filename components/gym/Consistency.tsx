'use client'

import { Flame } from 'lucide-react'
import ActivityHeatmap from '@/components/shared/ActivityHeatmap'

interface ConsistencyProps {
  days: { date: string; value: number }[]
  streak: { current: number; longest: number }
}

export default function Consistency({ days, streak }: ConsistencyProps) {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-5 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-white">Consistency</h2>
        <div className="flex items-center gap-4 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <Flame size={13} className="text-indigo-400" />
            <span className="text-white font-medium">{streak.current}</span> day streak
          </span>
          <span>
            Longest: <span className="text-white font-medium">{streak.longest}</span>
          </span>
        </div>
      </div>
      <ActivityHeatmap data={days} accent="#6366f1" label="sets" />
    </div>
  )
}
