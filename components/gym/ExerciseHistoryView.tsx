'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { ExerciseHistory } from '@/lib/gym/exerciseHistory'

export default function ExerciseHistoryView({ history }: { history: ExerciseHistory }) {
  const [showOneRepMax, setShowOneRepMax] = useState(true)

  const bestWeight = Math.max(
    0,
    ...history.points.map((p) => p.maxWeightKg ?? 0)
  )
  const bestOneRepMax = Math.max(
    0,
    ...history.points.map((p) => p.estimatedOneRepMax ?? 0)
  )

  const chartData = history.points.map((p) => ({
    date: p.date,
    maxWeightKg: p.maxWeightKg,
    estimatedOneRepMax: p.estimatedOneRepMax,
  }))
  const singlePoint = chartData.length === 1

  return (
    <div className="max-w-2xl mx-auto">
      <Link
        href="/gym"
        className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors mb-4"
      >
        <ArrowLeft size={14} /> Back to Gym
      </Link>

      <h1 className="text-2xl font-bold text-white mb-4">{history.displayName}</h1>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
          <p className="text-xs text-gray-500 mb-1">Best Weight</p>
          <p className="text-xl font-bold text-white">{bestWeight > 0 ? `${bestWeight}kg` : '—'}</p>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
          <p className="text-xs text-gray-500 mb-1">Est. 1RM</p>
          <p className="text-xl font-bold text-white">{bestOneRepMax > 0 ? `${bestOneRepMax}kg` : '—'}</p>
        </div>
      </div>

      <div className="bg-gray-800 border border-gray-700 rounded-xl p-5 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-white">Progress</h2>
          <label className="flex items-center gap-1.5 text-xs text-gray-400">
            <input
              type="checkbox"
              checked={showOneRepMax}
              onChange={(e) => setShowOneRepMax(e.target.checked)}
              className="accent-indigo-500"
            />
            Show est. 1RM
          </label>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#6b7280" fontSize={11} />
              <YAxis stroke="#6b7280" fontSize={11} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: 8 }}
                labelStyle={{ color: '#e5e7eb' }}
                itemStyle={{ color: '#e5e7eb' }}
              />
              <Line
                type="monotone"
                dataKey="maxWeightKg"
                name="Max weight (kg)"
                stroke="#6366f1"
                strokeWidth={2}
                dot={singlePoint}
                connectNulls
              />
              {showOneRepMax && (
                <Line
                  type="monotone"
                  dataKey="estimatedOneRepMax"
                  name="Est. 1RM (kg)"
                  stroke="#a855f7"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={singlePoint}
                  connectNulls
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
        <h2 className="font-semibold text-white mb-3">Sessions</h2>
        <div className="space-y-2">
          {[...history.points].reverse().map((p, i) => (
            <div
              key={i}
              className="flex items-center justify-between text-sm pb-2 border-b border-gray-700 last:border-0 last:pb-0"
            >
              <span className="text-gray-400">{p.date}</span>
              <span className="text-gray-300">
                {p.totalSets} sets × {p.totalReps} reps
              </span>
              <span className="flex items-center gap-1.5 font-mono text-white">
                {p.maxWeightKg !== null ? `${p.maxWeightKg}kg` : 'bodyweight'}
                {p.isPr && <span className="text-yellow-400" title="New PR">🏆</span>}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
