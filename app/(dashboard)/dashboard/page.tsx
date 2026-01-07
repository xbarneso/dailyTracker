'use client'

import { useEffect, useState } from 'react'
import { Habit, HabitWithCompletion } from '@/types'
import HabitCard from '@/components/habits/HabitCard'
import HabitForm from '@/components/habits/HabitForm'
import { getTodayDate } from '@/lib/utils'

export default function DashboardPage() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [completions, setCompletions] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null)
  const [metrics, setMetrics] = useState({
    total_habits: 0,
    completed_today: 0,
    completion_rate: 0,
  })

  useEffect(() => {
    fetchHabits()
    fetchCompletions()
    fetchMetrics()
  }, [])

  const fetchHabits = async () => {
    try {
      const res = await fetch('/api/habits')
      const data = await res.json()
      if (data.habits) {
        setHabits(data.habits)
      }
    } catch (error) {
      console.error('Error fetching habits:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCompletions = async () => {
    try {
      const today = getTodayDate()
      const res = await fetch(`/api/completions?start_date=${today}&end_date=${today}`)
      const data = await res.json()
      if (data.completions) {
        const completionMap: Record<string, boolean> = {}
        data.completions.forEach((c: any) => {
          completionMap[c.habit_id] = true
        })
        setCompletions(completionMap)
      }
    } catch (error) {
      console.error('Error fetching completions:', error)
    }
  }

  const fetchMetrics = async () => {
    try {
      const res = await fetch('/api/metrics')
      const data = await res.json()
      if (data.metrics) {
        setMetrics(data.metrics)
      }
    } catch (error) {
      console.error('Error fetching metrics:', error)
    }
  }

  const handleToggleComplete = async (habitId: string, completed: boolean) => {
    try {
      if (completed) {
        const res = await fetch('/api/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ habit_id: habitId }),
        })
        if (res.ok) {
          setCompletions((prev) => ({ ...prev, [habitId]: true }))
          fetchMetrics()
        }
      } else {
        const completion = await fetch(`/api/completions?habit_id=${habitId}&start_date=${getTodayDate()}&end_date=${getTodayDate()}`)
        const data = await completion.json()
        if (data.completions && data.completions.length > 0) {
          const res = await fetch(`/api/completions/${data.completions[0].id}`, {
            method: 'DELETE',
          })
          if (res.ok) {
            setCompletions((prev) => {
              const newCompletions = { ...prev }
              delete newCompletions[habitId]
              return newCompletions
            })
            fetchMetrics()
          }
        }
      }
    } catch (error) {
      console.error('Error toggling completion:', error)
    }
  }

  const handleCreateHabit = async (data: Partial<Habit>) => {
    try {
      const res = await fetch('/api/habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (res.ok) {
        fetchHabits()
        setShowForm(false)
      }
    } catch (error) {
      console.error('Error creating habit:', error)
    }
  }

  const handleUpdateHabit = async (data: Partial<Habit>) => {
    if (!editingHabit) return
    try {
      const res = await fetch(`/api/habits/${editingHabit.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (res.ok) {
        fetchHabits()
        setEditingHabit(null)
      }
    } catch (error) {
      console.error('Error updating habit:', error)
    }
  }

  const handleDeleteHabit = async (habitId: string) => {
    try {
      const res = await fetch(`/api/habits/${habitId}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        fetchHabits()
        fetchMetrics()
      }
    } catch (error) {
      console.error('Error deleting habit:', error)
    }
  }

  const handleEdit = (habit: Habit) => {
    setEditingHabit(habit)
    setShowForm(true)
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingHabit(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-jungle-600 text-lg">Cargando...</div>
      </div>
    )
  }

  const todayHabits = habits.filter((habit) => {
    if (habit.frequency === 'daily') return true
    // For weekly/monthly, show all for now (could be improved)
    return true
  })

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-jungle-800 mb-2">
            🌿 Dashboard
          </h1>
          <p className="text-jungle-600">
            {new Date().toLocaleDateString('es-ES', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
        <button
          onClick={() => {
            setEditingHabit(null)
            setShowForm(true)
          }}
          className="bg-jungle-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-jungle-700 transition shadow-lg"
        >
          + Nuevo Hábito
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6 border-2 border-jungle-200">
          <div className="text-3xl mb-2">🌱</div>
          <div className="text-2xl font-bold text-jungle-800">{metrics.total_habits}</div>
          <div className="text-jungle-600">Total Hábitos</div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 border-2 border-jungle-200">
          <div className="text-3xl mb-2">✅</div>
          <div className="text-2xl font-bold text-jungle-800">{metrics.completed_today}</div>
          <div className="text-jungle-600">Completados Hoy</div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 border-2 border-jungle-200">
          <div className="text-3xl mb-2">📊</div>
          <div className="text-2xl font-bold text-jungle-800">
            {Math.round(metrics.completion_rate)}%
          </div>
          <div className="text-jungle-600">Tasa de Completado</div>
        </div>
      </div>

      {/* Habit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-jungle-800 mb-6">
              {editingHabit ? 'Editar Hábito' : 'Nuevo Hábito'}
            </h2>
            <HabitForm
              habit={editingHabit || undefined}
              onSubmit={editingHabit ? handleUpdateHabit : handleCreateHabit}
              onCancel={handleCancel}
            />
          </div>
        </div>
      )}

      {/* Habits List */}
      <div>
        <h2 className="text-2xl font-bold text-jungle-800 mb-4">Hábitos de Hoy</h2>
        {todayHabits.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center border-2 border-jungle-200">
            <div className="text-6xl mb-4">🌿</div>
            <p className="text-jungle-600 text-lg mb-4">
              No tienes hábitos configurados aún
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-jungle-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-jungle-700 transition"
            >
              Crear tu primer hábito
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {todayHabits.map((habit) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                completed={completions[habit.id] || false}
                onToggleComplete={handleToggleComplete}
                onEdit={handleEdit}
                onDelete={handleDeleteHabit}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

