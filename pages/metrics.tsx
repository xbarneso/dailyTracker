import { useEffect, useState } from 'react'
import Navbar from '../components/layout/Navbar'

interface Metrics {
  total_habits: number
  completed_today: number
  completion_rate: number
  current_streak: number
  longest_streak: number
  habits_by_frequency: {
    daily: number
    once: number
    weekly: number
    monthly: number
  }
  habit_streaks: Array<{
    habit_id: string
    streak: number
  }>
}

export default function MetricsPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [habits, setHabits] = useState<any[]>([])

  useEffect(() => {
    fetchMetrics()
    fetchHabits()
  }, [])

  const fetchMetrics = async () => {
    try {
      const res = await fetch('/api/metrics', {
        credentials: 'include',
      })
      const data = await res.json()
      if (data.metrics) {
        setMetrics(data.metrics)
      }
    } catch (error) {
      console.error('Error fetching metrics:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchHabits = async () => {
    try {
      const res = await fetch('/api/habits', {
        credentials: 'include',
      })
      const data = await res.json()
      if (data.habits) {
        setHabits(data.habits)
      }
    } catch (error) {
      console.error('Error fetching habits:', error)
    }
  }

  const getHabitName = (habitId: string) => {
    const habit = habits.find((h) => h.id === habitId)
    return habit?.name || 'Hábito desconocido'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-jungle-50 flex items-center justify-center">
        <div className="text-jungle-600 text-lg">Cargando...</div>
      </div>
    )
  }

  if (!metrics) {
    return (
      <div className="min-h-screen bg-jungle-50">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-jungle-600">No hay métricas disponibles</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-jungle-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold text-jungle-800 mb-2">
              📊 Métricas
            </h1>
            <p className="text-jungle-600">
              Estadísticas y análisis de tus hábitos
            </p>
          </div>

          {/* Main Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-md p-6 border-2 border-jungle-200">
              <div className="text-3xl mb-2">🌱</div>
              <div className="text-3xl font-bold text-jungle-800">{metrics.total_habits}</div>
              <div className="text-jungle-600">Total Hábitos</div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6 border-2 border-jungle-200">
              <div className="text-3xl mb-2">✅</div>
              <div className="text-3xl font-bold text-jungle-800">{metrics.completed_today}</div>
              <div className="text-jungle-600">Completados Hoy</div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6 border-2 border-jungle-200">
              <div className="text-3xl mb-2">📈</div>
              <div className="text-3xl font-bold text-jungle-800">
                {Math.round(metrics.completion_rate)}%
              </div>
              <div className="text-jungle-600">Tasa de Completado</div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6 border-2 border-jungle-200">
              <div className="text-3xl mb-2">🔥</div>
              <div className="text-3xl font-bold text-jungle-800">{metrics.current_streak}</div>
              <div className="text-jungle-600">Racha Actual</div>
            </div>
          </div>

          {/* Streaks Section */}
          <div className="bg-white rounded-xl shadow-md p-6 border-2 border-jungle-200">
            <h2 className="text-2xl font-bold text-jungle-800 mb-4">🔥 Rachas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-jungle-50 rounded-lg p-4">
                <div className="text-sm text-jungle-600 mb-1">Racha Actual</div>
                <div className="text-2xl font-bold text-jungle-800">{metrics.current_streak} días</div>
              </div>
              <div className="bg-jungle-50 rounded-lg p-4">
                <div className="text-sm text-jungle-600 mb-1">Racha Más Larga</div>
                <div className="text-2xl font-bold text-jungle-800">{metrics.longest_streak} días</div>
              </div>
            </div>
          </div>

          {/* Habits by Frequency */}
          <div className="bg-white rounded-xl shadow-md p-6 border-2 border-jungle-200">
            <h2 className="text-2xl font-bold text-jungle-800 mb-4">Hábitos por Frecuencia</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-jungle-50 rounded-lg p-4 text-center">
                <div className="text-3xl mb-2">🌱</div>
                <div className="text-2xl font-bold text-jungle-800">{metrics.habits_by_frequency.daily}</div>
                <div className="text-jungle-600">Diarios</div>
              </div>
              <div className="bg-jungle-50 rounded-lg p-4 text-center">
                <div className="text-3xl mb-2">⏰</div>
                <div className="text-2xl font-bold text-jungle-800">{metrics.habits_by_frequency.once}</div>
                <div className="text-jungle-600">Sólo Hoy</div>
              </div>
              <div className="bg-jungle-50 rounded-lg p-4 text-center">
                <div className="text-3xl mb-2">🌿</div>
                <div className="text-2xl font-bold text-jungle-800">{metrics.habits_by_frequency.weekly}</div>
                <div className="text-jungle-600">Semanales</div>
              </div>
              <div className="bg-jungle-50 rounded-lg p-4 text-center">
                <div className="text-3xl mb-2">🌳</div>
                <div className="text-2xl font-bold text-jungle-800">{metrics.habits_by_frequency.monthly}</div>
                <div className="text-jungle-600">Mensuales</div>
              </div>
            </div>
          </div>

          {/* Individual Habit Streaks */}
          {metrics.habit_streaks && metrics.habit_streaks.length > 0 && (
            <div className="bg-white rounded-xl shadow-md p-6 border-2 border-jungle-200">
              <h2 className="text-2xl font-bold text-jungle-800 mb-4">Rachas por Hábito</h2>
              <div className="space-y-3">
                {metrics.habit_streaks
                  .sort((a, b) => b.streak - a.streak)
                  .map((habitStreak) => (
                    <div key={habitStreak.habit_id} className="flex items-center justify-between bg-jungle-50 rounded-lg p-4">
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">🔥</div>
                        <div>
                          <div className="font-semibold text-jungle-800">{getHabitName(habitStreak.habit_id)}</div>
                          <div className="text-sm text-jungle-600">Racha actual</div>
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-jungle-600">{habitStreak.streak} días</div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

