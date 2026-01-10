import { useState, useEffect } from 'react'
import { Habit, HabitFrequency, HabitCategory } from '../../types'

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
  const [allDay, setAllDay] = useState(true)
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('18:00')
  const [icon, setIcon] = useState('🌱')
  const [category, setCategory] = useState<HabitCategory>('desarrollo_personal')
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [reminderTime, setReminderTime] = useState('09:00')

  const availableIcons = [
    '🌱', '🌿', '🌳', '🌲', '🌵', '🌴', '🍀', '🌺', '🌻', '🌷', '🌸', '🌼',
    '💪', '🏃', '🚴', '🏋️', '🧘', '🧗', '🏊', '⚽', '🏀', '🎾', '🏐', '🏓',
    '📚', '✍️', '🎯', '💡', '🎨', '🎵', '🎬', '📝', '🔍', '💭', '🧠', '💼',
    '💊', '🏥', '❤️', '🧘‍♀️', '🧘‍♂️', '🧴', '💧', '🍎', '🥗', '🥑', '🥛', '☕',
    '⏰', '📅', '✅', '⭐', '🔥', '💯', '🎉', '🏆', '🎖️', '🌟', '✨', '💫'
  ]

  const categoryLabels = {
    desarrollo_personal: 'Desarrollo Personal',
    deporte: 'Deporte',
    salud: 'Salud'
  }

  useEffect(() => {
    if (habit) {
      setName(habit.name)
      setDescription(habit.description || '')
      setFrequency(habit.frequency)
      setTargetDays(habit.target_days)
      setAllDay(habit.all_day !== undefined ? habit.all_day : true)
      setStartTime(habit.start_time || '09:00')
      setEndTime(habit.end_time || '18:00')
      setIcon(habit.icon || '🌱')
      setCategory(habit.category || 'desarrollo_personal')
      setNotificationsEnabled(habit.notifications_enabled || false)
      setReminderTime(habit.reminder_time || '09:00')
    }
  }, [habit])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      name,
      description: description || undefined,
      frequency,
      target_days: frequency !== 'daily' && frequency !== 'once' ? targetDays : undefined,
      all_day: allDay,
      start_time: !allDay ? startTime : undefined,
      end_time: !allDay ? endTime : undefined,
      icon,
      category,
      notifications_enabled: notificationsEnabled,
      reminder_time: notificationsEnabled ? reminderTime : undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
      {/* Icon Selector */}
      <div>
        <label className="block text-sm font-medium text-jungle-700 mb-1 sm:mb-2">
          Icono *
        </label>
        <div className="grid grid-cols-8 sm:grid-cols-10 gap-1 sm:gap-2 max-h-32 sm:max-h-40 overflow-y-auto p-2 bg-jungle-50 rounded-lg border border-jungle-200">
          {availableIcons.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => setIcon(emoji)}
              className={`text-xl sm:text-2xl p-1 sm:p-2 rounded-lg transition-all ${
                icon === emoji
                  ? 'bg-jungle-600 scale-110 ring-2 ring-jungle-400'
                  : 'bg-white hover:bg-jungle-100 hover:scale-105'
              }`}
            >
              {emoji}
            </button>
          ))}
        </div>
        <p className="mt-1 sm:mt-2 text-xs text-jungle-600">
          Icono seleccionado: <span className="text-xl sm:text-2xl">{icon}</span>
        </p>
      </div>

      {/* Category Selector */}
      <div>
        <label htmlFor="category" className="block text-sm font-medium text-jungle-700 mb-1 sm:mb-2">
          Categoría *
        </label>
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value as HabitCategory)}
          required
          className="w-full px-3 sm:px-4 py-2 border border-jungle-300 rounded-lg focus:ring-2 focus:ring-jungle-500 focus:border-transparent outline-none"
        >
          <option value="desarrollo_personal">📚 Desarrollo Personal</option>
          <option value="deporte">💪 Deporte</option>
          <option value="salud">❤️ Salud</option>
        </select>
      </div>

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-jungle-700 mb-1 sm:mb-2">
          Nombre del Hábito *
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full px-3 sm:px-4 py-2 border border-jungle-300 rounded-lg focus:ring-2 focus:ring-jungle-500 focus:border-transparent outline-none"
          placeholder="Ej: Hacer ejercicio"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-jungle-700 mb-1 sm:mb-2">
          Descripción
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="w-full px-3 sm:px-4 py-2 border border-jungle-300 rounded-lg focus:ring-2 focus:ring-jungle-500 focus:border-transparent outline-none"
          placeholder="Descripción opcional del hábito"
        />
      </div>

      <div>
        <label htmlFor="frequency" className="block text-sm font-medium text-jungle-700 mb-1 sm:mb-2">
          Frecuencia *
        </label>
        <select
          id="frequency"
          value={frequency}
          onChange={(e) => {
            setFrequency(e.target.value as HabitFrequency)
            if (e.target.value === 'daily' || e.target.value === 'once') {
              setTargetDays(undefined)
            }
          }}
          required
          className="w-full px-3 sm:px-4 py-2 border border-jungle-300 rounded-lg focus:ring-2 focus:ring-jungle-500 focus:border-transparent outline-none"
        >
          <option value="daily">Diario</option>
          <option value="once">Sólo Hoy (Una vez)</option>
          <option value="weekly">Semanal</option>
          <option value="monthly">Mensual</option>
        </select>
        {frequency === 'once' && (
          <p className="mt-1 text-sm text-jungle-600">
            Este hábito se registra una sola vez hoy y no se repetirá
          </p>
        )}
      </div>

      {(frequency === 'weekly' || frequency === 'monthly') && (
        <div>
          <label htmlFor="targetDays" className="block text-sm font-medium text-jungle-700 mb-1 sm:mb-2">
            Días objetivo {frequency === 'weekly' ? '(por semana)' : '(por mes)'}
          </label>
          <input
            id="targetDays"
            type="number"
            min="1"
            max={frequency === 'weekly' ? '7' : '31'}
            value={targetDays || ''}
            onChange={(e) => setTargetDays(e.target.value ? parseInt(e.target.value) : undefined)}
            className="w-full px-3 sm:px-4 py-2 border border-jungle-300 rounded-lg focus:ring-2 focus:ring-jungle-500 focus:border-transparent outline-none"
          />
        </div>
      )}

      {/* Time Range Options */}
      {(frequency === 'daily' || frequency === 'once') && (
        <div className="space-y-3 p-3 sm:p-4 bg-jungle-50 rounded-lg">
          <div>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={allDay}
                onChange={(e) => setAllDay(e.target.checked)}
                className="w-4 h-4 text-jungle-600 border-jungle-300 rounded focus:ring-jungle-500"
              />
              <span className="text-sm font-medium text-jungle-700">
                Disponible durante todo el día
              </span>
            </label>
          </div>

          {!allDay && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="startTime" className="block text-sm font-medium text-jungle-700 mb-1">
                  Hora de inicio
                </label>
                <input
                  id="startTime"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-2 sm:px-3 py-2 border border-jungle-300 rounded-lg focus:ring-2 focus:ring-jungle-500 focus:border-transparent outline-none text-sm"
                />
              </div>
              <div>
                <label htmlFor="endTime" className="block text-sm font-medium text-jungle-700 mb-1">
                  Hora de fin
                </label>
                <input
                  id="endTime"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-2 sm:px-3 py-2 border border-jungle-300 rounded-lg focus:ring-2 focus:ring-jungle-500 focus:border-transparent outline-none text-sm"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Notifications Section */}
      {frequency !== 'once' && (
        <div className="space-y-3 p-3 sm:p-4 bg-jungle-50 rounded-lg border border-jungle-200">
          <div>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={notificationsEnabled}
                onChange={(e) => setNotificationsEnabled(e.target.checked)}
                className="w-4 h-4 text-jungle-600 border-jungle-300 rounded focus:ring-jungle-500"
              />
              <span className="text-sm font-medium text-jungle-700 flex items-center">
                🔔 Activar recordatorios
              </span>
            </label>
            <p className="mt-1 text-xs text-jungle-600 ml-6">
              Recibe notificaciones en tu móvil para recordarte este hábito
            </p>
          </div>

          {notificationsEnabled && (
            <div>
              <label htmlFor="reminderTime" className="block text-sm font-medium text-jungle-700 mb-1">
                ⏰ Hora del recordatorio
              </label>
              <input
                id="reminderTime"
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 border border-jungle-300 rounded-lg focus:ring-2 focus:ring-jungle-500 focus:border-transparent outline-none text-sm"
              />
              <p className="mt-1 text-xs text-jungle-600">
                Te enviaremos una notificación a esta hora cada día
              </p>
            </div>
          )}
        </div>
      )}

      <div className="flex space-x-3 pt-2 sm:pt-4 sticky bottom-0 bg-white pb-2 sm:pb-0 -mx-4 sm:-mx-0 px-4 sm:px-0 border-t sm:border-t-0 border-jungle-200">
        <button
          type="submit"
          disabled={isLoading || !name}
          className="flex-1 bg-jungle-600 text-white py-2.5 sm:py-3 px-4 rounded-lg font-semibold hover:bg-jungle-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
        >
          {isLoading ? 'Guardando...' : habit ? 'Actualizar' : 'Crear'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-jungle-100 text-jungle-700 py-2.5 sm:py-3 px-4 rounded-lg font-semibold hover:bg-jungle-200 transition text-sm sm:text-base"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}

