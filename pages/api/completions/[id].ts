import { NextApiRequest, NextApiResponse } from 'next'
import { getToken } from 'next-auth/jwt'
import { authOptions } from '../../../../lib/auth/config'
import { deleteCompletion } from '../../../../lib/db/completions'

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
      const { getUserByEmail } = await import('../../../../lib/auth/mongodb')
      const dbUser = await getUserByEmail(userEmail)
      if (dbUser) {
        userId = dbUser.id
      }
    } catch (err) {
      console.error('[completions/[id]] Error getting user by email:', err)
    }
  }
  
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { id } = req.query

  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid completion ID' })
  }

  try {
    const deleted = await deleteCompletion(id, userId)
    if (!deleted) {
      return res.status(404).json({ error: 'Completion not found' })
    }
    return res.json({ success: true })
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Internal server error' })
  }
}

