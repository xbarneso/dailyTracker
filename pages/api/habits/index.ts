import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../lib/auth/config'
import { getHabits, createHabit } from '../../../lib/db/habits'
import { z } from 'zod'

const habitSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  frequency: z.enum(['daily', 'weekly', 'monthly']),
  target_days: z.number().int().positive().optional(),
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  
  if (!session?.user?.id) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (req.method === 'GET') {
    try {
      const habits = await getHabits(session.user.id)
      return res.json({ habits })
    } catch (error: any) {
      return res.status(500).json({ error: error.message || 'Internal server error' })
    }
  }

  if (req.method === 'POST') {
    try {
      const validatedData = habitSchema.parse(req.body)
      const habit = await createHabit({
        user_id: session.user.id,
        ...validatedData,
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

