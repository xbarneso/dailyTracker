import { NextApiRequest, NextApiResponse } from 'next'
import { getDb } from '../../lib/db/mongodb'
import bcrypt from 'bcryptjs'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    const db = await getDb()
    const users = db.collection('users')
    
    const user = await users.findOne({ email })
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Usuario no existe' 
      })
    }

    const isValid = await bcrypt.compare(password, user.password_hash)
    
    if (isValid) {
      return res.json({ 
        success: true, 
        message: 'Credenciales correctas',
        user: { id: user._id.toString(), email: user.email }
      })
    } else {
      return res.status(401).json({ 
        success: false, 
        message: 'Contraseña incorrecta' 
      })
    }
  } catch (error: any) {
    console.error('Error:', error)
    return res.status(500).json({ error: error.message || 'Error verificando credenciales' })
  }
}
