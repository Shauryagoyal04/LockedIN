'use client'

import { useEffect, useState } from 'react'
import { Code2, RefreshCw, Flame } from 'lucide-react'
import LoadingSpinner from '@/components/LoadingSpinner'
import Heatmap57 from '@/components/dashboard/Heatmap57'
import ActivityHeatmap from '@/components/shared/ActivityHeatmap'
import PlatformCards from '@/components/dsa/PlatformCards'
import TopicCoverage from '@/components/dsa/TopicCoverage'
import RecentSubmissions from '@/components/dsa/RecentSubmissions'
import ContestCard from '@/components/dsa/ContestCard'
import type { DSAProfile, TodayPayload, SummaryPayload } from '@/components/dsa/types'
import type { HeatmapDay } from '@/types/dashboard'

interface ActivityDay {
  date: string
  value: number
}

export default function DSAPage() {
  const [profile, setProfile] = useState<DSAProfile | null>(null)
  const [today, setToday] = useState<TodayPayload | null>(null)
  const [heatmap, setHeatmap] = useState<HeatmapDay[]>([])
  const [summary, setSummary] = useState<SummaryPayload | null>(null)
  const [activity, setActivity] = useState<ActivityDay[]>([])
  const [loading, setLoading] = useState(true)
  const [fetching, setFetching] = useState(false)
  const [fetchMsg, setFetchMsg] = useState('')

  function buildHeatmap(
    raw: { date: string; problemsSolved: number }[],
    lockInDays: number,
    dailyTarget: number
  ): HeatmapDay[] {
    const byDate = Object.fromEntries(raw.map((d) => [d.date, d.problemsSolved]))
    const target = dailyTarget || 5
    const out: HeatmapDay[] = []
    for (let i = lockInDays - 1; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const iso = d.toISOString().slice(0, 10)
      const solved = byDate[iso]
      out.push({
        day: lockInDays - i,
        date: iso,
        score: solved != null ? Math.min(100, Math.round((solved / target) * 100)) : null,
      })
    }
    return out
  }

  useEffect(() => {
    Promise.all([
      fetch('/api/dsa/profile').then((r) => r.json()),
      fetch('/api/dsa/today').then((r) => r.json()),
      fetch('/api/dsa/heatmap').then((r) => r.json()),
      fetch('/api/dsa/summary').then((r) => (r.ok ? r.json() : null)),
      fetch('/api/dsa/activity').then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([p, t, h, s, a]) => {
        setProfile(p)
        setToday(t)
        const lockInDays: number = h?.days ?? 30
        const rawDays = Array.isArray(h?.data) ? h.data : []
        setHeatmap(buildHeatmap(rawDays, lockInDays, p?.dailyTarget ?? 5))
        setSummary(s)
        setActivity(Array.isArray(a?.days) ? a.days : [])
      })
      .finally(() => setLoading(false))
  }, [])

  const target = today?.dailyTarget ?? profile?.dailyTarget ?? 5
  const solved = today?.totalToday ?? 0
  const totalAll = today?.byPlatform.reduce((a, p) => a + p.problemsSolvedTotal, 0) ?? 0
  const pct = Math.min(100, target > 0 ? (solved / target) * 100 : 0)
  const hit = pct >= 100

  async function triggerFetch() {
    setFetching(true)
    setFetchMsg('')
    try {
      const res = await fetch('/api/dsa/fetch-now', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) {
        setFetchMsg(data.error ?? 'Fetch failed')
      } else {
        setFetchMsg(`Synced · ${data.totalSolvedToday} solved today`)
        const [t, h] = await Promise.all([
          fetch('/api/dsa/today').then((r) => r.json()),
          fetch('/api/dsa/heatmap').then((r) => r.json()),
        ])
        setToday(t)
        const rawDays = Array.isArray(h?.data) ? h.data : []
        setHeatmap(buildHeatmap(rawDays, h?.days ?? 30, profile?.dailyTarget ?? 5))
      }
    } catch (e) {
      setFetchMsg(String(e))
    }
    setFetching(false)
  }

  if (loading) return <LoadingSpinner text="Loading DSA tracker..." />

  return (
    <div className="-m-4 md:-m-8">
      {/* TOP STRIP */}
      <div className="flex items-center justify-between border-b border-line px-6 py-5 md:px-8">
        <div>
          <div className="flex items-center gap-2.5">
            <Code2 size={22} className="text-brand-500" />
            <h1 className="text-2xl font-extrabold tracking-tight text-white">DSA Tracker</h1>
          </div>
          <p className="mt-1 font-mono text-[11px] tracking-widest text-ink-subtle">
            {totalAll} TOTAL · 4 PLATFORMS · AUTO-FETCH @ 00:00
          </p>
        </div>
        <button
          onClick={triggerFetch}
          disabled={fetching}
          className="inline-flex items-center gap-1.5 rounded-lg bg-brand-500 px-3.5 py-2.5 text-sm font-bold text-white shadow-brand-glow transition hover:bg-brand-600 disabled:opacity-50"
        >
          <RefreshCw size={14} className={fetching ? 'animate-spin' : ''} />
          {fetching ? 'Fetching…' : 'Trigger fetch'}
        </button>
      </div>

      <div className="flex flex-col gap-5 p-6 md:p-8">
        {/* HERO */}
        <section className="relative overflow-hidden rounded-2xl border border-[#2a1812] bg-gradient-to-br from-[#1a0f08] to-[#0e0a08] p-7">
          <div
            className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(255,91,31,0.16), transparent 60%)' }}
          />
          <div className="relative grid grid-cols-1 gap-7 md:grid-cols-[1fr_280px]">
            <div>
              <div className="font-mono text-[11px] tracking-[0.2em] text-brand-500">
                TODAY&apos;S TARGET
              </div>
              <div className="mt-2 flex items-end gap-3.5">
                <div className="text-[100px] font-black leading-[0.85] tracking-[-0.04em]">
                  {solved}
                </div>
                <div className="pb-3.5 text-[28px] font-bold text-ink-subtle">/ {target}</div>
                <div className="ml-2 pb-4">
                  <div className="font-mono text-[11px] tracking-wider text-ink-subtle">
                    PROBLEMS SOLVED
                  </div>
                  <div
                    className={`mt-0.5 text-sm font-semibold ${hit ? 'text-[#5bd06b]' : 'text-brand-500'}`}
                  >
                    {hit ? '✓ Target hit' : `${Math.max(0, target - solved)} to go`}
                  </div>
                </div>
              </div>
              <div className="mt-4 h-2 max-w-[540px] overflow-hidden rounded-full bg-[#241612]">
                <div
                  className="h-full transition-[width] duration-500"
                  style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #ff5b1f, #ff7a45)' }}
                />
              </div>
            </div>

            <div className="relative flex flex-col justify-between gap-6">
              <div>
                <div className="font-mono text-[11px] tracking-[0.2em] text-ink-subtle">STREAK</div>
                <div className="mt-1 flex items-baseline gap-2">
                  <Flame size={32} className="text-brand-500" />
                  <div className="text-5xl font-extrabold leading-none tracking-tight">
                    {summary?.streak.current ?? 0}
                  </div>
                  <div className="text-sm text-ink-subtle">days</div>
                </div>
              </div>
              <div>
                <div className="mb-2.5 font-mono text-[10px] tracking-widest text-ink-subtle">
                  LAST {heatmap.length} DAYS
                </div>
                <Heatmap57 data={heatmap} cell={14} gap={3} />
              </div>
            </div>
          </div>
        </section>

        {/* PLATFORMS */}
        <PlatformCards
          platforms={today?.byPlatform ?? []}
          lastFetched={today?.lastFetched ?? null}
        />

        {/* CONSISTENCY */}
        <section className="rounded-2xl border border-line bg-surface-2 p-5">
          <h2 className="mb-3 font-mono text-[11px] tracking-widest text-ink-subtle">CONSISTENCY</h2>
          <ActivityHeatmap data={activity} accent="#ff5b1f" label="problems solved" />
        </section>

        {/* TOPICS + RECENT */}
        <section className="grid grid-cols-1 gap-4 lg:grid-cols-[1.2fr_1fr]">
          <TopicCoverage topics={summary?.topics ?? []} />
          <RecentSubmissions recent={summary?.recent ?? []} />
        </section>

        {/* CONTEST */}
        {summary?.nextContest && (
          <ContestCard
            contest={summary.nextContest}
            targetRating={profile?.targetCfRating ?? null}
          />
        )}

        {fetchMsg && (
          <div className="rounded-lg border border-line bg-surface-2 px-3 py-2 font-mono text-xs text-ink-muted">
            {fetchMsg}
          </div>
        )}
      </div>
    </div>
  )
}
