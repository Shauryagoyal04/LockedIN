'use client'

import { Zap } from 'lucide-react'

export default function CoachCard({ line }: { line: string | null }) {
  if (!line) return null
  return (
    <div className="flex gap-3.5 rounded-2xl border border-gray-800 bg-gray-900 p-5">
      <div className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-xl bg-brand-500/15">
        <Zap size={18} className="text-brand-500" />
      </div>
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-brand-500">Coach</p>
        <p className="mt-1.5 text-[13px] font-medium leading-relaxed text-gray-200">{line}</p>
      </div>
    </div>
  )
}
