'use client'

import { useEffect, useState, useCallback } from 'react'
import { X, Check } from 'lucide-react'
import LoadingSpinner from '@/components/LoadingSpinner'
import GymTopStrip from '@/components/gym/GymTopStrip'
import LogWorkoutModal from '@/components/gym/LogWorkoutModal'
import GymStreakCard from '@/components/gym/GymStreakCard'
import WeeklyVolume from '@/components/gym/WeeklyVolume'
import RecentSessions from '@/components/gym/RecentSessions'
import TrainingRecommendation from '@/components/gym/TrainingRecommendation'
import PersonalRecords from '@/components/gym/PersonalRecords'
import Consistency from '@/components/gym/Consistency'
import WeeklyRecapCard, { type RecapData } from '@/components/gym/WeeklyRecap'
import { startOfIsoWeekUTC, isoDateUTC } from '@/lib/gym/week'
import { deriveSplitLabel } from '@/lib/gym/splitLabel'
import type { WeeklyPayload, MuscleRecommendation, ExercisePR } from '@/components/gym/types'

interface ActivityPayload {
  days: { date: string; value: number }[]
  streak: { current: number; longest: number; thisMonth: { active: number; total: number } }
}

interface GymProfile {
  userId: number
  heightCm: number | null
  currentWeightKg: number | null
  targetWeightKg: number | null
  goal: string | null
  experienceLevel: string | null
  trainingDaysPerWeek: number | null
  programSplit: string | null
  injuryNotes: string | null
}

const GOAL_LABELS: Record<string, string> = {
  lean_bulk: 'Lean Bulk', cut: 'Cut', recomposition: 'Recomposition', maintain: 'Maintain',
}
const EXP_LABELS: Record<string, string> = {
  beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced',
}

const emptyActivity: ActivityPayload = {
  days: [],
  streak: { current: 0, longest: 0, thisMonth: { active: 0, total: 30 } },
}

