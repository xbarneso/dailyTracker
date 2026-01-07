'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface CompletionChartProps {
  data: Array<{
    name: string
    completados: number
    noCompletados: number
  }>
}

export default function CompletionChart({ data }: CompletionChartProps) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 border-2 border-jungle-200">
      <h3 className="text-xl font-bold text-jungle-800 mb-4">📊 Completados vs No Completados</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#c9d4c5" />
          <XAxis 
            dataKey="name" 
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
          <Bar dataKey="completados" fill="#38915a" name="Completados" />
          <Bar dataKey="noCompletados" fill="#d4c5b8" name="No Completados" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

