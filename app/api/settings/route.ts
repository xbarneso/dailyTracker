import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth/config'
import { getSettings, updateSettings } from '@/lib/db/settings'
import { z } from 'zod'

const settingsSchema = z.object({
  email_notifications_enabled: z.boolean().optional(),
  notification_time: z.string().optional(), // HH:MM format
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const settings = await getSettings(session.user.id)
    return NextResponse.json({ settings })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = settingsSchema.parse(body)

    const settings = await updateSettings(session.user.id, {
      email_notifications_enabled: validatedData.email_notifications_enabled,
      notification_time: validatedData.notification_time,
    })

    return NextResponse.json({ settings })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
