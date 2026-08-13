'use client'

import { Check, X } from 'lucide-react'
import type { RecentRow } from './types'

export default function RecentSubmissions({ recent }: { recent: RecentRow[] }) {
  return (
    <div className="rounded-2xl border border-line bg-surface-2 p-5">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-sm font-bold">Recent submissions</div>
        <div className="font-mono text-[11px] tracking-wider text-ink-subtle">
          LAST {recent.length || 0}
        </div>
      </div>
      {recent.length === 0 ? (
        <div className="py-6 text-center text-sm text-ink-subtle">No recent submissions.</div>
      ) : (
        <div className="flex flex-col">
          {recent.map((r, i) => (
            <div
              key={i}
              className={`grid grid-cols-[24px_1fr_auto] items-center gap-3 py-2.5 ${
                i < recent.length - 1 ? 'border-b border-line' : ''
              }`}
            >
              <div
                className={`grid h-[18px] w-[18px] place-items-center rounded font-mono text-[10px] font-bold ${
                  r.status === 'ac'
                    ? 'bg-[#5bd06b]/15 text-[#5bd06b]'
                    : 'bg-red-500/15 text-red-500'
                }`}
              >
                {r.status === 'ac' ? <Check size={11} /> : <X size={11} />}
              </div>
              <div>
                <div className="text-[13px] font-medium">{r.title}</div>
                <div className="mt-0.5 font-mono text-[10px] tracking-wider text-ink-subtle">
                  {r.platform.toUpperCase()}
                  {r.difficulty ? ` · ${r.difficulty}` : ''}
                  {r.tag ? ` · ${r.tag}` : ''}
                </div>
              </div>
              <div className="font-mono text-[11px] text-ink-subtle">{r.ago}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
