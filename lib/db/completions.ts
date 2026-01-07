import { getDb } from './mongodb'
import { ObjectId } from 'mongodb'

export interface HabitCompletion {
  _id?: ObjectId
  id?: string
  habit_id: string
  user_id: string
  completed_at?: Date
  date: string // YYYY-MM-DD format
}

export async function getCompletions(filters: {
  userId: string
  habitId?: string
  startDate?: string
  endDate?: string
}) {
  const db = await getDb()
  const completions = db.collection<HabitCompletion>('habit_completions')
  
  const query: any = { user_id: filters.userId }
  if (filters.habitId) query.habit_id = filters.habitId
  if (filters.startDate) query.date = { $gte: filters.startDate }
  if (filters.endDate) {
    if (query.date) {
      query.date.$lte = filters.endDate
    } else {
      query.date = { $lte: filters.endDate }
    }
  }
  
  const results = await completions
    .find(query)
    .sort({ date: -1 })
    .toArray()
  
  return results.map(c => ({
    ...c,
    id: c._id?.toString(),
    completed_at: c.completed_at?.toISOString(),
  }))
}

export async function createCompletion(completion: Omit<HabitCompletion, '_id' | 'completed_at'>) {
  const db = await getDb()
  const completions = db.collection<HabitCompletion>('habit_completions')
  
  // Check if already exists
  const existing = await completions.findOne({
    habit_id: completion.habit_id,
    user_id: completion.user_id,
    date: completion.date,
  })
  
  if (existing) {
    throw new Error('Already completed')
  }
  
  const newCompletion: HabitCompletion = {
    ...completion,
    completed_at: new Date(),
  }
  
  const result = await completions.insertOne(newCompletion)
  return {
    ...newCompletion,
    id: result.insertedId.toString(),
    _id: result.insertedId,
  }
}

export async function deleteCompletion(completionId: string, userId: string) {
  const db = await getDb()
  const completions = db.collection<HabitCompletion>('habit_completions')
  
  const result = await completions.deleteOne({ 
    _id: new ObjectId(completionId),
    user_id: userId 
  })
  
  return result.deletedCount > 0
}

