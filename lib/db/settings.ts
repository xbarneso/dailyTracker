import { getDb } from './mongodb'

export interface UserSettings {
  user_id: string
  email_notifications_enabled: boolean
  notification_time?: string
  created_at?: Date
  updated_at?: Date
}

export async function getSettings(userId: string) {
  const db = await getDb()
  const settings = db.collection<UserSettings>('user_settings')
  const result = await settings.findOne({ user_id: userId })
  
  if (!result) {
    // Return defaults
    return {
      user_id: userId,
      email_notifications_enabled: true,
      notification_time: '09:00:00',
    }
  }
  
  return result
}

export async function updateSettings(userId: string, updates: Partial<UserSettings>) {
  const db = await getDb()
  const settings = db.collection<UserSettings>('user_settings')
  
  const result = await settings.findOneAndUpdate(
    { user_id: userId },
    { 
      $set: { 
        ...updates,
        updated_at: new Date(),
      },
      $setOnInsert: {
        user_id: userId,
        created_at: new Date(),
      }
    },
    { upsert: true, returnDocument: 'after' }
  )
  
  return result.value
}

