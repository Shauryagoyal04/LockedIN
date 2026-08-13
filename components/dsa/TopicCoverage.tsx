'use client'

import { useMemo } from 'react'
import { Sparkles } from 'lucide-react'
import type { TopicRow } from './types'

export default function TopicCoverage({ topics }: { topics: TopicRow[] }) {
  const sorted = useMemo(() => [...topics].sort((a, b) => b.solved - a.solved), [topics])
  const weakest = sorted.filter((t) => t.isWeak).slice(0, 2)

  return (
    <div className="rounded-2xl border border-line bg-surface-2 p-5">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <div className="text-sm font-bold">Topic coverage</div>
          <div className="mt-0.5 text-[11px] text-ink-subtle">Submissions till date</div>
        </div>
        <button className="inline-flex items-center gap-1.5 rounded-lg border border-line-2 px-3 py-1.5 text-[11px] font-semibold text-ink-muted hover:text-white">
          <Sparkles size={11} /> Analyze with AI
        </button>
      </div>

      {sorted.length === 0 ? (
        <div className="py-6 text-center text-sm text-ink-subtle">
          No submissions yet. Trigger a fetch to populate topics.
        </div>
      ) : (
        <div className="flex flex-col">
          {sorted.map((t, i) => (
            <div
              key={t.name}
              className={`grid grid-cols-[1fr_auto_50px] items-center gap-4 py-2.5 text-sm ${
                i < sorted.length - 1 ? 'border-b border-line' : ''
              }`}
            >
              <div className="font-semibold text-ink-muted">{t.name}</div>
              <div className="text-right font-mono text-sm font-bold">{t.solved}</div>
              <div
                className={`text-right font-mono text-[10px] font-bold tracking-wider ${
                  t.isWeak ? 'text-brand-500' : 'text-[#5bd06b]'
                }`}
              >
                {t.isWeak ? 'WEAK' : 'OK'}
              </div>
            </div>
          ))}
        </div>
      )}

      {weakest.length > 0 && (
        <div className="mt-3 rounded-lg border border-brand-500/20 bg-brand-500/[0.06] p-3 text-xs leading-relaxed">
          <span className="font-mono text-[10px] font-bold tracking-wider text-brand-500">
            FOCUS NEXT →
          </span>{' '}
          {weakest.map((w) => `${w.name} (${w.solved} solved)`).join(' and ')} — pick one in your
          next session.
        </div>
      )}
    </div>
  )
}
