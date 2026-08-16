import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getPersonalRecords } from '@/lib/gym/prs'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const userId = parseInt(session.user.id)

  const records = await getPersonalRecords(userId)
  return NextResponse.json({ records })
}
