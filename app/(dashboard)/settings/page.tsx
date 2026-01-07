'use client'

import { useEffect, useState } from 'react'
import { UserSettings } from '@/types'

export default function SettingsPage() {
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings')
      const data = await res.json()
      if (data.settings) {
        setSettings(data.settings)
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      const formData = new FormData(e.target as HTMLFormElement)
      const emailNotifications = formData.get('email_notifications') === 'on'
      const notificationTime = formData.get('notification_time') as string

      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email_notifications_enabled: emailNotifications,
          notification_time: notificationTime ? `${notificationTime}:00` : '09:00:00',
        }),
      })

      if (res.ok) {
        setMessage({ type: 'success', text: 'Configuración guardada exitosamente' })
        fetchSettings()
      } else {
        setMessage({ type: 'error', text: 'Error al guardar la configuración' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al guardar la configuración' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-jungle-600 text-lg">Cargando configuración...</div>
      </div>
    )
  }

  const notificationTime = settings?.notification_time 
    ? settings.notification_time.substring(0, 5) 
    : '09:00'

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold text-jungle-800">⚙️ Configuración</h1>

      <div className="bg-white rounded-xl shadow-md p-8 border-2 border-jungle-200 max-w-2xl">
        <h2 className="text-2xl font-bold text-jungle-800 mb-6">Notificaciones por Email</h2>

        {message && (
          <div
            className={`mb-6 px-4 py-3 rounded-lg ${
              message.type === 'success'
                ? 'bg-jungle-50 border border-jungle-300 text-jungle-700'
                : 'bg-red-50 border border-red-300 text-red-700'
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="email_notifications"
              name="email_notifications"
              defaultChecked={settings?.email_notifications_enabled ?? true}
              className="w-5 h-5 text-jungle-600 border-jungle-300 rounded focus:ring-jungle-500"
            />
            <label htmlFor="email_notifications" className="text-lg font-medium text-jungle-700">
              Habilitar notificaciones por email
            </label>
          </div>

          <div>
            <label htmlFor="notification_time" className="block text-sm font-medium text-jungle-700 mb-2">
              Hora de notificación
            </label>
            <input
              type="time"
              id="notification_time"
              name="notification_time"
              defaultValue={notificationTime}
              className="px-4 py-2 border border-jungle-300 rounded-lg focus:ring-2 focus:ring-jungle-500 focus:border-transparent outline-none"
            />
            <p className="mt-2 text-sm text-jungle-600">
              Recibirás un email a esta hora si no has completado tus hábitos del día anterior.
            </p>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="bg-jungle-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-jungle-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Guardando...' : 'Guardar Configuración'}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-md p-8 border-2 border-jungle-200 max-w-2xl">
        <h2 className="text-2xl font-bold text-jungle-800 mb-4">Información</h2>
        <div className="space-y-4 text-jungle-700">
          <p>
            Las notificaciones por email te ayudarán a mantenerte al día con tus hábitos.
            Recibirás un recordatorio si no completaste algún hábito el día anterior.
          </p>
          <p>
            Puedes desactivar las notificaciones en cualquier momento desde esta página.
          </p>
        </div>
      </div>
    </div>
  )
}

