import { NextApiRequest, NextApiResponse } from 'next'
import { getToken } from 'next-auth/jwt'
import { authOptions } from '../../lib/auth/config'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const info: any = {
    timestamp: new Date().toISOString(),
    config: {
      hasSecret: !!authOptions.secret,
      secretLength: authOptions.secret?.length || 0,
      nextAuthUrl: process.env.NEXTAUTH_URL || 'NOT SET',
    },
    request: {
      hasCookies: !!req.headers.cookie,
      cookieCount: req.headers.cookie ? req.headers.cookie.split(';').length : 0,
      cookieNames: req.headers.cookie 
        ? req.headers.cookie.split(';').map(c => c.split('=')[0].trim())
        : [],
    },
    token: null,
    error: null,
  }

  try {
    // Try to get token
    const token = await getToken({ 
      req,
      secret: authOptions.secret 
    })
    
    info.token = token ? {
      found: true,
      hasId: !!token.id,
      hasEmail: !!token.email,
      id: token.id,
      email: token.email,
      exp: token.exp,
      iat: token.iat,
    } : {
      found: false,
    }
  } catch (error: any) {
    info.error = {
      message: error.message,
      stack: error.stack,
    }
  }

  console.log('[Check Auth] Full info:', JSON.stringify(info, null, 2))
  
  return res.status(200).json(info)
}

