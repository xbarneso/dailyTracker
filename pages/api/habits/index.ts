import { NextApiRequest, NextApiResponse } from 'next'
import { getToken } from 'next-auth/jwt'
import { authOptions } from '../../../lib/auth/config'
import { getHabits, createHabit } from '../../../lib/db/habits'
import { z } from 'zod'

const habitSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  frequency: z.enum(['daily', 'weekly', 'monthly', 'once']),
  target_days: z.number().int().positive().optional(),
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
      console.log('[habits] Got email from cookie:', userEmail)
    }
  }
  
  if (!userId && userEmail) {
    try {
      console.log('[habits] Looking up user by email:', userEmail)
      const { getUserByEmail } = await import('../../../lib/auth/mongodb')
      const dbUser = await getUserByEmail(userEmail)
      if (dbUser) {
        userId = dbUser.id
        console.log('[habits] Found user ID:', userId)
      } else {
        console.log('[habits] User not found for email:', userEmail)
      }
    } catch (err) {
      console.error('[habits] Error getting user by email:', err)
    }
  }
  
  if (!userId) {
    console.log('[habits] Unauthorized - no userId found')
    return res.status(401).json({ error: 'Unauthorized' })
  }
  
  console.log('[habits] Authorized with userId:', userId)

  if (req.method === 'GET') {
    try {
      console.log('[habits] Getting habits for userId:', userId)
      const habits = await getHabits(userId)
      console.log('[habits] Found habits:', habits.length)
      return res.json({ habits })
    } catch (error: any) {
      console.error('[habits] Error getting habits:', error)
      return res.status(500).json({ error: error.message || 'Internal server error' })
    }
  }

  if (req.method === 'POST') {
    try {
      const validatedData = habitSchema.parse(req.body)
      const habit = await createHabit({
        user_id: userId,
        name: validatedData.name,
        frequency: validatedData.frequency,
        description: validatedData.description,
        target_days: validatedData.target_days,
        all_day: validatedData.all_day,
        start_time: validatedData.start_time,
        end_time: validatedData.end_time,
        icon: validatedData.icon,
        category: validatedData.category,
        notifications_enabled: validatedData.notifications_enabled,
        reminder_time: validatedData.reminder_time,
      })
      return res.status(201).json({ habit })
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors })
      }
      return res.status(500).json({ error: error.message || 'Internal server error' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}

