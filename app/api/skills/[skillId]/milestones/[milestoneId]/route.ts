import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { skillId: string; milestoneId: string } }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = parseInt(session.user.id)
  const skillId = parseInt(params.skillId)
  const milestoneId = parseInt(params.milestoneId)

  const skill = await prisma.skillPlan.findFirst({ where: { id: skillId, userId } })
  if (!skill) {
    return NextResponse.json({ error: 'Skill not found' }, { status: 404 })
  }

  const milestone = await prisma.skillMilestone.findFirst({
    where: { id: milestoneId, skillId },
  })
  if (!milestone) {
    return NextResponse.json({ error: 'Milestone not found' }, { status: 404 })
  }

  await prisma.skillMilestone.delete({ where: { id: milestoneId } })

  return NextResponse.json({ success: true })
}
