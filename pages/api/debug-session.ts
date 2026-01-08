import { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/client'
import { getToken } from 'next-auth/jwt'
import { authOptions } from '../../lib/auth/config'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const debugInfo: any = {
      timestamp: new Date().toISOString(),
      cookies: {
        present: !!req.headers.cookie,
        header: req.headers.cookie || 'none',
        preview: req.headers.cookie?.substring(0, 300) || 'none',
      },
      session: null,
      token: null,
      errors: [],
    }

    // Try getSession
    try {
      const session = await getSession({ req })
      debugInfo.session = session ? {
        found: true,
        userId: session.user?.id,
        userEmail: session.user?.email,
        expires: session.expires,
        full: session,
      } : {
        found: false,
      }
    } catch (error: any) {
      debugInfo.errors.push(`getSession error: ${error.message}`)
    }

    // Try getToken
    try {
      const token = await getToken({ 
        req,
        secret: authOptions.secret 
      })
      debugInfo.token = token ? {
        found: true,
        id: token.id,
        email: token.email,
        exp: token.exp,
        iat: token.iat,
        full: token,
      } : {
        found: false,
      }
    } catch (error: any) {
      debugInfo.errors.push(`getToken error: ${error.message}`)
    }

    // Check for session cookie
    if (req.headers.cookie) {
      const hasSessionCookie = req.headers.cookie.includes('next-auth.session-token')
      debugInfo.cookies.hasSessionCookie = hasSessionCookie
      
      if (hasSessionCookie) {
        const match = req.headers.cookie.match(/next-auth\.session-token=([^;]+)/)
        if (match) {
          debugInfo.cookies.sessionTokenPreview = match[1].substring(0, 50) + '...'
        }
      }
    }

    console.log('[Debug Session] Full debug info:', JSON.stringify(debugInfo, null, 2))

    return res.status(200).json(debugInfo)
  } catch (error: any) {
    console.error('[Debug Session] Error:', error)
    return res.status(500).json({ 
      error: 'Failed to debug session', 
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    })
  }
}