export default function GymPage() {
  const [profile, setProfile] = useState<GymProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showLogModal, setShowLogModal] = useState(false)
  const [weekly, setWeekly] = useState<WeeklyPayload | null>(null)
  const [recommendations, setRecommendations] = useState<MuscleRecommendation[]>([])
  const [prs, setPrs] = useState<ExercisePR[]>([])
  const [activity, setActivity] = useState<ActivityPayload>(emptyActivity)
  const lastWeekMonday = (() => {
    const d = new Date()
    d.setUTCDate(d.getUTCDate() - 7)
    return isoDateUTC(startOfIsoWeekUTC(d))
  })()
  const [recapWeekStart, setRecapWeekStart] = useState(lastWeekMonday)
  const [recap, setRecap] = useState<RecapData | null>(null)
  const [recapLoading, setRecapLoading] = useState(true)
  const [regenerating, setRegenerating] = useState(false)
  const [regenerateError, setRegenerateError] = useState<string | null>(null)
  const [form, setForm] = useState({
    currentWeightKg: '', heightCm: '', targetWeightKg: '',
    goal: '', experienceLevel: '', trainingDaysPerWeek: '',
    programSplit: '', injuryNotes: '',
  })

  const refetchWeekly = useCallback(() => {
    fetch('/api/gym/weekly')
      .then(r => r.json())
      .then((data: WeeklyPayload) => setWeekly(data))
    fetch('/api/gym/recommendation')
      .then(r => r.json())
      .then((data: { recommendations: MuscleRecommendation[] }) => setRecommendations(data.recommendations))
    fetch('/api/gym/prs')
      .then(r => r.json())
      .then((data: { records: ExercisePR[] }) => setPrs(data.records))
    fetch('/api/gym/activity')
      .then(r => r.json())
      .then((data: ActivityPayload) => setActivity(data))
  }, [])

  const fetchRecap = useCallback((weekStart: string) => {
    setRecapLoading(true)
    fetch(`/api/gym/recap?weekStart=${weekStart}`)
      .then(r => r.json())
      .then((data: { recap: RecapData | null }) => setRecap(data.recap))
      .finally(() => setRecapLoading(false))
  }, [])

  useEffect(() => {
    fetchRecap(recapWeekStart)
  }, [recapWeekStart, fetchRecap])

  function shiftWeek(weeks: number) {
    const d = new Date(recapWeekStart + 'T00:00:00.000Z')
    d.setUTCDate(d.getUTCDate() + weeks * 7)
    setRecapWeekStart(isoDateUTC(startOfIsoWeekUTC(d)))
  }

  async function handleRegenerate() {
    setRegenerating(true)
    setRegenerateError(null)
    try {
      const res = await fetch('/api/gym/recap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weekStart: recapWeekStart }),
      })
      const data = await res.json()
      if (!res.ok) {
        setRegenerateError(data.error || 'Failed to regenerate recap')
        return
      }
      setRecap(data.recap)
    } catch {
      setRegenerateError('Network error — please try again')
    } finally {
      setRegenerating(false)
    }
  }

  useEffect(() => {
    fetch('/api/gym/profile')
      .then(r => r.json())
      .then((data: GymProfile) => {
        setProfile(data)
        setForm({
          currentWeightKg: data.currentWeightKg ? String(data.currentWeightKg) : '',
          heightCm: data.heightCm ? String(data.heightCm) : '',
          targetWeightKg: data.targetWeightKg ? String(data.targetWeightKg) : '',
          goal: data.goal ?? '',
          experienceLevel: data.experienceLevel ?? '',
          trainingDaysPerWeek: data.trainingDaysPerWeek ? String(data.trainingDaysPerWeek) : '',
          programSplit: data.programSplit ?? '',
          injuryNotes: data.injuryNotes ?? '',
        })
      })
      .finally(() => setLoading(false))
    refetchWeekly()
  }, [refetchWeekly])


  async function handleSave() {
    setSaving(true)
    const res = await fetch('/api/gym/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        currentWeightKg: form.currentWeightKg ? parseFloat(form.currentWeightKg) : null,
        heightCm: form.heightCm ? parseInt(form.heightCm) : null,
        targetWeightKg: form.targetWeightKg ? parseFloat(form.targetWeightKg) : null,
        goal: form.goal || null,
        experienceLevel: form.experienceLevel || null,
        trainingDaysPerWeek: form.trainingDaysPerWeek ? parseInt(form.trainingDaysPerWeek) : null,
        programSplit: form.programSplit || null,
        injuryNotes: form.injuryNotes || null,
      }),
    })
    if (res.ok) {
      setProfile(await res.json())
      setEditing(false)
    }
    setSaving(false)
  }

  const inputClass = 'w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-brand-500 text-sm'

  if (loading) return <LoadingSpinner text="Loading gym profile..." />

  const lastSession = (() => {
    const s = weekly?.recentSessions?.[0]
    if (!s) return null
    const label = deriveSplitLabel(s.exercises.map((ex) => ex.muscleGroup))
    const sessionDate = new Date(s.date + 'T00:00:00.000Z')
    const today = new Date()
    today.setUTCHours(0, 0, 0, 0)
    const daysAgo = Math.round((today.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24))
    return { label, daysAgo }
  })()

  const splitCaption = [profile?.programSplit, profile?.trainingDaysPerWeek ? `${profile.trainingDaysPerWeek} DAY SPLIT` : null]
    .filter(Boolean)
    .join(' · ')
    .toUpperCase()

  return (
    <div className="-m-4 md:-m-8">
      <GymTopStrip
        goal={profile?.goal ?? null}
        trainingDaysPerWeek={profile?.trainingDaysPerWeek ?? null}
        onEditProfile={() => setEditing((v) => !v)}
        onLogWorkout={() => setShowLogModal(true)}
      />

      <div className="mx-auto flex max-w-7xl flex-col gap-5 p-4 md:p-8">
        {/* HERO ROW */}
        <section className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
          <TrainingRecommendation
            recommendations={recommendations}
            lastSession={lastSession}
            weeklySets={weekly?.totalWeeklySets ?? 0}
            weeklyTonnageKg={weekly?.totalWeeklyTonnageKg ?? 0}
          />
          <GymStreakCard
            current={activity.streak.current}
            longest={activity.streak.longest}
            thisMonth={activity.streak.thisMonth}
          />
        </section>

        {/* PROFILE */}
        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white">Profile</h2>
            {!editing ? (
              splitCaption && <span className="text-xs text-gray-500">{splitCaption}</span>
            ) : (
              <div className="flex gap-2">
                <button onClick={() => setEditing(false)} className="flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors">
                  <X size={14} /> Cancel
                </button>
                <button onClick={handleSave} disabled={saving} className="flex items-center gap-1 text-sm text-brand-400 hover:text-brand-300 transition-colors">
                  <Check size={14} /> {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            )}
          </div>

          {!editing ? (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {[
                { label: 'Current Weight', value: profile?.currentWeightKg ? `${profile.currentWeightKg} kg` : null },
                { label: 'Target Weight', value: profile?.targetWeightKg ? `${profile.targetWeightKg} kg` : null },
                { label: 'Height', value: profile?.heightCm ? `${profile.heightCm} cm` : null },
                { label: 'Goal', value: profile?.goal ? GOAL_LABELS[profile.goal] ?? profile.goal : null },
                { label: 'Experience', value: profile?.experienceLevel ? EXP_LABELS[profile.experienceLevel] ?? profile.experienceLevel : null },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-xs text-gray-500 mb-0.5">{label}</p>
                  <p className={`text-sm font-medium ${value ? 'text-white' : 'text-gray-600'}`}>{value ?? 'Not set'}</p>
                </div>
              ))}
              {profile?.injuryNotes && (
                <div className="col-span-2 md:col-span-5">
                  <p className="text-xs text-gray-500 mb-0.5">Injury Notes</p>
                  <p className="text-sm text-yellow-400">{profile.injuryNotes}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Weight (kg)</label>
                  <input type="number" step="0.1" value={form.currentWeightKg} onChange={e => setForm(f => ({ ...f, currentWeightKg: e.target.value }))} className={inputClass} placeholder="70" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Height (cm)</label>
                  <input type="number" value={form.heightCm} onChange={e => setForm(f => ({ ...f, heightCm: e.target.value }))} className={inputClass} placeholder="175" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Target (kg)</label>
                  <input type="number" step="0.1" value={form.targetWeightKg} onChange={e => setForm(f => ({ ...f, targetWeightKg: e.target.value }))} className={inputClass} placeholder="76" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Goal</label>
                  <select value={form.goal} onChange={e => setForm(f => ({ ...f, goal: e.target.value }))} className={inputClass}>
                    <option value="">Select goal</option>
                    <option value="lean_bulk">Lean Bulk</option>
                    <option value="cut">Cut</option>
                    <option value="recomposition">Recomposition</option>
                    <option value="maintain">Maintain</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Experience</label>
                  <select value={form.experienceLevel} onChange={e => setForm(f => ({ ...f, experienceLevel: e.target.value }))} className={inputClass}>
                    <option value="">Select level</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Training Days/Week</label>
                  <input type="number" min={1} max={7} value={form.trainingDaysPerWeek} onChange={e => setForm(f => ({ ...f, trainingDaysPerWeek: e.target.value }))} className={inputClass} placeholder="4" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Program / Split</label>
                  <input type="text" value={form.programSplit} onChange={e => setForm(f => ({ ...f, programSplit: e.target.value }))} className={inputClass} placeholder="Push Pull Legs" />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Injury Notes</label>
                <textarea value={form.injuryNotes} onChange={e => setForm(f => ({ ...f, injuryNotes: e.target.value }))} rows={2} className={`${inputClass} resize-none`} placeholder="Optional..." />
              </div>
            </div>
          )}
        </div>

        {/* MUSCLE SCORE + CONSISTENCY/PRS */}
        <section className="grid gap-5 lg:grid-cols-[1.2fr_1fr]">
          <WeeklyVolume volume={weekly?.volume ?? []} />
          <div className="flex flex-col gap-5">
            <Consistency days={activity.days} streak={activity.streak} />
            <PersonalRecords records={prs} />
          </div>
        </section>

        {/* RECENT SESSIONS + WEEKLY RECAP */}
        <section className="grid gap-5 lg:grid-cols-[1.2fr_1fr]">
          <RecentSessions sessions={weekly?.recentSessions ?? []} />
          <WeeklyRecapCard
            weekStart={recapWeekStart}
            canGoNext={recapWeekStart < lastWeekMonday}
            onPrevWeek={() => shiftWeek(-1)}
            onNextWeek={() => shiftWeek(1)}
            recap={recap}
            loading={recapLoading}
            onRegenerate={handleRegenerate}
            regenerating={regenerating}
            regenerateError={regenerateError}
          />
        </section>
      </div>

      <LogWorkoutModal
        open={showLogModal}
        onClose={() => setShowLogModal(false)}
        onLogged={refetchWeekly}
      />
    </div>
  )
}
