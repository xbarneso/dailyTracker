import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth/config'
import { getCompletions, createCompletion } from '@/lib/db/completions'
import { z } from 'zod'
import { getTodayDate } from '@/lib/utils'

const completionSchema = z.object({
  habit_id: z.string(),
  date: z.string().optional(), // YYYY-MM-DD format
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const habitId = searchParams.get('habit_id')
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')

    const completions = await getCompletions({
      userId: session.user.id,
      habitId: habitId || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    })

    return NextResponse.json({ completions })
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
    const validatedData = completionSchema.parse(body)
    const date = validatedData.date || getTodayDate()

    try {
      const completion = await createCompletion({
        habit_id: validatedData.habit_id,
        user_id: session.user.id,
        date,
      })

      return NextResponse.json({ completion }, { status: 201 })
    } catch (error: any) {
      if (error.message === 'Already completed') {
        return NextResponse.json({ error: 'Already completed' }, { status: 400 })
      }
      throw error
    }
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
