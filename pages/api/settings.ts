import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../lib/auth/config'
import { getSettings, updateSettings } from '../../lib/db/settings'
import { z } from 'zod'

const settingsSchema = z.object({
  email_notifications_enabled: z.boolean().optional(),
  notification_time: z.string().optional(),
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  
  if (!session?.user?.id) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (req.method === 'GET') {
    try {
      const settings = await getSettings(session.user.id)
      return res.json({ settings })
    } catch (error: any) {
      return res.status(500).json({ error: error.message || 'Internal server error' })
    }
  }

  if (req.method === 'PUT') {
    try {
      const validatedData = settingsSchema.parse(req.body)
      const settings = await updateSettings(session.user.id, {
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

