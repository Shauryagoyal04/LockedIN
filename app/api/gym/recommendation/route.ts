import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getTrainingRecommendation } from '@/lib/gym/recommendations'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const userId = parseInt(session.user.id)

  const recommendations = await getTrainingRecommendation(userId)
  return NextResponse.json({ recommendations })
}
