'use client'

import { useMemo } from 'react'

interface HeatmapCalendarProps {
  completions: Array<{
    date: string
    count: number
  }>
}

export default function HeatmapCalendar({ completions }: HeatmapCalendarProps) {
  const completionMap = useMemo(() => {
    const map: Record<string, number> = {}
    completions.forEach(c => {
      map[c.date] = c.count
    })
    return map
  }, [completions])

  const getIntensity = (count: number) => {
    if (count === 0) return 'bg-jungle-50'
    if (count === 1) return 'bg-jungle-200'
    if (count === 2) return 'bg-jungle-400'
    if (count >= 3) return 'bg-jungle-600'
    return 'bg-jungle-50'
  }

  // Generate last 30 days
  const days = useMemo(() => {
    const dates: string[] = []
    const today = new Date()
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      dates.push(date.toISOString().split('T')[0])
    }
    return dates
  }, [])

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border-2 border-jungle-200">
      <h3 className="text-xl font-bold text-jungle-800 mb-4">🗓️ Calendario de Actividad</h3>
      <div className="grid grid-cols-7 gap-2">
        {days.map((date, index) => {
          const count = completionMap[date] || 0
          const dayDate = new Date(date)
          const dayName = dayDate.toLocaleDateString('es-ES', { weekday: 'short' })
          const dayNumber = dayDate.getDate()
          
          return (
            <div
              key={date}
              className={`aspect-square rounded-lg flex flex-col items-center justify-center text-xs ${getIntensity(count)} ${
                count > 0 ? 'text-white' : 'text-jungle-600'
              }`}
              title={`${date}: ${count} completados`}
            >
              {index < 7 && (
                <div className="text-[10px] mb-1 opacity-70">{dayName}</div>
              )}
              <div className="font-semibold">{dayNumber}</div>
            </div>
          )
        })}
      </div>
      <div className="mt-4 flex items-center justify-center space-x-4 text-sm text-jungle-600">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-jungle-50 rounded"></div>
          <span>Menos</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-jungle-200 rounded"></div>
          <div className="w-4 h-4 bg-jungle-400 rounded"></div>
          <div className="w-4 h-4 bg-jungle-600 rounded"></div>
          <span>Más</span>
        </div>
      </div>
    </div>
  )
}

