'use client'

import { useEffect, useState, useCallback } from 'react'
import { Dumbbell, Pencil, X, Check } from 'lucide-react'
import LoadingSpinner from '@/components/LoadingSpinner'
import LogWorkoutForm from '@/components/gym/LogWorkoutForm'
import WeeklyVolume from '@/components/gym/WeeklyVolume'
import RecentSessions from '@/components/gym/RecentSessions'
import TrainingRecommendation from '@/components/gym/TrainingRecommendation'
import PersonalRecords from '@/components/gym/PersonalRecords'
import type { WeeklyPayload, MuscleRecommendation, ExercisePR } from '@/components/gym/types'

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

export default function GymPage() {
  const [profile, setProfile] = useState<GymProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [weekly, setWeekly] = useState<WeeklyPayload | null>(null)
  const [recommendations, setRecommendations] = useState<MuscleRecommendation[]>([])
  const [prs, setPrs] = useState<ExercisePR[]>([])
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
  }, [])

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

  const inputClass = 'w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 text-sm'

  if (loading) return <LoadingSpinner text="Loading gym profile..." />

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <Dumbbell size={22} className="text-indigo-400" />
        <h1 className="text-2xl font-bold text-white">Gym Tracker</h1>
      </div>

      {/* Profile card */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-5 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-white">Profile</h2>
          {!editing ? (
            <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors">
              <Pencil size={14} /> Edit
            </button>
          ) : (
            <div className="flex gap-2">
              <button onClick={() => setEditing(false)} className="flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors">
                <X size={14} /> Cancel
              </button>
              <button onClick={handleSave} disabled={saving} className="flex items-center gap-1 text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
                <Check size={14} /> {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          )}
        </div>

        {!editing ? (
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Current Weight', value: profile?.currentWeightKg ? `${profile.currentWeightKg} kg` : null },
              { label: 'Target Weight', value: profile?.targetWeightKg ? `${profile.targetWeightKg} kg` : null },
              { label: 'Height', value: profile?.heightCm ? `${profile.heightCm} cm` : null },
              { label: 'Goal', value: profile?.goal ? GOAL_LABELS[profile.goal] ?? profile.goal : null },
              { label: 'Experience', value: profile?.experienceLevel ? EXP_LABELS[profile.experienceLevel] ?? profile.experienceLevel : null },
              { label: 'Training Days/Week', value: profile?.trainingDaysPerWeek ? `${profile.trainingDaysPerWeek} days` : null },
              { label: 'Program / Split', value: profile?.programSplit },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-xs text-gray-500 mb-0.5">{label}</p>
                <p className={`text-sm font-medium ${value ? 'text-white' : 'text-gray-600'}`}>{value ?? 'Not set'}</p>
              </div>
            ))}
            {profile?.injuryNotes && (
              <div className="col-span-2">
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

      <LogWorkoutForm onLogged={refetchWeekly} />
      <TrainingRecommendation recommendations={recommendations} />
      <WeeklyVolume volume={weekly?.volume ?? []} />
      <PersonalRecords records={prs} />
      <RecentSessions sessions={weekly?.recentSessions ?? []} />
    </div>
  )
}
