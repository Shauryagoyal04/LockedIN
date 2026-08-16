import { prisma } from '@/lib/prisma'

export interface ActivityDay {
  date: string
  value: number
}

export async function getDsaActivity(userId: number, weeks: number): Promise<ActivityDay[]> {
  const since = new Date()
  since.setUTCDate(since.getUTCDate() - weeks * 7)
  since.setUTCHours(0, 0, 0, 0)

  const submissions = await prisma.dSASubmission.findMany({
    where: { userId, submittedAt: { gte: since } },
    select: { submittedAt: true },
  })

  const byDate = new Map<string, number>()
  for (const s of submissions) {
    const key = s.submittedAt.toISOString().slice(0, 10)
    byDate.set(key, (byDate.get(key) ?? 0) + 1)
  }

  return Array.from(byDate.entries()).map(([date, value]) => ({ date, value }))
}
