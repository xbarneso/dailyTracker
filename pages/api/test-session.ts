import { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/client'
import { getToken } from 'next-auth/jwt'
import { authOptions } from '../../lib/auth/config'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    console.log('[Test Session] Getting session...')
    console.log('[Test Session] Cookies:', req.headers.cookie ? 'present' : 'missing')
    console.log('[Test Session] Cookie header:', req.headers.cookie?.substring(0, 200) || 'none')
    
    // Try both getSession and getToken
    const session = await getSession({ req })
    console.log('[Test Session] Session result:', session ? `found (id: ${session.user?.id}, email: ${session.user?.email})` : 'not found')
    
    const token = await getToken({ 
      req,
      secret: authOptions.secret 
    })
    console.log('[Test Session] Token result:', token ? `found (id: ${token.id}, email: ${token.email})` : 'not found')
    console.log('[Test Session] Full token object:', JSON.stringify(token, null, 2))
    
    return res.status(200).json({ 
      session: session || null,
      token: token || null,
      hasCookies: !!req.headers.cookie,
      cookiePreview: req.headers.cookie?.substring(0, 200) || 'none'
    })
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

