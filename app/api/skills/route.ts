import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = parseInt(session.user.id)

  const skills = await prisma.skillPlan.findMany({
    where: { userId, isActive: true },
    include: { milestones: true },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(skills)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = parseInt(session.user.id)
  const body = await req.json()

  const { name, description, totalHoursEstimated, learningModes, specificGoal, deadline, resources } = body

  if (!name || !totalHoursEstimated) {
    return NextResponse.json({ error: 'Name and estimated hours are required' }, { status: 400 })
  }

  const skill = await prisma.skillPlan.create({
    data: {
      userId,
      name,
      description: description ?? null,
      totalHoursEstimated: parseInt(totalHoursEstimated),
      learningModes: learningModes ?? [],
      specificGoal: specificGoal ?? null,
      deadline: deadline ? new Date(deadline) : null,
      resources: resources ?? null,
    },
    include: { milestones: true },
  })

  return NextResponse.json(skill, { status: 201 })
}
