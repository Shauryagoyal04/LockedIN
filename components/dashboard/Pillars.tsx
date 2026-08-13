'use client'

import type { PillarsData } from '@/types/dashboard'
import PillarCard from './PillarCard'
import Sparkline from './Sparkline'

interface PillarsProps {
  data: PillarsData
}

export default function Pillars({ data }: PillarsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <DSAPillar data={data.dsa} />
      <GymPillar data={data.gym} />
      <SkillsPillar data={data.skills} />
    </div>
  )
}

function DSAPillar({ data }: { data: PillarsData['dsa'] }) {
  return (
    <PillarCard
      title="DSA"
      sub={`${data.todaySolved} / ${data.target} today`}
      href="/dsa"
      footer={
        data.behindBy > 0 ? (
          <p className="text-[11px] text-brand-500">
            {data.behindBy} problem{data.behindBy > 1 ? 's' : ''} remain to hit daily target.
          </p>
        ) : (
          <p className="text-[11px] text-green-400">Target hit — bank a few more for tomorrow.</p>
        )
      }
    >
      {data.platforms.map(p => {
        const up = p.delta > 0
        const down = p.delta < 0
        return (
          <div
            key={p.short}
            className="grid grid-cols-[1fr_auto_auto] gap-3 border-b border-dashed border-gray-800 py-2 text-xs last:border-0"
          >
            <span className="text-gray-300">{p.name}</span>
            <span className="font-mono text-gray-500">{p.total}</span>
            <span
              className={`min-w-[34px] text-right font-mono ${
                up ? 'text-green-400' : down ? 'text-red-500' : 'text-gray-500'
              }`}
            >
              {up ? '↑' : down ? '↓' : '·'} {p.delta ? Math.abs(p.delta) : ''}
            </span>
          </div>
        )
      })}
    </PillarCard>
  )
}

function GymPillar({ data }: { data: PillarsData['gym'] }) {
  return (
    <PillarCard
      title="Gym"
      sub={`${data.weightKg} kg · ${data.deltaPerWeek}`}
      href="/gym"
    >
      <div className="mb-2">
        <Sparkline data={data.spark7} width={260} height={44} />
      </div>
      {data.volume.map(v => {
        const pct = Math.min(100, (v.sets / v.target) * 100)
        const done = v.sets >= v.target
        return (
          <div key={v.group} className="grid grid-cols-[70px_1fr_44px] items-center gap-3 py-1 text-xs">
            <span className="text-gray-300">{v.group}</span>
            <div className="h-[3px] overflow-hidden rounded-full bg-gray-800">
              <div
                className={`h-full ${done ? 'bg-green-400' : 'bg-brand-500'}`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-right font-mono text-[11px] text-gray-500">
              {v.sets}/{v.target}
            </span>
          </div>
        )
      })}
    </PillarCard>
  )
}

function SkillsPillar({ data }: { data: PillarsData['skills'] }) {
  return (
    <PillarCard
      title="Skills"
      sub={`${data.totalHours}h / ${data.goalHours}h logged`}
      href="/skills"
    >
      {data.list.map(s => {
        const pct = Math.min(100, (s.hoursDone / s.hoursGoal) * 100)
        const behind = s.pace < -0.5
        return (
          <div key={s.id} className="border-b border-dashed border-gray-800 py-2.5 last:border-0">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-gray-300">{s.name}</span>
              <span
                className={`font-mono ${behind ? 'text-brand-500' : 'text-gray-500'}`}
              >
                {behind ? 'BEHIND' : 'ON PACE'}
              </span>
            </div>
            <div className="mt-1.5 h-[3px] overflow-hidden rounded-full bg-gray-800">
              <div
                className={`h-full ${behind ? 'bg-brand-500' : 'bg-gray-400'}`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.1em] text-gray-500">
              {s.hoursDone}/{s.hoursGoal}H · Due {s.deadline}
            </p>
          </div>
        )
      })}
    </PillarCard>
  )
}
