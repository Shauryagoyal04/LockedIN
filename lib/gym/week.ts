export function startOfIsoWeekUTC(d: Date): Date {
  const date = new Date(d)
  date.setUTCHours(0, 0, 0, 0)
  const day = date.getUTCDay() // 0=Sun..6=Sat
  const diff = day === 0 ? -6 : 1 - day // shift to Monday
  date.setUTCDate(date.getUTCDate() + diff)
  return date
}

export function endOfIsoWeekUTC(d: Date): Date {
  const end = startOfIsoWeekUTC(d)
  end.setUTCDate(end.getUTCDate() + 7)
  return end
}

export function isoDateUTC(d: Date): string {
  return d.toISOString().slice(0, 10)
}

export function weekKey(d: Date): string {
  return isoDateUTC(startOfIsoWeekUTC(d))
}
