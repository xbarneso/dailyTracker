'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface StreakChartProps {
  data: Array<{
    date: string
    completions: number
  }>
}

export default function StreakChart({ data }: StreakChartProps) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 border-2 border-jungle-200">
      <h3 className="text-xl font-bold text-jungle-800 mb-4">📈 Progreso Temporal</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#c9d4c5" />
          <XAxis 
            dataKey="date" 
            stroke="#2a7447"
            tick={{ fill: '#2a7447' }}
          />
          <YAxis 
            stroke="#2a7447"
            tick={{ fill: '#2a7447' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#f0f9f4', 
              border: '1px solid #38915a',
              borderRadius: '8px'
            }}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="completions" 
            stroke="#38915a" 
            strokeWidth={2}
            name="Completados"
            dot={{ fill: '#38915a', r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

