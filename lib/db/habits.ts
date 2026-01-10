import { getDb } from './mongodb'
import { ObjectId } from 'mongodb'

export interface Habit {
  _id?: ObjectId
  id?: string
  user_id: string
  name: string
  description?: string
  frequency: 'daily' | 'weekly' | 'monthly' | 'once'
  target_days?: number
  all_day?: boolean
  start_time?: string // HH:MM format
  end_time?: string // HH:MM format
  icon?: string // Emoji icon
  category?: 'desarrollo_personal' | 'deporte' | 'salud'
  notifications_enabled?: boolean
  reminder_time?: string // HH:MM format
  created_at?: Date
  updated_at?: Date
}

export async function getHabits(userId: string) {
  const db = await getDb()
  const habits = db.collection<Habit>('habits')
  const results = await habits
    .find({ user_id: userId })
    .sort({ created_at: -1 })
    .toArray()
  
  return results.map((h: any) => ({
    ...h,
    id: h._id?.toString(),
    created_at: h.created_at?.toISOString(),
    updated_at: h.updated_at?.toISOString(),
  }))
}

export async function getHabitById(habitId: string, userId: string) {
  const db = await getDb()
  const habits = db.collection<Habit>('habits')
  const habit = await habits.findOne({ 
    _id: new ObjectId(habitId),
    user_id: userId 
  })
  
  if (!habit) return null
  
  return {
    ...habit,
    id: habit._id?.toString(),
    created_at: habit.created_at?.toISOString(),
    updated_at: habit.updated_at?.toISOString(),
  }
}

export async function createHabit(habit: Omit<Habit, '_id' | 'created_at' | 'updated_at'>) {
  const db = await getDb()
  const habits = db.collection<Habit>('habits')
  const now = new Date()
  
  const newHabit: Habit = {
    ...habit,
    created_at: now,
    updated_at: now,
  }
  
  const result = await habits.insertOne(newHabit)
  return {
    ...newHabit,
    id: result.insertedId.toString(),
    _id: result.insertedId,
  }
}

export async function updateHabit(habitId: string, userId: string, updates: Partial<Habit>) {
  const db = await getDb()
  const habits = db.collection<Habit>('habits')
  
  const result = await habits.findOneAndUpdate(
    { _id: new ObjectId(habitId), user_id: userId },
    { 
      $set: { 
        ...updates,
        updated_at: new Date(),
      }
    },
    { returnDocument: 'after' }
  )
  
  if (!result.value) return null
  
  return {
    ...result.value,
    id: result.value._id?.toString(),
    created_at: result.value.created_at?.toISOString(),
    updated_at: result.value.updated_at?.toISOString(),
  }
}

export async function deleteHabit(habitId: string, userId: string) {
  const db = await getDb()
  const habits = db.collection<Habit>('habits')
  
  const result = await habits.deleteOne({ 
    _id: new ObjectId(habitId),
    user_id: userId 
  })
  
  return result.deletedCount > 0
}

