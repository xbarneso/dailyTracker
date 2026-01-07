import Database from 'better-sqlite3'
import { join } from 'path'
import { existsSync, mkdirSync } from 'fs'

// Create data directory if it doesn't exist
const dataDir = join(process.cwd(), 'data')
if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true })
}

const dbPath = join(dataDir, 'habits.db')
const db = new Database(dbPath)

// Enable foreign keys
db.pragma('foreign_keys = ON')

// Initialize tables
export function initDatabase() {
  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Habits table
  db.exec(`
    CREATE TABLE IF NOT EXISTS habits (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly')),
      target_days INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `)

  // Habit completions table
  db.exec(`
    CREATE TABLE IF NOT EXISTS habit_completions (
      id TEXT PRIMARY KEY,
      habit_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      date TEXT NOT NULL,
      FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(habit_id, user_id, date)
    )
  `)

  // User settings table
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_settings (
      user_id TEXT PRIMARY KEY,
      email_notifications_enabled INTEGER DEFAULT 1,
      notification_time TEXT DEFAULT '09:00:00',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `)

  // Create indexes
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_habits_user_id ON habits(user_id);
    CREATE INDEX IF NOT EXISTS idx_habit_completions_habit_id ON habit_completions(habit_id);
    CREATE INDEX IF NOT EXISTS idx_habit_completions_user_id ON habit_completions(user_id);
    CREATE INDEX IF NOT EXISTS idx_habit_completions_date ON habit_completions(date);
  `)
}

// Initialize on import
initDatabase()

export default db

