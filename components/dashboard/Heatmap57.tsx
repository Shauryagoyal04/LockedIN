'use client'

import type { HeatmapDay } from '@/types/dashboard'

interface Heatmap57Props {
  data: HeatmapDay[]
  todayIndex?: number
  cell?: number
  gap?: number
}

function scoreColor(s: number | null): string {
  if (s == null) return '#141416'
  if (s < 30) return '#3a1b0a'
  if (s < 60) return '#9c3a15'
  if (s < 80) return '#e64f1a'
  return '#ff7a45'
}

export default function Heatmap57({ data, todayIndex, cell = 16, gap = 4 }: Heatmap57Props) {
  const totalDays = data.length || 30
  const cols = Math.ceil(totalDays / 7)
  const gridSize = cols * 7

  const cells = [...data.slice(0, totalDays)]
  while (cells.length < gridSize) {
    cells.push({ day: cells.length + 1, score: null, date: '' })
  }

  return (
    <div
      className="grid"
      style={{
        gridTemplateRows: `repeat(7, ${cell}px)`,
        gridTemplateColumns: `repeat(${cols}, ${cell}px)`,
        gridAutoFlow: 'column',
        gap,
      }}
    >
      {cells.map((d, i) => {
        const isOver = i >= totalDays
        const isToday = todayIndex === i
        return (
          <div
            key={i}
            title={d.date ? `Day ${d.day} · ${d.date} · ${d.score ?? 'no log'}` : ''}
            className="rounded-[3px]"
            style={{
              width: cell,
              height: cell,
              background: isOver ? 'transparent' : scoreColor(d.score),
              boxShadow: isToday ? 'inset 0 0 0 1.5px #ff5b1f' : 'none',
            }}
          />
        )
      })}
    </div>
  )
}
