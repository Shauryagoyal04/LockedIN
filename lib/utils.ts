export function getDayNumber(startDate?: string | null, totalDays?: number | null): number {
  const start = new Date(startDate ?? '2025-05-25')
  const days = totalDays ?? 30
  const today = new Date()
  const diff = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  return Math.max(1, Math.min(diff + 1, days))
}

export function getDaysRemaining(startDate?: string | null, totalDays?: number | null): number {
  const start = new Date(startDate ?? '2025-05-25')
  const days = totalDays ?? 30
  const end = new Date(start)
  end.setDate(start.getDate() + days)
  const today = new Date()
  const diff = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  return Math.max(0, diff)
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
