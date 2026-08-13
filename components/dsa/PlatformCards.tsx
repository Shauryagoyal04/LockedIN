'use client'

import { PLATFORM_META, type Platform } from './types'

export default function PlatformCards({
  platforms,
  lastFetched,
}: {
  platforms: Platform[]
  lastFetched: string | null
}) {
  return (
    <section>
      <div className="mb-3.5 flex items-center justify-between">
        <h2 className="text-base font-bold">Platforms</h2>
        <div className="font-mono text-[11px] tracking-wider text-ink-subtle">
          {lastFetched
            ? `SYNCED ${new Date(lastFetched).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
            : 'NOT YET SYNCED'}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {platforms.map((p) => {
          const meta = PLATFORM_META[p.platform] ?? {
            name: p.platform,
            short: p.platform.slice(0, 2).toUpperCase(),
            color: '#888',
          }
          return (
            <div
              key={p.platform}
              className="relative overflow-hidden rounded-2xl border border-line bg-surface-2 p-[18px]"
            >
              <div className="flex items-center justify-between">
                <div
                  className="grid h-7 w-7 place-items-center rounded-lg font-mono text-xs font-bold"
                  style={{ background: meta.color + '22', color: meta.color }}
                >
                  {meta.short}
                </div>
                {p.problemsSolvedToday > 0 && (
                  <span className="rounded-full bg-brand-500/12 px-1.5 py-0.5 font-mono text-[10px] tracking-wider text-brand-500">
                    +{p.problemsSolvedToday} TODAY
                  </span>
                )}
              </div>
              <div className="mt-3.5 text-[13px] font-semibold text-ink-muted">{meta.name}</div>
              <div className="mt-1 flex items-end gap-2">
                <div className="text-[28px] font-extrabold leading-none">
                  {p.problemsSolvedTotal}
                </div>
                <div className="pb-1 text-[11px] text-ink-subtle">solved</div>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
                <div>
                  <div className="font-mono text-[9px] tracking-wider text-ink-subtle">RATING</div>
                  <div className="mt-0.5 text-sm font-bold">{p.rating ?? '—'}</div>
                </div>
                {p.isStale && (
                  <div className="font-mono text-[9px] tracking-wider text-ink-subtle">STALE</div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
