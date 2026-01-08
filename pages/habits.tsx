import { useEffect, useState } from 'react'
import Navbar from '../components/layout/Navbar'
import HabitCard from '../components/habits/HabitCard'
import HabitForm from '../components/habits/HabitForm'
import { Habit } from '../types'

export default function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [completions, setCompletions] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null)
  const [filter, setFilter] = useState<'all' | 'daily' | 'once' | 'weekly' | 'monthly'>('all')
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'desarrollo_personal' | 'deporte' | 'salud'>('all')

  useEffect(() => {
    fetchHabits()
    fetchCompletions()
  }, [])

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
    } finally {
      setLoading(false)
    }
  }

  const fetchCompletions = async () => {
    try {
      const today = new Date().toISOString().split('T')[0]
      const res = await fetch(`/api/completions?start_date=${today}&end_date=${today}`, {
        credentials: 'include',
      })
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

  const handleToggleComplete = async (habitId: string, completed: boolean) => {
    try {
      if (completed) {
        const res = await fetch('/api/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ habit_id: habitId }),
        })
        if (res.ok) {
          setCompletions((prev) => ({ ...prev, [habitId]: true }))
        }
      } else {
        const today = new Date().toISOString().split('T')[0]
        const completion = await fetch(`/api/completions?habit_id=${habitId}&start_date=${today}&end_date=${today}`, {
          credentials: 'include',
        })
        const data = await completion.json()
        if (data.completions && data.completions.length > 0) {
          const res = await fetch(`/api/completions/${data.completions[0].id}`, {
            method: 'DELETE',
            credentials: 'include',
          })
          if (res.ok) {
            setCompletions((prev) => {
              const newCompletions = { ...prev }
              delete newCompletions[habitId]
              return newCompletions
            })
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
        credentials: 'include',
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
        credentials: 'include',
        body: JSON.stringify(data),
      })
      if (res.ok) {
        fetchHabits()
        setEditingHabit(null)
        setShowForm(false)
      }
    } catch (error) {
      console.error('Error updating habit:', error)
    }
  }

  const handleDeleteHabit = async (habitId: string) => {
    try {
      const res = await fetch(`/api/habits/${habitId}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      if (res.ok) {
        fetchHabits()
      }
    } catch (error) {
      console.error('Error deleting habit:', error)
    }
  }

  const handleEdit = (habit: Habit) => {
    setEditingHabit(habit)
    setShowForm(true)
  }

  const filteredHabits = habits.filter((habit) => {
    // Filter by frequency
    if (filter !== 'all' && habit.frequency !== filter) return false
    // Filter by category
    if (categoryFilter !== 'all' && habit.category !== categoryFilter) return false
    return true
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-jungle-50 flex items-center justify-center">
        <div className="text-jungle-600 text-lg">Cargando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-jungle-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-jungle-800 mb-2">
                🌿 Mis Hábitos
              </h1>
              <p className="text-sm sm:text-base text-jungle-600">
                Gestiona todos tus hábitos en un solo lugar
              </p>
            </div>
            <button
              onClick={() => {
                setEditingHabit(null)
                setShowForm(true)
              }}
              className="w-full sm:w-auto bg-jungle-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold hover:bg-jungle-700 transition shadow-lg text-sm sm:text-base"
            >
              + Nuevo Hábito
            </button>
          </div>

          {/* Category Filter Buttons */}
          <div>
            <h3 className="text-sm font-medium text-jungle-700 mb-2">Filtrar por categoría:</h3>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setCategoryFilter('all')}
                className={`px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base font-medium transition ${
                  categoryFilter === 'all'
                    ? 'bg-jungle-600 text-white'
                    : 'bg-white text-jungle-700 hover:bg-jungle-100'
                }`}
              >
                Todas
              </button>
              <button
                onClick={() => setCategoryFilter('desarrollo_personal')}
                className={`px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base font-medium transition ${
                  categoryFilter === 'desarrollo_personal'
                    ? 'bg-purple-600 text-white'
                    : 'bg-white text-purple-700 hover:bg-purple-100'
                }`}
              >
                📚 Desarrollo Personal
              </button>
              <button
                onClick={() => setCategoryFilter('deporte')}
                className={`px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base font-medium transition ${
                  categoryFilter === 'deporte'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-blue-700 hover:bg-blue-100'
                }`}
              >
                💪 Deporte
              </button>
              <button
                onClick={() => setCategoryFilter('salud')}
                className={`px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base font-medium transition ${
                  categoryFilter === 'salud'
                    ? 'bg-red-600 text-white'
                    : 'bg-white text-red-700 hover:bg-red-100'
                }`}
              >
                ❤️ Salud
              </button>
            </div>
          </div>

          {/* Frequency Filter Buttons */}
          <div>
            <h3 className="text-sm font-medium text-jungle-700 mb-2">Filtrar por frecuencia:</h3>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base font-medium transition ${
                  filter === 'all'
                    ? 'bg-jungle-600 text-white'
                    : 'bg-white text-jungle-700 hover:bg-jungle-100'
                }`}
              >
                Todas
              </button>
              <button
                onClick={() => setFilter('daily')}
                className={`px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base font-medium transition ${
                  filter === 'daily'
                    ? 'bg-jungle-600 text-white'
                    : 'bg-white text-jungle-700 hover:bg-jungle-100'
                }`}
              >
                🌱 Diarios
              </button>
              <button
                onClick={() => setFilter('once')}
                className={`px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base font-medium transition ${
                  filter === 'once'
                    ? 'bg-jungle-600 text-white'
                    : 'bg-white text-jungle-700 hover:bg-jungle-100'
                }`}
              >
                ⏰ Sólo Hoy
              </button>
              <button
                onClick={() => setFilter('weekly')}
                className={`px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base font-medium transition ${
                  filter === 'weekly'
                    ? 'bg-jungle-600 text-white'
                    : 'bg-white text-jungle-700 hover:bg-jungle-100'
                }`}
              >
                🌿 Semanales
              </button>
              <button
                onClick={() => setFilter('monthly')}
                className={`px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base font-medium transition ${
                  filter === 'monthly'
                    ? 'bg-jungle-600 text-white'
                    : 'bg-white text-jungle-700 hover:bg-jungle-100'
                }`}
              >
                🌳 Mensuales
              </button>
            </div>
          </div>

          {/* Habit Form Modal */}
          {showForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
              <div className="bg-white rounded-xl shadow-2xl p-4 sm:p-8 max-w-md w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl sm:text-2xl font-bold text-jungle-800 mb-4 sm:mb-6">
                  {editingHabit ? 'Editar Hábito' : 'Nuevo Hábito'}
                </h2>
                <HabitForm
                  habit={editingHabit || undefined}
                  onSubmit={editingHabit ? handleUpdateHabit : handleCreateHabit}
                  onCancel={() => {
                    setShowForm(false)
                    setEditingHabit(null)
                  }}
                />
              </div>
            </div>
          )}

          {/* Habits List */}
          <div>
            {filteredHabits.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md p-12 text-center border-2 border-jungle-200">
                <div className="text-6xl mb-4">🌿</div>
                <p className="text-jungle-600 text-lg mb-4">
                  {filter === 'all'
                    ? 'No tienes hábitos configurados aún'
                    : filter === 'daily'
                    ? 'No tienes hábitos diarios'
                    : filter === 'once'
                    ? 'No tienes hábitos de "sólo hoy"'
                    : filter === 'weekly'
                    ? 'No tienes hábitos semanales'
                    : 'No tienes hábitos mensuales'}
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
                {filteredHabits.map((habit) => (
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
      </main>
    </div>
  )
}

