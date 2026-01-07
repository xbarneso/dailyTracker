import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth/config'
import { getHabits, createHabit } from '@/lib/db/habits'
import { z } from 'zod'

const habitSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  frequency: z.enum(['daily', 'weekly', 'monthly']),
  target_days: z.number().int().positive().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const habits = await getHabits(session.user.id)
    return NextResponse.json({ habits })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = habitSchema.parse(body)

    const habit = await createHabit({
      user_id: session.user.id,
      ...validatedData,
    })

    return NextResponse.json({ habit }, { status: 201 })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
