import { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { authOptions } from './config'

export async function getSessionFromRequest(request: NextRequest) {
  try {
    const cookieHeader = request.headers.get('cookie') || ''
    console.log('[getSessionFromRequest] Cookie header present:', !!cookieHeader)
    
    if (!cookieHeader) {
      console.log('[getSessionFromRequest] No cookies found')
      return null
    }
    
    // Extract the session token cookie name
    const sessionCookieName = process.env.NODE_ENV === 'production' 
      ? '__Secure-next-auth.session-token' 
      : 'next-auth.session-token'
    
    // Check if session cookie exists
    const hasSessionCookie = cookieHeader.includes(sessionCookieName)
    console.log('[getSessionFromRequest] Session cookie found:', hasSessionCookie)
    
    // Convert NextRequest to a format that getToken can use
    // getToken expects a request object with headers.cookie
    const req: any = {
      headers: {
        cookie: cookieHeader,
      },
      url: request.url,
    }
    
    console.log('[getSessionFromRequest] Calling getToken with secret:', !!authOptions.secret)
    const token = await getToken({ 
      req,
      secret: authOptions.secret 
    })
    
    console.log('[getSessionFromRequest] Token result:', token ? `found (id: ${token.id}, email: ${token.email})` : 'not found')
    
    if (!token || !token.id) {
      console.log('[getSessionFromRequest] No valid token or missing id')
      return null
    }
    
    return {
      user: {
        id: token.id as string,
        email: token.email as string,
      },
      expires: token.exp ? new Date(token.exp * 1000).toISOString() : new Date().toISOString(),
    }
  } catch (error: any) {
    console.error('[getSessionFromRequest] Error getting session from request:', error)
    console.error('[getSessionFromRequest] Error message:', error?.message)
    console.error('[getSessionFromRequest] Error stack:', error?.stack)
    return null
  }
}

