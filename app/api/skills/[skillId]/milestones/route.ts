import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: { skillId: string } }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = parseInt(session.user.id)
  const skillId = parseInt(params.skillId)

  const skill = await prisma.skillPlan.findFirst({ where: { id: skillId, userId } })
  if (!skill) {
    return NextResponse.json({ error: 'Skill not found' }, { status: 404 })
  }

  const milestones = await prisma.skillMilestone.findMany({
    where: { skillId },
    orderBy: { id: 'asc' },
  })

  return NextResponse.json(milestones)
}

export async function POST(
  req: NextRequest,
  { params }: { params: { skillId: string } }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = parseInt(session.user.id)
  const skillId = parseInt(params.skillId)

  const skill = await prisma.skillPlan.findFirst({ where: { id: skillId, userId } })
  if (!skill) {
    return NextResponse.json({ error: 'Skill not found' }, { status: 404 })
  }

  const { title } = await req.json()
  if (!title) {
    return NextResponse.json({ error: 'Title is required' }, { status: 400 })
  }

  const milestone = await prisma.skillMilestone.create({
    data: { skillId, title },
  })

  return NextResponse.json(milestone, { status: 201 })
}
