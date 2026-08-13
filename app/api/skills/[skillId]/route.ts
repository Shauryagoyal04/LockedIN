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

  const skill = await prisma.skillPlan.findFirst({
    where: { id: skillId, userId },
    include: { milestones: true },
  })

  if (!skill) {
    return NextResponse.json({ error: 'Skill not found' }, { status: 404 })
  }

  return NextResponse.json(skill)
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { skillId: string } }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = parseInt(session.user.id)
  const skillId = parseInt(params.skillId)

  const existing = await prisma.skillPlan.findFirst({ where: { id: skillId, userId } })
  if (!existing) {
    return NextResponse.json({ error: 'Skill not found' }, { status: 404 })
  }

  const body = await req.json()
  const { name, description, totalHoursEstimated, learningModes, specificGoal, deadline, resources } = body

  const skill = await prisma.skillPlan.update({
    where: { id: skillId },
    data: {
      name: name ?? existing.name,
      description: description ?? existing.description,
      totalHoursEstimated: totalHoursEstimated ? parseInt(totalHoursEstimated) : existing.totalHoursEstimated,
      learningModes: learningModes ?? existing.learningModes,
      specificGoal: specificGoal ?? existing.specificGoal,
      deadline: deadline ? new Date(deadline) : existing.deadline,
      resources: resources ?? existing.resources,
    },
    include: { milestones: true },
  })

  return NextResponse.json(skill)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { skillId: string } }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = parseInt(session.user.id)
  const skillId = parseInt(params.skillId)

  const existing = await prisma.skillPlan.findFirst({ where: { id: skillId, userId } })
  if (!existing) {
    return NextResponse.json({ error: 'Skill not found' }, { status: 404 })
  }

  await prisma.skillPlan.update({
    where: { id: skillId },
    data: { isActive: false },
  })

  return NextResponse.json({ success: true })
}
