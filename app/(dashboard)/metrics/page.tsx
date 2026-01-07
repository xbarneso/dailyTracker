'use client'

import { useEffect, useState } from 'react'
import { Metrics } from '@/types'
import StreakChart from '@/components/metrics/StreakChart'
import CompletionChart from '@/components/metrics/CompletionChart'
import HeatmapCalendar from '@/components/metrics/HeatmapCalendar'
import { getDateRange } from '@/lib/utils'

export default function MetricsPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [chartData, setChartData] = useState<any[]>([])
  const [completionData, setCompletionData] = useState<any[]>([])
  const [heatmapData, setHeatmapData] = useState<any[]>([])

  useEffect(() => {
    fetchMetrics()
    fetchChartData()
  }, [])

  const fetchMetrics = async () => {
    try {
      const res = await fetch('/api/metrics')
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

  const fetchChartData = async () => {
    try {
      const last30Days = getDateRange(30)
      const startDate = last30Days[0]
      const endDate = last30Days[last30Days.length - 1]

      const [completionsRes, habitsRes] = await Promise.all([
        fetch(`/api/completions?start_date=${startDate}&end_date=${endDate}`),
        fetch('/api/habits'),
      ])

      const [completionsData, habitsData] = await Promise.all([
        completionsRes.json(),
        habitsRes.json(),
      ])

      // Process data for line chart
      const dateMap: Record<string, number> = {}
      last30Days.forEach(date => {
        dateMap[date] = 0
      })

      completionsData.completions?.forEach((c: any) => {
        if (dateMap[c.date] !== undefined) {
          dateMap[c.date]++
        }
      })

      const chartDataArray = last30Days.map(date => ({
        date: new Date(date).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }),
        completions: dateMap[date],
      }))

      setChartData(chartDataArray)

      // Process data for bar chart
      const habits = habitsData.habits || []
      const completionBarData = habits.map((habit: any) => {
        const habitCompletions = completionsData.completions?.filter(
          (c: any) => c.habit_id === habit.id
        ).length || 0
        const expected = habit.frequency === 'daily' ? 30 : habit.frequency === 'weekly' ? 4 : 1
        return {
          name: habit.name.length > 10 ? habit.name.substring(0, 10) + '...' : habit.name,
          completados: habitCompletions,
          noCompletados: Math.max(0, expected - habitCompletions),
        }
      })

      setCompletionData(completionBarData)

      // Process data for heatmap
      const heatmapMap: Record<string, number> = {}
      completionsData.completions?.forEach((c: any) => {
        if (heatmapMap[c.date]) {
          heatmapMap[c.date]++
        } else {
          heatmapMap[c.date] = 1
        }
      })

      const heatmapArray = last30Days.map(date => ({
        date,
        count: heatmapMap[date] || 0,
      }))

      setHeatmapData(heatmapArray)
    } catch (error) {
      console.error('Error fetching chart data:', error)
    }
  }

  const handleExport = async (format: 'csv' | 'json') => {
    try {
      const res = await fetch('/api/completions')
      const data = await res.json()

      if (format === 'csv') {
        const headers = ['Fecha', 'Hábito ID', 'Completado']
        const rows = data.completions?.map((c: any) => [
          c.date,
          c.habit_id,
          c.completed_at,
        ]) || []

        const csvContent = [
          headers.join(','),
          ...rows.map((row: any[]) => row.join(','))
        ].join('\n')

        const blob = new Blob([csvContent], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `habits-export-${new Date().toISOString().split('T')[0]}.csv`
        a.click()
        URL.revokeObjectURL(url)
      } else {
        const jsonContent = JSON.stringify(data.completions || [], null, 2)
        const blob = new Blob([jsonContent], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `habits-export-${new Date().toISOString().split('T')[0]}.json`
        a.click()
        URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Error exporting data:', error)
      alert('Error al exportar los datos')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-jungle-600 text-lg">Cargando métricas...</div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold text-jungle-800">📊 Métricas</h1>
        <div className="flex space-x-3">
          <button
            onClick={() => handleExport('csv')}
            className="bg-jungle-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-jungle-700 transition"
          >
            Exportar CSV
          </button>
          <button
            onClick={() => handleExport('json')}
            className="bg-jungle-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-jungle-700 transition"
          >
            Exportar JSON
          </button>
        </div>
      </div>

      {/* Metrics Summary */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-md p-6 border-2 border-jungle-200">
            <div className="text-3xl mb-2">🌱</div>
            <div className="text-2xl font-bold text-jungle-800">{metrics.total_habits}</div>
            <div className="text-jungle-600">Total Hábitos</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 border-2 border-jungle-200">
            <div className="text-3xl mb-2">🔥</div>
            <div className="text-2xl font-bold text-jungle-800">{metrics.current_streak}</div>
            <div className="text-jungle-600">Racha Actual</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 border-2 border-jungle-200">
            <div className="text-3xl mb-2">⭐</div>
            <div className="text-2xl font-bold text-jungle-800">{metrics.longest_streak}</div>
            <div className="text-jungle-600">Racha Más Larga</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 border-2 border-jungle-200">
            <div className="text-3xl mb-2">📈</div>
            <div className="text-2xl font-bold text-jungle-800">
              {Math.round(metrics.completion_rate)}%
            </div>
            <div className="text-jungle-600">Tasa de Completado</div>
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StreakChart data={chartData} />
        <CompletionChart data={completionData} />
      </div>

      {/* Heatmap */}
      <HeatmapCalendar completions={heatmapData} />
    </div>
  )
}

