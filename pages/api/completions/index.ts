import { NextApiRequest, NextApiResponse } from 'next'
import { getToken } from 'next-auth/jwt'
import { authOptions } from '../../../lib/auth/config'
import { getCompletions, createCompletion } from '../../../lib/db/completions'
import { z } from 'zod'
import { getTodayDate } from '../../../lib/utils'

const completionSchema = z.object({
  habit_id: z.string(),
  date: z.string().optional(),
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
      console.log('[completions] Got email from cookie:', userEmail)
    }
  }
  
  if (!userId && userEmail) {
    try {
      console.log('[completions] Looking up user by email:', userEmail)
      const { getUserByEmail } = await import('../../../lib/auth/mongodb')
      const dbUser = await getUserByEmail(userEmail)
      if (dbUser) {
        userId = dbUser.id
        console.log('[completions] Found user ID:', userId)
      }
    } catch (err) {
      console.error('[completions] Error getting user by email:', err)
    }
  }
  
  if (!userId) {
    console.log('[completions] Unauthorized - no userId found')
    return res.status(401).json({ error: 'Unauthorized' })
  }
  
  console.log('[completions] Authorized with userId:', userId)

  if (req.method === 'GET') {
    try {
      const habitId = req.query.habit_id as string | undefined
      const startDate = req.query.start_date as string | undefined
      const endDate = req.query.end_date as string | undefined

      const completions = await getCompletions({
        userId,
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
          user_id: userId,
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

