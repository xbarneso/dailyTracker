import { getDb } from '../db/mongodb'
import bcrypt from 'bcryptjs'
import { ObjectId } from 'mongodb'

export async function createUser(email: string, password: string) {
  const db = await getDb()
  const users = db.collection('users')
  
  // Check if user exists
  const existing = await users.findOne({ email })
  if (existing) {
    throw new Error('Email already exists')
  }
  
  const passwordHash = await bcrypt.hash(password, 10)
  const user = {
    _id: new ObjectId(),
    email,
    password_hash: passwordHash,
    created_at: new Date(),
  }
  
  await users.insertOne(user)
  
  return { id: user._id.toString(), email }
}

export async function verifyUser(email: string, password: string) {
  try {
    const db = await getDb()
    const users = db.collection('users')
    
    const user = await users.findOne({ email })
    if (!user) {
      console.log('User not found:', email)
      return null
    }

    if (!user.password_hash) {
      console.log('User has no password hash')
      return null
    }

    const isValid = await bcrypt.compare(password, user.password_hash)
    if (!isValid) {
      console.log('Invalid password for user:', email)
      return null
    }

    console.log('User verified successfully:', email)
    return { id: user._id.toString(), email: user.email }
  } catch (error: any) {
    console.error('Error verifying user:', error)
    console.error('Error type:', error.name)
    console.error('Error message:', error.message)
    
    // If it's a connection error, return null instead of throwing
    if (error.name === 'MongoServerSelectionError' || error.message?.includes('ECONNRESET')) {
      console.error('MongoDB connection error - returning null to prevent login')
      return null
    }
    
    throw error
  }
}

