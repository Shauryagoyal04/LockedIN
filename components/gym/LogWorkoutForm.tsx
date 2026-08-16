'use client'

import { useState } from 'react'
import { Sparkles, Loader2, Trophy } from 'lucide-react'
import type { SessionRow } from './types'

interface LogResponse extends SessionRow {
  newPRs: { exerciseId: number; displayName: string; weightKg: number }[]
}

export default function LogWorkoutForm({ onLogged }: { onLogged: (session: SessionRow) => void }) {
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastLogged, setLastLogged] = useState<SessionRow | null>(null)
  const [newPRs, setNewPRs] = useState<LogResponse['newPRs']>([])

  async function handleSubmit() {
    if (!text.trim() || submitting) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/gym/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })
      const data: LogResponse = await res.json()
      if (!res.ok) {
        setError((data as unknown as { error?: string }).error || 'Failed to log workout')
        return
      }
      setLastLogged(data)
      setNewPRs(data.newPRs ?? [])
      setText('')
      onLogged(data)
    } catch {
      setError('Network error — please try again')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-2xl p-5 mb-4">
      <div className="flex items-center gap-2 mb-1">
        <Sparkles size={16} className="text-brand-500" />
        <h2 className="font-semibold text-white">Log a Workout</h2>
      </div>
      <p className="text-xs text-gray-500 mb-3">
        Describe your workout in plain English — sets, reps, and weight will be extracted automatically. Powered by Gemini.
      </p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
        placeholder="e.g. Bench press 4 sets of 8 at 60kg, then some squats"
        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-brand-500 text-sm resize-none"
      />
      {error && <p className="text-sm text-red-400 mt-2">{error}</p>}
      {newPRs.length > 0 && (
        <div className="mt-2 space-y-1">
          {newPRs.map((pr) => (
            <p key={pr.exerciseId} className="flex items-center gap-1.5 text-sm text-yellow-400">
              <Trophy size={14} /> New PR — {pr.displayName} {pr.weightKg}kg
            </p>
          ))}
        </div>
      )}
      <div className="flex items-center justify-between mt-3">
        <button
          onClick={handleSubmit}
          disabled={submitting || !text.trim()}
          className="flex items-center gap-1.5 bg-brand-500 hover:bg-brand-600 disabled:bg-gray-700 disabled:text-gray-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          {submitting && <Loader2 size={14} className="animate-spin" />}
          {submitting ? 'Analyzing...' : 'Log Workout'}
        </button>
      </div>
      {lastLogged && !submitting && (
        <div className="mt-4 pt-3 border-t border-gray-700">
          <p className="text-xs text-gray-500 mb-1.5">Logged:</p>
          <ul className="space-y-1">
            {lastLogged.exercises.map((ex) => (
              <li key={ex.id} className="text-sm text-gray-300">
                <span className="text-white font-medium">{ex.name}</span>
                {' — '}
                {ex.sets.length} set{ex.sets.length !== 1 ? 's' : ''}
                {ex.sets[0] ? ` × ${ex.sets[0].reps} reps` : ''}
                {ex.sets[0]?.weightKg ? ` @ ${ex.sets[0].weightKg}kg` : ''}
                {ex.muscleGroup ? ` (${ex.muscleGroup})` : ''}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
