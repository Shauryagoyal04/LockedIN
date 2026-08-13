'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Code2, Dumbbell, Save, X, Pencil, Lock } from 'lucide-react'

interface DSAProfile {
  lcUsername: string
  cfHandle: string
  ccUsername: string
  dailyTarget: number
  targetCfRating: number | null
}

interface GymProfile {
  heightCm: number | null
  currentWeightKg: number | null
  targetWeightKg: number | null
  goal: string | null
  experienceLevel: string | null
  trainingDaysPerWeek: number | null
  programSplit: string | null
  injuryNotes: string | null
}

const emptyDSA: DSAProfile = {
  lcUsername: '',
  cfHandle: '',
  ccUsername: '',
  dailyTarget: 5,
  targetCfRating: null,
}

const emptyGym: GymProfile = {
  heightCm: null,
  currentWeightKg: null,
  targetWeightKg: null,
  goal: null,
  experienceLevel: null,
  trainingDaysPerWeek: null,
  programSplit: null,
  injuryNotes: null,
}

interface LockIn {
  lockInStart: string | null
  lockInDays: number
}

export default function ProfilePage() {
  const { data: session } = useSession()

  const [dsa, setDsa] = useState<DSAProfile>(emptyDSA)
  const [gym, setGym] = useState<GymProfile>(emptyGym)
  const [lockIn, setLockIn] = useState<LockIn>({ lockInStart: null, lockInDays: 30 })
  const [lockInDraft, setLockInDraft] = useState<LockIn>({ lockInStart: null, lockInDays: 30 })
  const [dsaEdit, setDsaEdit] = useState(false)
  const [gymEdit, setGymEdit] = useState(false)
  const [lockInEdit, setLockInEdit] = useState(false)
  const [dsaDraft, setDsaDraft] = useState<DSAProfile>(emptyDSA)
  const [gymDraft, setGymDraft] = useState<GymProfile>(emptyGym)
  const [dsaSaving, setDsaSaving] = useState(false)
  const [gymSaving, setGymSaving] = useState(false)
  const [lockInSaving, setLockInSaving] = useState(false)
  const [dsaError, setDsaError] = useState('')
  const [gymError, setGymError] = useState('')
  const [lockInError, setLockInError] = useState('')

  useEffect(() => {
    fetch('/api/dsa/profile')
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) { setDsa(data); setDsaDraft(data) } })
      .catch(() => {})

    fetch('/api/gym/profile')
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) { setGym(data); setGymDraft(data) } })
      .catch(() => {})

    fetch('/api/user/lockin')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) {
          const li = {
            lockInStart: data.lockInStart ? data.lockInStart.slice(0, 10) : null,
            lockInDays: data.lockInDays ?? 30,
          }
          setLockIn(li)
          setLockInDraft(li)
        }
      })
      .catch(() => {})
  }, [])

  async function saveLockIn() {
    setLockInSaving(true)
    setLockInError('')
    try {
      const res = await fetch('/api/user/lockin', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lockInDraft),
      })
      if (!res.ok) { setLockInError('Failed to save'); return }
      const data = await res.json()
      const li = {
        lockInStart: data.lockInStart ? data.lockInStart.slice(0, 10) : null,
        lockInDays: data.lockInDays ?? 30,
      }
      setLockIn(li)
      setLockInEdit(false)
    } catch {
      setLockInError('Something went wrong')
    } finally {
      setLockInSaving(false)
    }
  }

  async function saveDSA() {
    setDsaSaving(true)
    setDsaError('')
    try {
      const res = await fetch('/api/dsa/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dsaDraft),
      })
      if (!res.ok) { setDsaError('Failed to save'); return }
      const data = await res.json()
      setDsa(data)
      setDsaEdit(false)
    } catch {
      setDsaError('Something went wrong')
    } finally {
      setDsaSaving(false)
    }
  }

  async function saveGym() {
    setGymSaving(true)
    setGymError('')
    try {
      const res = await fetch('/api/gym/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gymDraft),
      })
      if (!res.ok) { setGymError('Failed to save'); return }
      const data = await res.json()
      setGym(data)
      setGymEdit(false)
    } catch {
      setGymError('Something went wrong')
    } finally {
      setGymSaving(false)
    }
  }

  const lockInEnd = lockIn.lockInStart
    ? (() => {
        const d = new Date(lockIn.lockInStart)
        d.setDate(d.getDate() + lockIn.lockInDays)
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      })()
    : null

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-4">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Profile</h1>
        <p className="mt-1 text-sm text-gray-400">{session?.user?.email}</p>
      </div>

      {/* Lock-in Period */}
      <div className="rounded-2xl bg-gray-900 border border-gray-800 p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-500/10 grid place-items-center">
              <Lock size={16} className="text-brand-400" />
            </div>
            <h2 className="text-base font-semibold text-white">Lock-in Period</h2>
          </div>
          {!lockInEdit && (
            <button
              onClick={() => { setLockInDraft(lockIn); setLockInEdit(true) }}
              className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors"
            >
              <Pencil size={14} /> Edit
            </button>
          )}
        </div>

        {lockInError && <p className="mb-4 text-sm text-red-400">{lockInError}</p>}

        {lockInEdit ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-[11px] uppercase tracking-widest text-gray-500 mb-1">Start Date</label>
              <input
                type="date"
                value={lockInDraft.lockInStart ?? ''}
                onChange={e => setLockInDraft(p => ({ ...p, lockInStart: e.target.value || null }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-[11px] uppercase tracking-widest text-gray-500 mb-1">Duration (days)</label>
              <input
                type="number"
                min={1}
                max={365}
                value={lockInDraft.lockInDays}
                onChange={e => setLockInDraft(p => ({ ...p, lockInDays: parseInt(e.target.value) || 30 }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-3">
            <StatDisplay label="Start Date" value={lockIn.lockInStart ?? 'Not set'} />
            <StatDisplay label="Duration" value={`${lockIn.lockInDays} days`} />
            <StatDisplay label="End Date" value={lockInEnd ?? '—'} />
          </div>
        )}

        {lockInEdit && (
          <div className="flex gap-3 mt-5">
            <button
              onClick={saveLockIn}
              disabled={lockInSaving}
              className="flex items-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 px-4 py-2 text-sm font-semibold text-white transition-colors"
            >
              <Save size={14} /> {lockInSaving ? 'Saving…' : 'Save'}
            </button>
            <button
              onClick={() => { setLockInEdit(false); setLockInError('') }}
              className="flex items-center gap-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-300 transition-colors"
            >
              <X size={14} /> Cancel
            </button>
          </div>
        )}
      </div>

      {/* DSA Section */}
      <div className="rounded-2xl bg-gray-900 border border-gray-800 p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 grid place-items-center">
              <Code2 size={16} className="text-indigo-400" />
            </div>
            <h2 className="text-base font-semibold text-white">DSA &amp; Competitive Programming</h2>
          </div>
          {!dsaEdit && (
            <button
              onClick={() => { setDsaDraft(dsa); setDsaEdit(true) }}
              className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors"
            >
              <Pencil size={14} /> Edit
            </button>
          )}
        </div>

        {dsaError && (
          <p className="mb-4 text-sm text-red-400">{dsaError}</p>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="LeetCode Username" value={dsa.lcUsername} editing={dsaEdit}
            onChange={v => setDsaDraft(p => ({ ...p, lcUsername: v }))}
            draft={dsaDraft.lcUsername} placeholder="e.g. johndev" />
          <Field label="Codeforces Handle" value={dsa.cfHandle} editing={dsaEdit}
            onChange={v => setDsaDraft(p => ({ ...p, cfHandle: v }))}
            draft={dsaDraft.cfHandle} placeholder="e.g. tourist" />
          <Field label="CodeChef Username" value={dsa.ccUsername} editing={dsaEdit}
            onChange={v => setDsaDraft(p => ({ ...p, ccUsername: v }))}
            draft={dsaDraft.ccUsername} placeholder="e.g. gennady" />
          <Field label="Daily Problem Target" value={String(dsa.dailyTarget ?? 5)} editing={dsaEdit}
            onChange={v => setDsaDraft(p => ({ ...p, dailyTarget: parseInt(v) || 5 }))}
            draft={String(dsaDraft.dailyTarget ?? 5)} placeholder="5" type="number" />
          <Field label="Target CF Rating" value={dsa.targetCfRating ? String(dsa.targetCfRating) : '—'} editing={dsaEdit}
            onChange={v => setDsaDraft(p => ({ ...p, targetCfRating: v ? parseInt(v) : null }))}
            draft={dsaDraft.targetCfRating ? String(dsaDraft.targetCfRating) : ''} placeholder="e.g. 1800" type="number" />
        </div>

        {dsaEdit && (
          <div className="flex gap-3 mt-5">
            <button
              onClick={saveDSA}
              disabled={dsaSaving}
              className="flex items-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 px-4 py-2 text-sm font-semibold text-white transition-colors"
            >
              <Save size={14} /> {dsaSaving ? 'Saving…' : 'Save'}
            </button>
            <button
              onClick={() => { setDsaEdit(false); setDsaError('') }}
              className="flex items-center gap-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-300 transition-colors"
            >
              <X size={14} /> Cancel
            </button>
          </div>
        )}
      </div>

      {/* Gym Section */}
      <div className="rounded-2xl bg-gray-900 border border-gray-800 p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 grid place-items-center">
              <Dumbbell size={16} className="text-orange-400" />
            </div>
            <h2 className="text-base font-semibold text-white">Gym &amp; Fitness</h2>
          </div>
          {!gymEdit && (
            <button
              onClick={() => { setGymDraft(gym); setGymEdit(true) }}
              className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors"
            >
              <Pencil size={14} /> Edit
            </button>
          )}
        </div>

        {gymError && (
          <p className="mb-4 text-sm text-red-400">{gymError}</p>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Height (cm)" value={gym.heightCm ? String(gym.heightCm) : '—'} editing={gymEdit}
            onChange={v => setGymDraft(p => ({ ...p, heightCm: v ? parseInt(v) : null }))}
            draft={gymDraft.heightCm ? String(gymDraft.heightCm) : ''} placeholder="175" type="number" />
          <Field label="Current Weight (kg)" value={gym.currentWeightKg ? String(gym.currentWeightKg) : '—'} editing={gymEdit}
            onChange={v => setGymDraft(p => ({ ...p, currentWeightKg: v ? parseFloat(v) : null }))}
            draft={gymDraft.currentWeightKg ? String(gymDraft.currentWeightKg) : ''} placeholder="70" type="number" />
          <Field label="Target Weight (kg)" value={gym.targetWeightKg ? String(gym.targetWeightKg) : '—'} editing={gymEdit}
            onChange={v => setGymDraft(p => ({ ...p, targetWeightKg: v ? parseFloat(v) : null }))}
            draft={gymDraft.targetWeightKg ? String(gymDraft.targetWeightKg) : ''} placeholder="75" type="number" />
          <Field label="Training Days / Week" value={gym.trainingDaysPerWeek ? String(gym.trainingDaysPerWeek) : '—'} editing={gymEdit}
            onChange={v => setGymDraft(p => ({ ...p, trainingDaysPerWeek: v ? parseInt(v) : null }))}
            draft={gymDraft.trainingDaysPerWeek ? String(gymDraft.trainingDaysPerWeek) : ''} placeholder="4" type="number" />

          {gymEdit ? (
            <div>
              <label className="block text-[11px] uppercase tracking-widest text-gray-500 mb-1">Goal</label>
              <select
                value={gymDraft.goal ?? ''}
                onChange={e => setGymDraft(p => ({ ...p, goal: e.target.value || null }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="">Select…</option>
                <option value="lean_bulk">Lean Bulk</option>
                <option value="cut">Cut</option>
                <option value="recomposition">Recomposition</option>
                <option value="maintain">Maintain</option>
              </select>
            </div>
          ) : (
            <StatDisplay label="Goal" value={gym.goal ? gym.goal.replace('_', ' ') : '—'} />
          )}

          {gymEdit ? (
            <div>
              <label className="block text-[11px] uppercase tracking-widest text-gray-500 mb-1">Experience Level</label>
              <select
                value={gymDraft.experienceLevel ?? ''}
                onChange={e => setGymDraft(p => ({ ...p, experienceLevel: e.target.value || null }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="">Select…</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          ) : (
            <StatDisplay label="Experience Level" value={gym.experienceLevel ?? '—'} />
          )}

          <Field label="Program / Split" value={gym.programSplit ?? '—'} editing={gymEdit}
            onChange={v => setGymDraft(p => ({ ...p, programSplit: v || null }))}
            draft={gymDraft.programSplit ?? ''} placeholder="e.g. PPL, Upper/Lower" />
        </div>

        {gymEdit && (
          <div className="mt-4">
            <label className="block text-[11px] uppercase tracking-widest text-gray-500 mb-1">Injury Notes</label>
            <textarea
              value={gymDraft.injuryNotes ?? ''}
              onChange={e => setGymDraft(p => ({ ...p, injuryNotes: e.target.value || null }))}
              rows={2}
              placeholder="Any injuries or limitations…"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>
        )}

        {!gymEdit && gym.injuryNotes && (
          <div className="mt-4">
            <p className="text-[11px] uppercase tracking-widest text-gray-500 mb-1">Injury Notes</p>
            <p className="text-sm text-gray-300">{gym.injuryNotes}</p>
          </div>
        )}

        {gymEdit && (
          <div className="flex gap-3 mt-5">
            <button
              onClick={saveGym}
              disabled={gymSaving}
              className="flex items-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 px-4 py-2 text-sm font-semibold text-white transition-colors"
            >
              <Save size={14} /> {gymSaving ? 'Saving…' : 'Save'}
            </button>
            <button
              onClick={() => { setGymEdit(false); setGymError('') }}
              className="flex items-center gap-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-300 transition-colors"
            >
              <X size={14} /> Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function Field({
  label, value, editing, onChange, draft, placeholder, type = 'text',
}: {
  label: string
  value: string
  editing: boolean
  onChange: (v: string) => void
  draft: string
  placeholder?: string
  type?: string
}) {
  if (!editing) return <StatDisplay label={label} value={value || '—'} />
  return (
    <div>
      <label className="block text-[11px] uppercase tracking-widest text-gray-500 mb-1">{label}</label>
      <input
        type={type}
        value={draft}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
      />
    </div>
  )
}

function StatDisplay({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-widest text-gray-500">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-white capitalize">{value}</p>
    </div>
  )
}
