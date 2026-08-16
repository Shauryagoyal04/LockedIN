'use client'

interface ActivityHeatmapProps {
  data: { date: string; value: number }[]
  levels?: number
  accent?: string
  label?: string
  showLegend?: boolean
  rangeLabel?: string
}

const DAY_LABELS = ['Mon', '', 'Wed', '', 'Fri', '', '']
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function startOfWeekUTC(d: Date): Date {
  const date = new Date(d)
  date.setUTCHours(0, 0, 0, 0)
  const day = date.getUTCDay()
  const diff = day === 0 ? -6 : 1 - day
  date.setUTCDate(date.getUTCDate() + diff)
  return date
}

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function buildWeeks(weeks: number) {
  const today = new Date()
  const currentWeekStart = startOfWeekUTC(today)
  const firstWeekStart = new Date(currentWeekStart)
  firstWeekStart.setUTCDate(firstWeekStart.getUTCDate() - (weeks - 1) * 7)

  const columns: { date: string; dateObj: Date }[][] = []
  for (let w = 0; w < weeks; w++) {
    const col: { date: string; dateObj: Date }[] = []
    for (let d = 0; d < 7; d++) {
      const day = new Date(firstWeekStart)
      day.setUTCDate(day.getUTCDate() + w * 7 + d)
      col.push({ date: isoDate(day), dateObj: day })
    }
    columns.push(col)
  }
  return columns
}

function levelColor(level: number, levels: number, accent: string): string {
  if (level === 0) return '#374151' // gray-700, muted empty cell
  const intensity = level / levels
  // interpolate between a dim and full-strength version of the accent using opacity
  const alpha = Math.round((0.25 + intensity * 0.75) * 255)
    .toString(16)
    .padStart(2, '0')
  return `${accent}${alpha}`
}

export default function ActivityHeatmap({
  data,
  levels = 4,
  accent = '#6366f1',
  label = 'activity',
  showLegend = false,
  rangeLabel,
}: ActivityHeatmapProps) {
  const byDate = new Map(data.map((d) => [d.date, d.value]))
  const max = Math.max(0, ...data.map((d) => d.value))

  function bucket(value: number): number {
    if (value <= 0 || max <= 0) return 0
    const ratio = value / max
    return Math.max(1, Math.min(levels, Math.ceil(ratio * levels)))
  }

  const fullWeeks = buildWeeks(26)
  const narrowWeeks = fullWeeks.slice(-12)

  function renderGrid(weeks: { date: string; dateObj: Date }[][]) {
    let lastMonth = -1
    return (
      <div className="flex gap-[3px]">
        <div className="flex flex-col gap-[3px] mr-1.5 text-[10px] text-gray-500 pt-[18px]">
          {DAY_LABELS.map((d, i) => (
            <div key={i} className="h-[11px] leading-[11px]">
              {d}
            </div>
          ))}
        </div>
        <div className="flex gap-[3px]">
          {weeks.map((col, wi) => {
            const firstDay = col[0].dateObj
            const month = firstDay.getUTCMonth()
            const showMonth = month !== lastMonth
            if (showMonth) lastMonth = month
            return (
              <div key={wi} className="flex flex-col gap-[3px]">
                <div className="h-[14px] text-[10px] text-gray-500 whitespace-nowrap">
                  {showMonth ? MONTH_NAMES[month] : ''}
                </div>
                {col.map((day) => {
                  const value = byDate.get(day.date) ?? 0
                  const level = bucket(value)
                  const isFuture = day.dateObj > new Date()
                  return (
                    <div
                      key={day.date}
                      title={isFuture ? '' : `${day.date} — ${value} ${label}`}
                      className="w-[11px] h-[11px] rounded-[2px]"
                      style={{
                        backgroundColor: isFuture ? 'transparent' : levelColor(level, levels, accent),
                      }}
                    />
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div>
      {rangeLabel && <p className="text-[11px] text-gray-500 mb-1.5">{rangeLabel}</p>}
      <div className="overflow-x-auto">
        <div className="hidden sm:block w-max">{renderGrid(fullWeeks)}</div>
        <div className="sm:hidden w-max">{renderGrid(narrowWeeks)}</div>
      </div>
      {showLegend && (
        <div className="flex items-center gap-1.5 mt-2 text-[10px] text-gray-500">
          <span>less</span>
          {Array.from({ length: levels + 1 }, (_, i) => (
            <div
              key={i}
              className="w-[10px] h-[10px] rounded-[2px]"
              style={{ backgroundColor: levelColor(i, levels, accent) }}
            />
          ))}
          <span>more</span>
        </div>
      )}
    </div>
  )
}
