'use client'

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip } from 'recharts'

interface CategoryData {
  category: string
  value: number
  fullMark: number
}

interface CategoryRadarChartProps {
  desarrolloPersonal: number
  deporte: number
  salud: number
}

export default function CategoryRadarChart({ desarrolloPersonal, deporte, salud }: CategoryRadarChartProps) {
  const data: CategoryData[] = [
    {
      category: '📚 Desarrollo Personal',
      value: desarrolloPersonal,
      fullMark: Math.max(desarrolloPersonal, deporte, salud, 10) // Ajusta escala dinámicamente
    },
    {
      category: '💪 Deporte',
      value: deporte,
      fullMark: Math.max(desarrolloPersonal, deporte, salud, 10)
    },
    {
      category: '❤️ Salud',
      value: salud,
      fullMark: Math.max(desarrolloPersonal, deporte, salud, 10)
    }
  ]

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid stroke="#86C388" />
          <PolarAngleAxis 
            dataKey="category" 
            tick={{ fill: '#2F5233', fontSize: 12, fontWeight: 600 }}
            style={{ wordBreak: 'break-word' }}
          />
          <PolarRadiusAxis 
            angle={90} 
            domain={[0, 'dataMax']} 
            tick={{ fill: '#5F8C61', fontSize: 10 }}
          />
          <Radar 
            name="Hábitos completados" 
            dataKey="value" 
            stroke="#2F5233" 
            fill="#5F8C61" 
            fillOpacity={0.6} 
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#fff', 
              border: '2px solid #86C388',
              borderRadius: '8px',
              padding: '10px'
            }}
          />
          <Legend 
            wrapperStyle={{ 
              paddingTop: '10px',
              fontSize: '14px',
              color: '#2F5233'
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}


