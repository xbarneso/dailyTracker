import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../../lib/auth/config'
import { getHabitById, updateHabit, deleteHabit } from '../../../../lib/db/habits'
import { z } from 'zod'

const habitUpdateSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  frequency: z.enum(['daily', 'weekly', 'monthly']).optional(),
  target_days: z.number().int().positive().optional(),
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  
  if (!session?.user?.id) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const { id } = req.query

  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid habit ID' })
  }

  if (req.method === 'GET') {
    try {
      const habit = await getHabitById(id, session.user.id)
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
      const habit = await updateHabit(id, session.user.id, validatedData)
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
      const deleted = await deleteHabit(id, session.user.id)
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

