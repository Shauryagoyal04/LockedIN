'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import type { LearningMode, SkillFormData } from '@/types'

const LEARNING_MODES: { value: LearningMode; label: string }[] = [
  { value: 'watch_lectures', label: 'Watch Lectures' },
  { value: 'build_projects', label: 'Build Projects' },
  { value: 'read_docs', label: 'Read Docs' },
  { value: 'practice_problems', label: 'Practice Problems' },
  { value: 'mock_interviews', label: 'Mock Interviews' },
]

const empty: SkillFormData = {
  name: '',
  description: '',
  totalHoursEstimated: 10,
  learningModes: [],
  specificGoal: '',
  deadline: '',
  resources: '',
}

interface Props {
  isOpen: boolean
  onClose: () => void
  onSave: (data: SkillFormData) => Promise<void>
  initialData?: Partial<SkillFormData>
  title?: string
}

export default function SkillModal({ isOpen, onClose, onSave, initialData, title = 'Add Skill' }: Props) {
  const [form, setForm] = useState<SkillFormData>(empty)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) {
      setForm(initialData ? { ...empty, ...initialData } : empty)
      setError('')
    }
  }, [isOpen, initialData])

  if (!isOpen) return null

  function toggleMode(mode: LearningMode) {
    setForm(f => ({
      ...f,
      learningModes: f.learningModes.includes(mode)
        ? f.learningModes.filter(m => m !== mode)
        : [...f.learningModes, mode],
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) { setError('Skill name is required'); return }
    if (!form.totalHoursEstimated || form.totalHoursEstimated < 1) { setError('Enter a valid hour estimate'); return }
    setError('')
    setLoading(true)
    try {
      await onSave(form)
      onClose()
    } catch {
      setError('Failed to save skill. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-gray-900 border border-gray-700 rounded-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-900/30 border border-red-700 text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Skill Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
              placeholder="e.g. Agentic AI"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={2}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 resize-none"
              placeholder="What does this skill mean to you?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Estimated Hours *</label>
            <input
              type="number"
              min={1}
              value={form.totalHoursEstimated}
              onChange={e => setForm(f => ({ ...f, totalHoursEstimated: parseInt(e.target.value) || 0 }))}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Learning Modes</label>
            <div className="flex flex-wrap gap-2">
              {LEARNING_MODES.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => toggleMode(value)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    form.learningModes.includes(value)
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Specific Goal</label>
            <input
              type="text"
              value={form.specificGoal}
              onChange={e => setForm(f => ({ ...f, specificGoal: e.target.value }))}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
              placeholder="e.g. Complete LangChain course and build 2 agent projects"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Deadline</label>
            <input
              type="date"
              value={form.deadline}
              onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Resources</label>
            <textarea
              value={form.resources}
              onChange={e => setForm(f => ({ ...f, resources: e.target.value }))}
              rows={2}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 resize-none"
              placeholder="Course links, book names, etc."
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium py-2.5 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg transition-colors"
            >
              {loading ? 'Saving...' : 'Save Skill'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
