import { useState, useEffect } from 'react'
import { Habit, HabitFrequency } from '../../types'

interface HabitFormProps {
  habit?: Habit
  onSubmit: (data: Partial<Habit>) => void
  onCancel: () => void
  isLoading?: boolean
}

export default function HabitForm({
  habit,
  onSubmit,
  onCancel,
  isLoading,
}: HabitFormProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [frequency, setFrequency] = useState<HabitFrequency>('daily')
  const [targetDays, setTargetDays] = useState<number | undefined>(undefined)

  useEffect(() => {
    if (habit) {
      setName(habit.name)
      setDescription(habit.description || '')
      setFrequency(habit.frequency)
      setTargetDays(habit.target_days)
    }
  }, [habit])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      name,
      description: description || undefined,
      frequency,
      target_days: frequency !== 'daily' ? targetDays : undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-jungle-700 mb-2">
          Nombre del Hábito *
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full px-4 py-2 border border-jungle-300 rounded-lg focus:ring-2 focus:ring-jungle-500 focus:border-transparent outline-none"
          placeholder="Ej: Hacer ejercicio"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-jungle-700 mb-2">
          Descripción
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full px-4 py-2 border border-jungle-300 rounded-lg focus:ring-2 focus:ring-jungle-500 focus:border-transparent outline-none"
          placeholder="Descripción opcional del hábito"
        />
      </div>

      <div>
        <label htmlFor="frequency" className="block text-sm font-medium text-jungle-700 mb-2">
          Frecuencia *
        </label>
        <select
          id="frequency"
          value={frequency}
          onChange={(e) => {
            setFrequency(e.target.value as HabitFrequency)
            if (e.target.value === 'daily') {
              setTargetDays(undefined)
            }
          }}
          required
          className="w-full px-4 py-2 border border-jungle-300 rounded-lg focus:ring-2 focus:ring-jungle-500 focus:border-transparent outline-none"
        >
          <option value="daily">Diario</option>
          <option value="weekly">Semanal</option>
          <option value="monthly">Mensual</option>
        </select>
      </div>

      {(frequency === 'weekly' || frequency === 'monthly') && (
        <div>
          <label htmlFor="targetDays" className="block text-sm font-medium text-jungle-700 mb-2">
            Días objetivo {frequency === 'weekly' ? '(por semana)' : '(por mes)'}
          </label>
          <input
            id="targetDays"
            type="number"
            min="1"
            max={frequency === 'weekly' ? '7' : '31'}
            value={targetDays || ''}
            onChange={(e) => setTargetDays(e.target.value ? parseInt(e.target.value) : undefined)}
            className="w-full px-4 py-2 border border-jungle-300 rounded-lg focus:ring-2 focus:ring-jungle-500 focus:border-transparent outline-none"
          />
        </div>
      )}

      <div className="flex space-x-3 pt-4">
        <button
          type="submit"
          disabled={isLoading || !name}
          className="flex-1 bg-jungle-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-jungle-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Guardando...' : habit ? 'Actualizar' : 'Crear'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-jungle-100 text-jungle-700 py-2 px-4 rounded-lg font-semibold hover:bg-jungle-200 transition"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}

