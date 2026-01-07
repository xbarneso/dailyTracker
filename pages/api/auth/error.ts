import { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { error } = req.query
    
    console.log('=== NextAuth Error Page ===')
    console.log('Error code:', error)
    console.log('Request method:', req.method)
    console.log('Request query:', JSON.stringify(req.query))
    console.log('Request body:', JSON.stringify(req.body))
    console.log('Request headers:', JSON.stringify(req.headers))
    console.log('==========================')
    
    // Return a simple error response instead of trying to render
    return res.status(200).json({
      error: error || 'Unknown error',
      message: 'Authentication error occurred',
      details: {
        errorCode: error,
        method: req.method,
        query: req.query,
      }
    })
  } catch (err: any) {
    console.error('Error in error handler:', err)
    return res.status(500).json({
      error: 'Error handler failed',
      message: err.message
    })
  }
}

