import { NextApiRequest, NextApiResponse } from 'next'
import { getToken } from 'next-auth/jwt'
import { authOptions } from '../../../lib/auth/config'

// This endpoint is called after successful login to store the user ID in a cookie
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { userId } = req.body
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' })
    }

    // Set a cookie with the user ID
    res.setHeader('Set-Cookie', `next-auth.user-id=${userId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000`) // 30 days
    
    return res.status(200).json({ success: true })
  } catch (error: any) {
    console.error('[Set User ID] Error:', error)
    return res.status(500).json({ error: error.message })
  }
}

