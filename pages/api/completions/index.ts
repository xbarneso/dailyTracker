import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../lib/auth/config'
import { getCompletions, createCompletion } from '../../../lib/db/completions'
import { z } from 'zod'
import { getTodayDate } from '../../../lib/utils'

const completionSchema = z.object({
  habit_id: z.string(),
  date: z.string().optional(),
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  
  if (!session?.user?.id) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (req.method === 'GET') {
    try {
      const habitId = req.query.habit_id as string | undefined
      const startDate = req.query.start_date as string | undefined
      const endDate = req.query.end_date as string | undefined

      const completions = await getCompletions({
        userId: session.user.id,
        habitId,
        startDate,
        endDate,
      })

      return res.json({ completions })
    } catch (error: any) {
      return res.status(500).json({ error: error.message || 'Internal server error' })
    }
  }

  if (req.method === 'POST') {
    try {
      const validatedData = completionSchema.parse(req.body)
      const date = validatedData.date || getTodayDate()

      try {
        const completion = await createCompletion({
          habit_id: validatedData.habit_id,
          user_id: session.user.id,
          date,
        })
        return res.status(201).json({ completion })
      } catch (error: any) {
        if (error.message === 'Already completed') {
          return res.status(400).json({ error: 'Already completed' })
        }
        throw error
      }
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors })
      }
      return res.status(500).json({ error: error.message || 'Internal server error' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}

