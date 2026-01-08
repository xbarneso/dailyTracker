export type HabitFrequency = 'daily' | 'weekly' | 'monthly' | 'once';
export type HabitCategory = 'desarrollo_personal' | 'deporte' | 'salud';

export interface Habit {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  frequency: HabitFrequency;
  target_days?: number; // For weekly/monthly habits
  all_day?: boolean; // If true, habit can be done anytime during the day
  start_time?: string; // HH:MM format - start of time range
  end_time?: string; // HH:MM format - end of time range
  icon?: string; // Emoji icon for the habit
  category?: HabitCategory; // Category: desarrollo_personal, deporte, salud
  created_at?: string;
  updated_at?: string;
}

export interface HabitCompletion {
  id: string;
  habit_id: string;
  user_id: string;
  completed_at: string;
  date: string; // YYYY-MM-DD format
}

export interface UserSettings {
  user_id: string;
  email_notifications_enabled: boolean;
  notification_time?: string; // HH:MM format
  created_at?: string;
  updated_at?: string;
}

export interface HabitWithCompletion extends Habit {
  completed_today?: boolean;
  streak?: number;
  completion_rate?: number;
}

export interface Metrics {
  total_habits: number;
  completed_today: number;
  completion_rate: number;
  current_streak: number;
  longest_streak: number;
  habits_by_frequency: {
    daily: number;
    weekly: number;
    monthly: number;
  };
}

