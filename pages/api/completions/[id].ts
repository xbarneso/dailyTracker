import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../../lib/auth/config'
import { deleteCompletion } from '../../../../lib/db/completions'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  
  if (!session?.user?.id) {
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
    const deleted = await deleteCompletion(id, session.user.id)
    if (!deleted) {
      return res.status(404).json({ error: 'Completion not found' })
    }
    return res.json({ success: true })
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Internal server error' })
  }
}

