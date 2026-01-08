import { NextApiRequest, NextApiResponse } from 'next'
import { getToken } from 'next-auth/jwt'
import { authOptions } from '../../lib/auth/config'
import { getSettings, updateSettings } from '../../lib/db/settings'
import { z } from 'zod'

const settingsSchema = z.object({
  email_notifications_enabled: z.boolean().optional(),
  notification_time: z.string().optional(),
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
      const { getUserByEmail } = await import('../../lib/auth/mongodb')
      const dbUser = await getUserByEmail(userEmail)
      if (dbUser) {
        userId = dbUser.id
      }
    } catch (err) {
      console.error('[settings] Error getting user by email:', err)
    }
  }
  
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (req.method === 'GET') {
    try {
      const settings = await getSettings(userId)
      return res.json({ settings })
    } catch (error: any) {
      return res.status(500).json({ error: error.message || 'Internal server error' })
    }
  }

  if (req.method === 'PUT') {
    try {
      const validatedData = settingsSchema.parse(req.body)
      const settings = await updateSettings(userId, {
        email_notifications_enabled: validatedData.email_notifications_enabled,
        notification_time: validatedData.notification_time,
      })
      return res.json({ settings })
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors })
      }
      return res.status(500).json({ error: error.message || 'Internal server error' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}

