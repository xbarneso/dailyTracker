import { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/client'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    console.log('[Test Session] Getting session...')
    // Use getSession from next-auth/react for Pages Router
    const session = await getSession({ req })
    console.log('[Test Session] Session result:', session ? 'found' : 'not found')
    return res.status(200).json({ session: session || null })
  } catch (error: any) {
    console.error('[Test Session] Error:', error)
    console.error('[Test Session] Error stack:', error.stack)
    return res.status(500).json({ 
      error: 'Failed to get session', 
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    })
  }
}

