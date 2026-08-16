'use client'

import { ChevronLeft, ChevronRight, RefreshCw, Sparkles } from 'lucide-react'

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function formatWeekRange(weekStart: string): string {
  const start = new Date(weekStart + 'T00:00:00.000Z')
  const end = new Date(start)
  end.setUTCDate(end.getUTCDate() + 6)
  const startLabel = `${MONTH_NAMES[start.getUTCMonth()]} ${start.getUTCDate()}`
  const endLabel = `${MONTH_NAMES[end.getUTCMonth()]} ${end.getUTCDate()}`
  return `${startLabel} — ${endLabel}`
}

export interface RecapData {
  headline: string
  highlights: string[]
  focusNextWeek: string
  totalSets: number
  totalTonnageKg: number
  trainingDays: number
}

interface WeeklyRecapProps {
  weekStart: string
  canGoNext: boolean
  onPrevWeek: () => void
  onNextWeek: () => void
  recap: RecapData | null
  loading: boolean
  onRegenerate: () => void
  regenerating: boolean
  regenerateError: string | null
}

export default function WeeklyRecap({
  weekStart,
  canGoNext,
  onPrevWeek,
  onNextWeek,
  recap,
  loading,
  onRegenerate,
  regenerating,
  regenerateError,
}: WeeklyRecapProps) {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-brand-500" />
          <h2 className="font-semibold text-white">Weekly Recap</h2>
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={onPrevWeek} className="text-gray-400 hover:text-white transition-colors" aria-label="Previous week">
            <ChevronLeft size={16} />
          </button>
          <span className="text-xs text-gray-500 font-mono whitespace-nowrap">{formatWeekRange(weekStart)}</span>
          <button
            onClick={onNextWeek}
            disabled={!canGoNext}
            className="text-gray-400 hover:text-white disabled:opacity-30 disabled:hover:text-gray-400 transition-colors"
            aria-label="Next week"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-gray-500 py-4 text-center">Loading recap...</p>
      ) : !recap ? (
        <p className="text-sm text-gray-500 py-4 text-center">No activity logged for this week.</p>
      ) : (
        <>
          <p className="text-white font-medium mb-2">{recap.headline}</p>
          {recap.highlights.length > 0 && (
            <ul className="space-y-1 mb-3">
              {recap.highlights.map((h, i) => (
                <li key={i} className="text-sm text-gray-300">• {h}</li>
              ))}
            </ul>
          )}
          <p className="text-sm text-brand-400 mb-3">{recap.focusNextWeek}</p>
          <div className="grid grid-cols-3 gap-3 pt-3 border-t border-gray-700">
            <div>
              <p className="text-xs text-gray-500">Sets</p>
              <p className="text-sm font-semibold text-white">{recap.totalSets}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Tonnage</p>
              <p className="text-sm font-semibold text-white">{recap.totalTonnageKg}kg</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Training Days</p>
              <p className="text-sm font-semibold text-white">{recap.trainingDays}</p>
            </div>
          </div>
        </>
      )}

      {regenerateError && <p className="text-xs text-red-400 mt-2">{regenerateError}</p>}
      <button
        onClick={onRegenerate}
        disabled={regenerating || loading}
        className="mt-3 flex items-center gap-1.5 text-xs text-brand-400 hover:text-brand-300 disabled:opacity-50 transition-colors"
      >
        <RefreshCw size={12} className={regenerating ? 'animate-spin' : ''} />
        {regenerating ? 'Regenerating...' : 'Regenerate recap'}
      </button>
    </div>
  )
}
