import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { generateWeeklyRecap, RateLimitError } from '@/lib/gym/recap'
import { startOfIsoWeekUTC } from '@/lib/gym/week'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const userId = parseInt(session.user.id)

  const { searchParams } = new URL(req.url)
  const weekParam = searchParams.get('weekStart')
  const lastWeek = new Date()
  lastWeek.setUTCDate(lastWeek.getUTCDate() - 7)
  const weekStart = weekParam ? new Date(weekParam) : startOfIsoWeekUTC(lastWeek)

  const { recap, cached } = await generateWeeklyRecap(userId, weekStart, false)
  return NextResponse.json({ recap, cached })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const userId = parseInt(session.user.id)

  const body = await req.json().catch(() => null)
  const weekStartStr: string | undefined = body?.weekStart
  if (!weekStartStr) {
    return NextResponse.json({ error: 'Missing weekStart' }, { status: 400 })
  }
  const weekStart = startOfIsoWeekUTC(new Date(weekStartStr))

  try {
    const { recap, cached } = await generateWeeklyRecap(userId, weekStart, true)
    return NextResponse.json({ recap, cached })
  } catch (e) {
    if (e instanceof RateLimitError) {
      return NextResponse.json({ error: e.message }, { status: 429 })
    }
    return NextResponse.json({ error: 'Failed to regenerate recap' }, { status: 500 })
  }
}

