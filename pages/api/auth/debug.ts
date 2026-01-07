import { NextApiRequest, NextApiResponse } from 'next'
import { verifyUser } from '../../../lib/auth/mongodb'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    console.log('Attempting to verify user:', email)
    const user = await verifyUser(email, password)
    console.log('Verification result:', user)

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    return res.json({ success: true, user })
  } catch (error: any) {
    console.error('Debug error:', error)
    return res.status(500).json({ 
      error: error.message || 'Unknown error',
      stack: error.stack 
    })
  }
}

