import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../lib/auth/config'
import { getHabits } from '../../lib/db/habits'
import { getCompletions } from '../../lib/db/completions'
import { getTodayDate, getDateRange } from '../../lib/utils'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  
  if (!session?.user?.id) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const userId = session.user.id
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

