import clsx, { ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { DayOfWeek } from "../types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().split('T')[0];
}

export function getTodayDate(): string {
  return formatDate(new Date());
}

export function getDateRange(days: number): string[] {
  const dates: string[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    dates.push(formatDate(date));
  }
  return dates;
}

// Convert JS day (0=Sunday) to our DayOfWeek type
export function getDayOfWeek(date: Date | string = new Date()): DayOfWeek {
  const d = typeof date === 'string' ? new Date(date) : date;
  const jsDay = d.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const dayMap: DayOfWeek[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return dayMap[jsDay];
}

// Check if a habit should be shown on a specific date
export function isHabitActiveOnDate(selectedDays: DayOfWeek[] | undefined, date: Date | string = new Date()): boolean {
  // If no days selected, assume all days
  if (!selectedDays || selectedDays.length === 0) {
    return true;
  }
  
  const dayOfWeek = getDayOfWeek(date);
  return selectedDays.includes(dayOfWeek);
}

// Get day label in Spanish
export function getDayLabel(day: DayOfWeek, short: boolean = false): string {
  const labels: Record<DayOfWeek, { full: string; short: string }> = {
    monday: { full: 'Lunes', short: 'L' },
    tuesday: { full: 'Martes', short: 'M' },
    wednesday: { full: 'Miércoles', short: 'X' },
    thursday: { full: 'Jueves', short: 'J' },
    friday: { full: 'Viernes', short: 'V' },
    saturday: { full: 'Sábado', short: 'S' },
    sunday: { full: 'Domingo', short: 'D' },
  };
  return short ? labels[day].short : labels[day].full;
}

