'use client'

import { useEffect, useState } from 'react'
import { formatDate } from '@/lib/utils'
import type { DashboardToday, HeatmapDay, PillarsData } from '@/types/dashboard'

import TopStrip from '@/components/dashboard/TopStrip'
import ScoreHero from '@/components/dashboard/ScoreHero'
import StreakCard from '@/components/dashboard/StreakCard'
import CoachCard from '@/components/dashboard/CoachCard'
import ScoreBreakdown from '@/components/dashboard/ScoreBreakdown'
import HeatmapCard from '@/components/dashboard/HeatmapCard'
import Pillars from '@/components/dashboard/Pillars'

function buildHeatmapScaffold(startDate: string | null, totalDays: number): HeatmapDay[] {
  const start = startDate ? new Date(startDate) : new Date()
  const arr: HeatmapDay[] = []
  for (let i = 0; i < totalDays; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    arr.push({ day: i + 1, score: null, date: d.toISOString().slice(0, 10) })
  }
  return arr
}

const emptyToday: DashboardToday = {
  date: new Date().toISOString(),
  dayNumber: 1,
  daysRemaining: 30,
  score: null,
  parts: [],
  bonus: 0,
  streak: { current: 0, best: 0, threshold: 60 },
  coachLine: null,
}

const emptyPillars: PillarsData = {
  dsa: { todaySolved: 0, target: 5, platforms: [], behindBy: 5 },
  gym: { weightKg: 0, deltaPerWeek: '—', volume: [], spark7: [] },
}

export default function DashboardPage() {
  const [today, setToday] = useState<DashboardToday>({ ...emptyToday })
  const [totalDays, setTotalDays] = useState(30)
  const [lockInStart, setLockInStart] = useState<string | null>(null)
  const [heatmap, setHeatmap] = useState<HeatmapDay[]>(() => buildHeatmapScaffold(null, 30))
  const [pillars, setPillars] = useState<PillarsData>(emptyPillars)

  useEffect(() => {
    // Dashboard summary (includes totalDays + lockInStart)
    fetch('/api/dashboard/today')
      .then(r => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) return
        const days = data.totalDays ?? 30
        const start = data.lockInStart ?? null
        setToday(prev => ({ ...prev, ...data }))
        setTotalDays(days)
        setLockInStart(start)
        setHeatmap(buildHeatmapScaffold(start, days))
      })
      .catch(() => {})

    // DSA today → pillars
    fetch('/api/dsa/today')
      .then(r => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) return
        const platforms = (data.byPlatform ?? []).map((p: {
          platform: string
          problemsSolvedToday: number
          problemsSolvedTotal: number
          rating: number | null
        }) => ({
          name: p.platform.charAt(0).toUpperCase() + p.platform.slice(1),
          short: p.platform.slice(0, 2).toUpperCase(),
          total: p.problemsSolvedTotal,
          delta: p.problemsSolvedToday,
          rating: p.rating,
        }))
        setPillars(prev => ({
          ...prev,
          dsa: {
            todaySolved: data.totalToday ?? 0,
            target: data.dailyTarget ?? 5,
            behindBy: Math.max(0, (data.dailyTarget ?? 5) - (data.totalToday ?? 0)),
            platforms,
          },
        }))
      })
      .catch(() => {})

    // Heatmap scores overlay
    fetch('/api/dsa/heatmap')
      .then(r => (r.ok ? r.json() : null))
      .then((data: { date: string; problemsSolved: number }[] | null) => {
        if (!data) return
        const byDate = Object.fromEntries(data.map(d => [d.date, d.problemsSolved]))
        setHeatmap(prev =>
          prev.map(cell => {
            const solved = byDate[cell.date]
            return solved != null
              ? { ...cell, score: Math.min(100, Math.round((solved / 5) * 100)) }
              : cell
          })
        )
      })
      .catch(() => {})
  }, [])

  const dayLabel = formatDate(new Date()).split(',').slice(0, 2).join(',')
  const pace = today.score == null ? 0 : today.score - 60

  return (
    <div className="-m-4 md:-m-8">
      <TopStrip
        dayLabel={dayLabel}
        dayNumber={today.dayNumber}
        daysRemaining={today.daysRemaining}
        score={today.score}
        streak={today.streak.current}
        pace={pace}
      />

      <div className="mx-auto flex max-w-7xl flex-col gap-6 p-4 md:p-8">
        <section className="grid gap-5 lg:grid-cols-[1.1fr_1fr]">
          <ScoreHero data={today} />
          <div className="flex flex-col gap-5">
            <StreakCard current={today.streak.current} threshold={today.streak.threshold} />
            <CoachCard line={today.coachLine} />
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
          <ScoreBreakdown data={today} />
          <HeatmapCard data={heatmap} todayIndex={today.dayNumber - 1} totalDays={totalDays} />
        </section>

        <section>
          <Pillars data={pillars} />
        </section>
      </div>
    </div>
  )
}
