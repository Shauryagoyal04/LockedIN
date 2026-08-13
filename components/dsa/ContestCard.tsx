'use client'

import type { SummaryPayload } from './types'

type Contest = NonNullable<SummaryPayload['nextContest']>

function fmtContest(iso: string) {
  const d = new Date(iso)
  const day = d.toLocaleDateString('en-US', { weekday: 'long' })
  const time = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  return `${day} ${time}`
}

export default function ContestCard({
  contest,
  targetRating,
}: {
  contest: Contest
  targetRating: number | null
}) {
  const label = fmtContest(contest.startsAt)
  const hours = Math.floor(contest.durationMin / 60)
  const mins = contest.durationMin % 60

  return (
    <section className="grid grid-cols-1 items-center gap-6 rounded-2xl border border-line bg-surface-2 p-5 md:grid-cols-[1fr_auto]">
      <div>
        <div className="font-mono text-[11px] tracking-[0.2em] text-brand-500">NEXT CONTEST</div>
        <div className="mt-1.5 text-xl font-extrabold">{contest.name}</div>
        <div className="mt-1 text-[13px] text-ink-subtle">
          {label} · {hours}h{mins ? ` ${mins}m` : ''}{' '}
          {contest.ratingChanging && '· Rating-changing'}
        </div>
        {contest.daysSinceLast != null && (
          <div className="mt-2.5 text-xs leading-relaxed text-ink-subtle">
            <span className="font-semibold text-brand-500">
              {contest.daysSinceLast} days since last round.
            </span>
            {targetRating ? ` Target ${targetRating} next.` : ''}
          </div>
        )}
      </div>
      <button className="inline-flex items-center gap-1.5 rounded-lg bg-brand-500 px-3.5 py-2.5 text-sm font-bold text-white shadow-brand-glow transition hover:bg-brand-600">
        Set reminder →
      </button>
    </section>
  )
}
