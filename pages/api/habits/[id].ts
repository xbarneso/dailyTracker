import { NextApiRequest, NextApiResponse } from 'next'
import { getToken } from 'next-auth/jwt'
import { authOptions } from '../../../lib/auth/config'
import { getHabitById, updateHabit, deleteHabit } from '../../../lib/db/habits'
import { z } from 'zod'

const habitUpdateSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  frequency: z.enum(['daily', 'weekly', 'monthly', 'once']).optional(),
  target_days: z.number().int().positive().optional(),
  selected_days: z.array(z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'])).optional(),
  all_day: z.boolean().optional(),
  start_time: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  end_time: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  icon: z.string().optional(),
  category: z.enum(['desarrollo_personal', 'deporte', 'salud']).optional(),
  notifications_enabled: z.boolean().optional(),
  reminder_time: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/).optional(),
})

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
    }
  }
  
  if (!userId && userEmail) {
    try {
      const { getUserByEmail } = await import('../../../lib/auth/mongodb')
      const dbUser = await getUserByEmail(userEmail)
      if (dbUser) {
        userId = dbUser.id
      }
    } catch (err) {
      console.error('[habits/[id]] Error getting user by email:', err)
    }
  }
  
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const { id } = req.query

  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid habit ID' })
  }

  if (req.method === 'GET') {
    try {
      const habit = await getHabitById(id, userId)
      if (!habit) {
        return res.status(404).json({ error: 'Habit not found' })
      }
      return res.json({ habit })
    } catch (error: any) {
      return res.status(500).json({ error: error.message || 'Internal server error' })
    }
  }

  if (req.method === 'PUT') {
    try {
      const validatedData = habitUpdateSchema.parse(req.body)
      const habit = await updateHabit(id, userId, validatedData)
      if (!habit) {
        return res.status(404).json({ error: 'Habit not found' })
      }
      return res.json({ habit })
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors })
      }
      return res.status(500).json({ error: error.message || 'Internal server error' })
    }
  }

  if (req.method === 'DELETE') {
    try {
      const deleted = await deleteHabit(id, userId)
      if (!deleted) {
        return res.status(404).json({ error: 'Habit not found' })
      }
      return res.json({ success: true })
    } catch (error: any) {
      return res.status(500).json({ error: error.message || 'Internal server error' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}

