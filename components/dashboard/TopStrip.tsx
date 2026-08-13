'use client'

import Link from 'next/link'
import { UserCircle } from 'lucide-react'

interface TopStripProps {
  dayLabel: string
  dayNumber: number
  daysRemaining: number
  score?: number | null
  streak?: number
  pace?: number
  onQuickLog?: () => void
}

export default function TopStrip({ dayLabel, dayNumber, daysRemaining }: TopStripProps) {
  return (
    <div
      className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-800 px-4 py-5 md:px-8"
      style={{ background: 'linear-gradient(180deg, rgba(255,91,31,0.04), transparent)' }}
    >
      <div>
        <h1 className="text-xl font-extrabold tracking-tight text-white md:text-2xl">{dayLabel}</h1>
        <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.15em] text-gray-500">
          Day {String(dayNumber).padStart(2, '0')} · {daysRemaining} days left
        </p>
      </div>

      <Link
        href="/profile"
        className="flex items-center gap-2 rounded-full bg-gray-800 px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
      >
        <UserCircle size={20} />
        <span className="hidden sm:inline">Profile</span>
      </Link>
    </div>
  )
}
