import db from '@/lib/db/sqlite'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'

export async function createUser(email: string, password: string) {
  const id = uuidv4()
  const passwordHash = await bcrypt.hash(password, 10)
  
  try {
    db.prepare(`
      INSERT INTO users (id, email, password_hash)
      VALUES (?, ?, ?)
    `).run(id, email, passwordHash)
    
    return { id, email }
  } catch (error: any) {
    if (error.message.includes('UNIQUE constraint')) {
      throw new Error('Email already exists')
    }
    throw error
  }
}

export async function verifyUser(email: string, password: string) {
  const user = db.prepare(`
    SELECT id, email, password_hash FROM users WHERE email = ?
  `).get(email) as { id: string; email: string; password_hash: string } | undefined

  if (!user) {
    return null
  }

  const isValid = await bcrypt.compare(password, user.password_hash)
  if (!isValid) {
    return null
  }

  return { id: user.id, email: user.email }
}

