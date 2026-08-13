'use client'

import type { HeatmapDay } from '@/types/dashboard'
import Heatmap57 from './Heatmap57'

interface HeatmapCardProps {
  data: HeatmapDay[]
  todayIndex: number
  totalDays?: number
}

export default function HeatmapCard({ data, todayIndex, totalDays }: HeatmapCardProps) {
  const total = totalDays ?? data.length
  const logged = data.filter(d => d.score != null && d.day <= todayIndex + 1).length
  const scores = data.map(d => d.score).filter((s): s is number => s != null)
  const best = scores.length ? Math.max(...scores) : 0
  const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0
  const perfect = scores.filter(s => s >= 90).length

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
      <div className="flex items-baseline justify-between">
        <h2 className="text-sm font-semibold text-white">Vacation grid</h2>
        <p className="font-mono text-[11px] text-gray-500">{logged} / {total} LIT</p>
      </div>
      <div className="mt-4">
        <Heatmap57 data={data} todayIndex={todayIndex} cell={18} gap={3} />
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-gray-800 pt-4">
        <Stat label="Best" value={best} />
        <Stat label="Avg" value={avg} />
        <Stat label="Perfect" value={perfect} />
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-gray-500">{label}</p>
      <p className="mt-0.5 text-lg font-extrabold text-white">{value}</p>
    </div>
  )
}
