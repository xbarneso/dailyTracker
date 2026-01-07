import { NextApiRequest, NextApiResponse } from 'next'
import { getDb } from '../../lib/db/mongodb'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const db = await getDb()
    const users = db.collection('users')
    
    const user = await users.findOne({ email: 'xbarnesortega@gmail.com' })
    
    if (user) {
      return res.json({ 
        exists: true,
        email: user.email,
        created_at: user.created_at,
        message: 'Usuario encontrado (no se muestra la contraseña por seguridad)'
      })
    } else {
      return res.json({ 
        exists: false,
        message: 'Usuario no encontrado en la base de datos'
      })
    }
  } catch (error: any) {
    console.error('Error:', error)
    return res.status(500).json({ 
      error: error.message || 'Error conectando a la base de datos',
      details: error.toString()
    })
  }
}

