'use client'

interface ScoreRingProps {
  score: number
  max?: number
  size?: number
  stroke?: number
  /** Pass a tailwind text-* color via className or override stroke directly. */
  color?: string
  trackColor?: string
}

/** A circular progress ring. Inner number is rendered by parent so the
 *  font matches surrounding type. */
export default function ScoreRing({
  score,
  max = 100,
  size = 140,
  stroke = 10,
  color = '#ff5b1f',
  trackColor = '#241612',
}: ScoreRingProps) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const pct = Math.max(0, Math.min(1, score / max))
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={trackColor} strokeWidth={stroke} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeDasharray={c}
        strokeDashoffset={c * (1 - pct)}
        strokeLinecap="round"
        className="transition-[stroke-dashoffset] duration-500"
      />
    </svg>
  )
}
