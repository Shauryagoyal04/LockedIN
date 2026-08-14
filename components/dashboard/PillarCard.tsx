'use client'

import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'

interface PillarCardProps {
  title: string
  /** "3 / 5 today" or "72.4 kg · +0.3kg/wk" etc */
  sub: string
  href: string
  children: React.ReactNode
  footer?: React.ReactNode
}

/** A Focused-style operator pillar card — the slim, dense column that
 *  holds platform rows / volume bars. Click to deep-dive. */
export default function PillarCard({ title, sub, href, children, footer }: PillarCardProps) {
  return (
    <Link
      href={href}
      className="group flex flex-col gap-3 rounded-xl border border-gray-800 bg-gray-900 p-5 transition-colors hover:border-gray-700"
    >
      <div className="flex items-baseline justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-white">{title}</h3>
          <ArrowUpRight
            size={14}
            className="text-gray-600 opacity-0 transition-opacity group-hover:opacity-100"
          />
        </div>
        <p className="font-mono text-[11px] text-gray-500">{sub}</p>
      </div>
      <div className="space-y-1">{children}</div>
      {footer}
    </Link>
  )
}
