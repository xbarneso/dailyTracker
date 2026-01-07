import { NextApiRequest, NextApiResponse } from 'next'
import { verifyUser } from '../../lib/auth/mongodb'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    console.log('[Test] Attempting to verify user:', email)
    
    // Test MongoDB connection
    try {
      const { getDb } = await import('../../lib/db/mongodb')
      const db = await getDb()
      console.log('[Test] MongoDB connection OK')
    } catch (dbError: any) {
      console.error('[Test] MongoDB connection failed:', dbError)
      return res.status(500).json({ 
        error: 'MongoDB connection failed',
        message: dbError.message 
      })
    }

    // Test verifyUser
    const user = await verifyUser(email, password)
    console.log('[Test] User verification result:', user ? 'SUCCESS' : 'FAILED')

    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      })
    }

    return res.json({ 
      success: true,
      message: 'Credentials are valid',
      user: {
        id: user.id,
        email: user.email
      }
    })
  } catch (error: any) {
    console.error('[Test] Error:', error)
    return res.status(500).json({ 
      error: error.message || 'Unknown error',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    })
  }
}

