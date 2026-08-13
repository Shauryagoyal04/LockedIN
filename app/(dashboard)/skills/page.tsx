'use client'

import { useEffect, useState } from 'react'
import { BookOpen, Plus, Pencil, Trash2 } from 'lucide-react'
import LoadingSpinner from '@/components/LoadingSpinner'
import SkillModal from '@/components/SkillModal'
import type { SkillFormData, LearningMode } from '@/types'

interface SkillPlan {
  id: number
  name: string
  description: string | null
  totalHoursEstimated: number
  learningModes: LearningMode[]
  specificGoal: string | null
  deadline: string | null
  resources: string | null
  isActive: boolean
  createdAt: string
}

const MODE_LABELS: Record<LearningMode, string> = {
  watch_lectures: 'Lectures',
  build_projects: 'Projects',
  read_docs: 'Docs',
  practice_problems: 'Practice',
  mock_interviews: 'Mock',
}

export default function SkillsPage() {
  const [skills, setSkills] = useState<SkillPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingSkill, setEditingSkill] = useState<SkillPlan | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  async function fetchSkills() {
    const res = await fetch('/api/skills/')
    if (res.ok) setSkills(await res.json())
  }

  useEffect(() => {
    fetchSkills().finally(() => setLoading(false))
  }, [])

  async function handleSave(data: SkillFormData) {
    if (editingSkill) {
      await fetch(`/api/skills/${editingSkill.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
    } else {
      await fetch('/api/skills/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
    }
    await fetchSkills()
    setEditingSkill(null)
  }

  async function handleDelete(id: number) {
    if (!window.confirm('Delete this skill?')) return
    setDeletingId(id)
    await fetch(`/api/skills/${id}`, { method: 'DELETE' })
    setSkills(prev => prev.filter(s => s.id !== id))
    setDeletingId(null)
  }

  function openEdit(skill: SkillPlan) {
    setEditingSkill(skill)
    setShowModal(true)
  }

  function formatDeadline(deadline: string | null) {
    if (!deadline) return 'No deadline'
    return new Date(deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  if (loading) return <LoadingSpinner text="Loading skills..." />

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <BookOpen size={22} className="text-indigo-400" />
          <h1 className="text-2xl font-bold text-white">Skills Tracker</h1>
        </div>
        <button
          onClick={() => { setEditingSkill(null); setShowModal(true) }}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Plus size={16} /> Add Skill
        </button>
      </div>

      {skills.length === 0 ? (
        <div className="text-center py-16 bg-gray-900 border border-gray-800 rounded-xl">
          <BookOpen size={40} className="text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400 font-medium mb-1">No skills yet</p>
          <p className="text-gray-600 text-sm mb-4">Add a skill to start tracking your learning progress</p>
          <button
            onClick={() => { setEditingSkill(null); setShowModal(true) }}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Add your first skill
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {skills.map(skill => (
            <div key={skill.id} className="bg-gray-800 border border-gray-700 rounded-xl p-5 flex flex-col">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-semibold text-white text-base leading-tight">{skill.name}</h3>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => openEdit(skill)} className="p-1.5 text-gray-500 hover:text-gray-300 transition-colors rounded">
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(skill.id)}
                    disabled={deletingId === skill.id}
                    className="p-1.5 text-gray-500 hover:text-red-400 transition-colors rounded"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {skill.description && (
                <p className="text-gray-400 text-sm mb-3 line-clamp-2">{skill.description}</p>
              )}

              {/* Learning mode badges */}
              {skill.learningModes.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {skill.learningModes.map(mode => (
                    <span key={mode} className="px-2 py-0.5 text-xs rounded-full bg-indigo-900/50 text-indigo-300 border border-indigo-800/50">
                      {MODE_LABELS[mode] ?? mode}
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-auto">
                {/* Progress bar (0% — Phase 4 will calculate real progress) */}
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>0 / {skill.totalHoursEstimated}h</span>
                  <span>0%</span>
                </div>
                <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden mb-3">
                  <div className="h-full bg-indigo-500 rounded-full w-0" />
                </div>

                <p className="text-xs text-gray-500">
                  Deadline: <span className="text-gray-400">{formatDeadline(skill.deadline)}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <SkillModal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditingSkill(null) }}
        onSave={handleSave}
        initialData={editingSkill ? {
          name: editingSkill.name,
          description: editingSkill.description ?? '',
          totalHoursEstimated: editingSkill.totalHoursEstimated,
          learningModes: editingSkill.learningModes,
          specificGoal: editingSkill.specificGoal ?? '',
          deadline: editingSkill.deadline ? editingSkill.deadline.slice(0, 10) : '',
          resources: editingSkill.resources ?? '',
        } : undefined}
        title={editingSkill ? 'Edit Skill' : 'Add Skill'}
      />
    </div>
  )
}
