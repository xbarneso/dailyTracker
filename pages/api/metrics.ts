import { NextApiRequest, NextApiResponse } from 'next'
import { getToken } from 'next-auth/jwt'
import { authOptions } from '../../lib/auth/config'
import { getHabits } from '../../lib/db/habits'
import { getCompletions } from '../../lib/db/completions'
import { getTodayDate, getDateRange } from '../../lib/utils'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = await getToken({ 
    req,
    secret: authOptions.secret 
  })
  
  // If token doesn't have id, get user ID from email by querying database
  let userId = token?.id as string | undefined
  let userEmail = token?.email as string | undefined
  
  // Fallback: get email from cookie if token doesn't have it
  if (!userEmail && req.headers.cookie) {
    const emailMatch = req.headers.cookie.match(/next-auth\.user-email=([^;]+)/)
    if (emailMatch) {
      userEmail = decodeURIComponent(emailMatch[1])
      console.log('[metrics] Got email from cookie:', userEmail)
    }
  }
  
  if (!userId && userEmail) {
    // Fallback: get user ID from email
    try {
      console.log('[metrics] Looking up user by email:', userEmail)
      const { getUserByEmail } = await import('../../lib/auth/mongodb')
      const dbUser = await getUserByEmail(userEmail)
      if (dbUser) {
        userId = dbUser.id
        console.log('[metrics] Found user ID:', userId)
      }
    } catch (err) {
      console.error('[metrics] Error getting user by email:', err)
    }
  }
  
  if (!userId) {
    console.log('[metrics] Unauthorized - no userId found')
    return res.status(401).json({ error: 'Unauthorized' })
  }
  
  console.log('[metrics] Authorized with userId:', userId)

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const today = getTodayDate()

    // Get all habits
    const habits = await getHabits(userId)

    // Get all completions
    const allCompletions = await getCompletions({ userId })

    // Calculate metrics
    const totalHabits = habits.length
    const completedToday = allCompletions.filter(c => c.date === today).length
    
    // Calculate completion rate (last 30 days)
    const last30Days = getDateRange(30)
    const dailyHabits = habits.filter(h => h.frequency === 'daily')
    const expectedCompletions = dailyHabits.length * 30
    const actualCompletions = allCompletions.filter(c => 
      last30Days.includes(c.date) && 
      dailyHabits.some(h => h.id === c.habit_id)
    ).length
    const completionRate = expectedCompletions > 0 
      ? (actualCompletions / expectedCompletions) * 100 
      : 0

    // Calculate streaks
    const habitStreaks = habits.map(habit => {
      const habitCompletions = allCompletions
        .filter(c => c.habit_id === habit.id)
        .map(c => c.date)
        .sort()
        .reverse()

      let streak = 0
      const todayDate = new Date(today)
      
      for (let i = 0; i < habitCompletions.length; i++) {
        const completionDate = new Date(habitCompletions[i])
        const expectedDate = new Date(todayDate)
        expectedDate.setDate(expectedDate.getDate() - i)
        
        if (completionDate.toISOString().split('T')[0] === expectedDate.toISOString().split('T')[0]) {
          streak++
        } else {
          break
        }
      }

      return { habit_id: habit.id, streak }
    })

    const currentStreak = Math.max(...habitStreaks.map(s => s.streak), 0)
    const longestStreak = currentStreak

    // Habits by frequency
    const habitsByFrequency = {
      daily: habits.filter(h => h.frequency === 'daily').length,
      once: habits.filter(h => h.frequency === 'once').length,
      weekly: habits.filter(h => h.frequency === 'weekly').length,
      monthly: habits.filter(h => h.frequency === 'monthly').length,
    }

    return res.json({
      metrics: {
        total_habits: totalHabits,
        completed_today: completedToday,
        completion_rate: Math.round(completionRate * 100) / 100,
        current_streak: currentStreak,
        longest_streak: longestStreak,
        habits_by_frequency: habitsByFrequency,
      },
      habit_streaks: habitStreaks,
    })
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Internal server error' })
  }
}

