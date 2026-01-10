import { useState } from 'react'
import { Habit } from '../../types'
import { getTodayDate, getDayLabel } from '../../lib/utils'

interface HabitCardProps {
  habit: Habit
  completed: boolean
  onToggleComplete: (habitId: string, completed: boolean) => void
  onEdit: (habit: Habit) => void
  onDelete: (habitId: string) => void
}

export default function HabitCard({
  habit,
  completed,
  onToggleComplete,
  onEdit,
  onDelete,
}: HabitCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const frequencyLabels = {
    daily: 'Diario',
    once: 'Sólo Hoy',
    weekly: 'Semanal',
    monthly: 'Mensual',
  }

  const categoryLabels = {
    desarrollo_personal: { label: 'Desarrollo Personal', icon: '📚', color: 'bg-purple-100 text-purple-700' },
    deporte: { label: 'Deporte', icon: '💪', color: 'bg-blue-100 text-blue-700' },
    salud: { label: 'Salud', icon: '❤️', color: 'bg-red-100 text-red-700' },
  }

  const handleDelete = async () => {
    if (confirm('¿Estás seguro de que quieres eliminar este hábito?')) {
      setIsDeleting(true)
      onDelete(habit.id)
    }
  }

  const category = habit.category ? categoryLabels[habit.category] : categoryLabels.desarrollo_personal
  const habitIcon = habit.icon || '🌱'

  return (
    <div
      className={`bg-white rounded-xl shadow-md p-4 sm:p-6 border-2 transition-all ${
        completed
          ? 'border-jungle-400 bg-jungle-50'
          : 'border-jungle-200 hover:border-jungle-300'
      } ${isDeleting ? 'opacity-50' : ''}`}
    >
      <div className="flex items-start justify-between mb-3 sm:mb-4">
        <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
          <span className="text-2xl sm:text-3xl flex-shrink-0">{habitIcon}</span>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg sm:text-xl font-semibold text-jungle-800 truncate">{habit.name}</h3>
            <div className="flex items-center space-x-1 sm:space-x-2 mt-1 flex-wrap gap-1 sm:gap-2">
              <span className={`text-xs sm:text-sm px-2 py-1 rounded ${category.color}`}>
                {category.icon} {category.label}
              </span>
              <span className="text-xs sm:text-sm text-jungle-600 bg-jungle-100 px-2 py-1 rounded">
                {frequencyLabels[habit.frequency]}
              </span>
              {habit.target_days && (
                <span className="text-xs sm:text-sm text-jungle-600">
                  {habit.target_days} días/{habit.frequency === 'weekly' ? 'semana' : 'mes'}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex space-x-1 sm:space-x-2 flex-shrink-0">
          <button
            onClick={() => onEdit(habit)}
            className="p-1.5 sm:p-2 text-jungle-600 hover:text-jungle-800 hover:bg-jungle-100 rounded-lg transition"
            title="Editar"
          >
            <span className="text-base sm:text-lg">✏️</span>
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-1.5 sm:p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
            title="Eliminar"
          >
            <span className="text-base sm:text-lg">🗑️</span>
          </button>
        </div>
      </div>

      {habit.description && (
        <p className="text-sm sm:text-base text-jungle-700 mb-3 sm:mb-4 line-clamp-2">{habit.description}</p>
      )}

      {/* Time info for mobile */}
      <div className="mb-3 sm:mb-4 flex flex-wrap gap-1 sm:gap-2">
        {habit.frequency === 'once' && (
          <span className="text-xs text-jungle-500 bg-yellow-50 px-2 py-1 rounded">
            Una vez
          </span>
        )}
        {!habit.all_day && habit.start_time && habit.end_time && (
          <span className="text-xs text-jungle-600 bg-blue-50 px-2 py-1 rounded">
            🕐 {habit.start_time} - {habit.end_time}
          </span>
        )}
        {habit.all_day && (habit.frequency === 'daily' || habit.frequency === 'once') && (
          <span className="text-xs text-jungle-600 bg-green-50 px-2 py-1 rounded">
            Todo el día
          </span>
        )}
        {/* Show selected days if not all days selected */}
        {habit.selected_days && habit.selected_days.length > 0 && habit.selected_days.length < 7 && (
          <span className="text-xs text-jungle-600 bg-jungle-50 px-2 py-1 rounded">
            📅 {habit.selected_days.map(day => getDayLabel(day, true)).join(', ')}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={() => onToggleComplete(habit.id, !completed)}
          className={`flex-1 py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg font-semibold text-sm sm:text-base transition ${
            completed
              ? 'bg-jungle-600 text-white hover:bg-jungle-700'
              : 'bg-jungle-100 text-jungle-700 hover:bg-jungle-200'
          }`}
        >
          {completed ? '✓ Completado' : 'Marcar como completado'}
        </button>
      </div>
    </div>
  )
}

