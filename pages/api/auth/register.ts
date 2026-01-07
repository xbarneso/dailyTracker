import { NextApiRequest, NextApiResponse } from 'next'
import { createUser } from '../../../lib/auth/mongodb'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' })
    }

    const user = await createUser(email, password)
    return res.status(201).json({ user })
  } catch (error: any) {
    return res.status(400).json({ error: error.message || 'Error creating user' })
  }
}

