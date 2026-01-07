import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendHabitReminderEmail } from '@/lib/resend'
import { getTodayDate } from '@/lib/utils'

export async function GET(request: NextRequest) {
  // Verify this is a cron request (Vercel Cron sends a specific header)
  // In production, require CRON_SECRET. In development, allow manual testing
  if (process.env.NODE_ENV === 'production') {
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  try {
    const supabase = createAdminClient()
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayDate = yesterday.toISOString().split('T')[0]

    // Get all users with email notifications enabled
    const { data: settings, error: settingsError } = await supabase
      .from('user_settings')
      .select('user_id, email_notifications_enabled, notification_time')
      .eq('email_notifications_enabled', true)

    if (settingsError) {
      console.error('Error fetching settings:', settingsError)
      return NextResponse.json({ error: settingsError.message }, { status: 500 })
    }

    if (!settings || settings.length === 0) {
      return NextResponse.json({ message: 'No users with notifications enabled' })
    }

    let emailsSent = 0
    let errors = 0

    // For each user, check their incomplete habits
    for (const setting of settings) {
      try {
        // Get user email
        const { data: userData, error: userError } = await supabase.auth.admin.getUserById(
          setting.user_id
        )

        if (userError || !userData?.user?.email) {
          console.error(`Error fetching user ${setting.user_id}:`, userError)
          errors++
          continue
        }

        // Get user's habits
        const { data: habits, error: habitsError } = await supabase
          .from('habits')
          .select('*')
          .eq('user_id', setting.user_id)

        if (habitsError || !habits || habits.length === 0) {
          continue
        }

        // Get completions for yesterday
        const { data: completions, error: completionsError } = await supabase
          .from('habit_completions')
          .select('habit_id')
          .eq('user_id', setting.user_id)
          .eq('date', yesterdayDate)

        if (completionsError) {
          console.error('Error fetching completions:', completionsError)
          continue
        }

        const completedHabitIds = new Set(completions?.map(c => c.habit_id) || [])

        // Find incomplete habits
        const incompleteHabits = habits.filter(habit => {
          // For daily habits, check if completed yesterday
          if (habit.frequency === 'daily') {
            return !completedHabitIds.has(habit.id)
          }
          // For weekly/monthly, we'd need more complex logic
          // For now, just check daily habits
          return false
        })

        // Send email for each incomplete habit
        for (const habit of incompleteHabits) {
          try {
            await sendHabitReminderEmail(
              userData.user.email!,
              habit.name,
              habit.frequency
            )
            emailsSent++
          } catch (emailError) {
            console.error(`Error sending email for habit ${habit.id}:`, emailError)
            errors++
          }
        }
      } catch (error) {
        console.error(`Error processing user ${setting.user_id}:`, error)
        errors++
      }
    }

    return NextResponse.json({
      message: 'Cron job completed',
      emailsSent,
      errors,
      date: yesterdayDate,
    })
  } catch (error) {
    console.error('Cron job error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

