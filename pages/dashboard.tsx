import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import Navbar from '../components/layout/Navbar'
import HabitCard from '../components/habits/HabitCard'
import HabitForm from '../components/habits/HabitForm'
import { getTodayDate, isHabitActiveOnDate } from '../lib/utils'
import { Habit } from '../types'
import { useNotifications } from '../lib/hooks/useNotifications'

// Importar dinámicamente el componente de gráfico para evitar problemas de SSR
const CategoryRadarChart = dynamic(() => import('../components/charts/CategoryRadarChart'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-full"><div className="text-jungle-600">Cargando gráfico...</div></div>
})

export default function DashboardPage() {
  // const { data: session, status } = useSession()
  // const router = useRouter()
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
  const [categoryStats, setCategoryStats] = useState({
    desarrollo_personal: 0,
    deporte: 0,
    salud: 0,
  })

  // Notifications hook
  const { isSupported, permission, requestPermission, showNotification } = useNotifications()

  useEffect(() => {
    // Session check disabled temporarily
    // if (status === 'loading') return
    // if (!session) {
    //   router.push('/login')
    //   return
    // }
    fetchHabits()
    fetchCompletions()
    fetchMetrics()
  }, [])
  
  // Auto-open form if no habits exist
  useEffect(() => {
    if (!loading && habits.length === 0 && !showForm) {
      setShowForm(true)
    }
  }, [loading, habits.length, showForm])

  // Calculate category stats when habits or completions change
  useEffect(() => {
    const stats = {
      desarrollo_personal: 0,
      deporte: 0,
      salud: 0,
    }

    todayHabits.forEach((habit) => {
      const category = habit.category || 'desarrollo_personal'
      if (completions[habit.id]) {
        stats[category] = (stats[category] || 0) + 1
      }
    })

    setCategoryStats(stats)
  }, [habits, completions])

  const fetchHabits = async () => {
    try {
      const res = await fetch('/api/habits', {
        credentials: 'include',
      })
      const data = await res.json()
      console.log('[Dashboard] Habits response:', data)
      if (data.habits) {
        console.log('[Dashboard] Setting habits:', data.habits.length, 'habits')
        setHabits(data.habits)
      } else {
        console.log('[Dashboard] No habits in response')
        setHabits([])
      }
    } catch (error) {
      console.error('[Dashboard] Error fetching habits:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCompletions = async () => {
    try {
      const today = getTodayDate()
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

  const fetchMetrics = async () => {
    try {
      const res = await fetch('/api/metrics', {
        credentials: 'include',
      })
      const data = await res.json()
      console.log('[Dashboard] Metrics response:', data)
      if (data.metrics) {
        setMetrics(data.metrics)
      }
    } catch (error) {
      console.error('[Dashboard] Error fetching metrics:', error)
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
          fetchMetrics()
        }
      } else {
        const today = getTodayDate()
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

  // Don't block on session check - allow access for now
  // if (status === 'loading' || loading) {
  //   return (
  //     <div className="min-h-screen bg-jungle-50 flex items-center justify-center">
  //       <div className="text-jungle-600 text-lg">Cargando...</div>
  //     </div>
  //   )
  // }

  // if (!session) {
  //   return null
  // }
  
  console.log('[Dashboard] Rendering - loading:', loading, 'habits:', habits.length, 'showForm:', showForm)

  const todayHabits = habits.filter((habit) => {
    // Filter by frequency
    if (habit.frequency === 'once') return true
    if (habit.frequency === 'monthly') return true // Show all monthly habits
    
    // For daily and weekly, check if habit is active today
    if (habit.frequency === 'daily' || habit.frequency === 'weekly') {
      return isHabitActiveOnDate(habit.selected_days)
    }
    
    return true
  })

  return (
    <div className="min-h-screen bg-jungle-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-jungle-800 mb-2">
                🌿 Dashboard
              </h1>
              <p className="text-sm sm:text-base text-jungle-600">
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
              className="w-full sm:w-auto bg-jungle-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold hover:bg-jungle-700 transition shadow-lg text-sm sm:text-base"
            >
              + Nuevo Hábito
            </button>
          </div>

          {/* Notification Banner */}
          {isSupported && !permission.granted && !permission.denied && (
            <div className="bg-jungle-100 border-2 border-jungle-300 rounded-xl p-4 sm:p-6 shadow-md">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <span className="text-3xl">🔔</span>
                  <div>
                    <h3 className="font-semibold text-jungle-800 mb-1">
                      Activa las notificaciones
                    </h3>
                    <p className="text-sm text-jungle-700">
                      Recibe recordatorios en tu móvil para no olvidar tus hábitos
                    </p>
                  </div>
                </div>
                <button
                  onClick={async () => {
                    const granted = await requestPermission()
                    if (granted) {
                      showNotification({
                        title: '¡Notificaciones activadas! 🎉',
                        body: 'Te enviaremos recordatorios para tus hábitos',
                      })
                    }
                  }}
                  className="w-full sm:w-auto bg-jungle-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-jungle-700 transition whitespace-nowrap"
                >
                  Activar ahora
                </button>
              </div>
            </div>
          )}

          {/* Success message for granted notifications */}
          {permission.granted && (
            <div className="bg-green-50 border-2 border-green-300 rounded-xl p-4 flex items-center gap-3">
              <span className="text-2xl">✅</span>
              <p className="text-sm text-green-800 font-medium">
                Las notificaciones están activadas. Recibirás recordatorios para tus hábitos.
              </p>
            </div>
          )}

          {/* Metrics Cards and Radar Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-6">
              <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 border-2 border-jungle-200">
                <div className="text-2xl sm:text-3xl mb-2">🌱</div>
                <div className="text-xl sm:text-2xl font-bold text-jungle-800">{metrics.total_habits}</div>
                <div className="text-sm sm:text-base text-jungle-600">Total Hábitos</div>
              </div>
              <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 border-2 border-jungle-200">
                <div className="text-2xl sm:text-3xl mb-2">✅</div>
                <div className="text-xl sm:text-2xl font-bold text-jungle-800">{metrics.completed_today}</div>
                <div className="text-sm sm:text-base text-jungle-600">Completados Hoy</div>
              </div>
              <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 border-2 border-jungle-200">
                <div className="text-2xl sm:text-3xl mb-2">📊</div>
                <div className="text-xl sm:text-2xl font-bold text-jungle-800">
                  {Math.round(metrics.completion_rate)}%
                </div>
                <div className="text-sm sm:text-base text-jungle-600">Tasa de Completado</div>
              </div>
            </div>

            {/* Radar Chart */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6 border-2 border-jungle-200">
              <h3 className="text-xl sm:text-2xl font-bold text-jungle-800 mb-4">
                Hábitos Completados por Categoría
              </h3>
              <div className="h-64 sm:h-80">
                <CategoryRadarChart
                  desarrolloPersonal={categoryStats.desarrollo_personal}
                  deporte={categoryStats.deporte}
                  salud={categoryStats.salud}
                />
              </div>
            </div>
          </div>

          {/* Habit Form Modal */}
          {showForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start sm:items-center justify-center p-0 sm:p-4 z-50 overflow-y-auto">
              <div className="bg-white rounded-t-xl sm:rounded-xl shadow-2xl p-4 sm:p-6 w-full sm:max-w-lg sm:my-8 min-h-screen sm:min-h-0">
                <div className="sticky top-0 bg-white pb-3 sm:pb-4 border-b border-jungle-200 mb-4 -mx-4 sm:-mx-6 px-4 sm:px-6 pt-4 sm:pt-0">
                  <h2 className="text-xl sm:text-2xl font-bold text-jungle-800">
                    {editingHabit ? 'Editar Hábito' : 'Nuevo Hábito'}
                  </h2>
                </div>
                <div className="pb-20 sm:pb-0">
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
      </main>
    </div>
  )
}

