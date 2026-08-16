import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getDsaActivity } from '@/lib/dsa/activity'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const userId = parseInt(session.user.id)

  const { searchParams } = new URL(req.url)
  const weeks = parseInt(searchParams.get('weeks') ?? '26') || 26

  const days = await getDsaActivity(userId, weeks)
  return NextResponse.json({ days })
}
