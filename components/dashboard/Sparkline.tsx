'use client'

interface SparklineProps {
  data: number[]
  width?: number
  height?: number
  color?: string
  fill?: boolean
}

export default function Sparkline({
  data,
  width = 260,
  height = 44,
  color = '#ff5b1f',
  fill = true,
}: SparklineProps) {
  if (!data.length) return null
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const points = data.map((v, i) => [
    (i / (data.length - 1)) * width,
    height - ((v - min) / range) * height,
  ])
  const path = 'M' + points.map(p => p.join(',')).join(' L')
  const area = `${path} L${width},${height} L0,${height} Z`
  return (
    <svg width={width} height={height} className="block">
      {fill && <path d={area} fill={color} opacity={0.15} />}
      <path d={path} fill="none" stroke={color} strokeWidth={1.5} />
    </svg>
  )
}
