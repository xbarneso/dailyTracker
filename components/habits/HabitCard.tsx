import { useState } from 'react'
import { Habit } from '../../types'
import { getTodayDate } from '../../lib/utils'

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
    weekly: 'Semanal',
    monthly: 'Mensual',
  }

  const frequencyIcons = {
    daily: '🌱',
    weekly: '🌿',
    monthly: '🌳',
  }

  const handleDelete = async () => {
    if (confirm('¿Estás seguro de que quieres eliminar este hábito?')) {
      setIsDeleting(true)
      onDelete(habit.id)
    }
  }

  return (
    <div
      className={`bg-white rounded-xl shadow-md p-6 border-2 transition-all ${
        completed
          ? 'border-jungle-400 bg-jungle-50'
          : 'border-jungle-200 hover:border-jungle-300'
      } ${isDeleting ? 'opacity-50' : ''}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <span className="text-3xl">{frequencyIcons[habit.frequency]}</span>
          <div>
            <h3 className="text-xl font-semibold text-jungle-800">{habit.name}</h3>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-sm text-jungle-600 bg-jungle-100 px-2 py-1 rounded">
                {frequencyLabels[habit.frequency]}
              </span>
              {habit.target_days && (
                <span className="text-sm text-jungle-600">
                  {habit.target_days} días/semana
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(habit)}
            className="p-2 text-jungle-600 hover:text-jungle-800 hover:bg-jungle-100 rounded-lg transition"
            title="Editar"
          >
            ✏️
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
            title="Eliminar"
          >
            🗑️
          </button>
        </div>
      </div>

      {habit.description && (
        <p className="text-jungle-700 mb-4">{habit.description}</p>
      )}

      <div className="flex items-center justify-between">
        <button
          onClick={() => onToggleComplete(habit.id, !completed)}
          className={`flex-1 py-3 px-4 rounded-lg font-semibold transition ${
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

