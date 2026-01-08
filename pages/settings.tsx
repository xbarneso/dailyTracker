import { useEffect, useState } from 'react'
import Navbar from '../components/layout/Navbar'

interface Settings {
  email_notifications_enabled: boolean
  notification_time?: string
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    email_notifications_enabled: false,
    notification_time: '09:00',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings', {
        credentials: 'include',
      })
      const data = await res.json()
      if (data.settings) {
        setSettings({
          email_notifications_enabled: data.settings.email_notifications_enabled || false,
          notification_time: data.settings.notification_time || '09:00',
        })
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
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(settings),
      })

      const data = await res.json()

      if (res.ok) {
        setMessage({ type: 'success', text: 'Configuración guardada correctamente' })
        if (data.settings) {
          setSettings(data.settings)
        }
      } else {
        setMessage({ type: 'error', text: data.error || 'Error al guardar la configuración' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al guardar la configuración' })
    } finally {
      setSaving(false)
      setTimeout(() => setMessage(null), 5000)
    }
  }

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
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold text-jungle-800 mb-2">
              ⚙️ Configuración
            </h1>
            <p className="text-jungle-600">
              Gestiona tus preferencias y notificaciones
            </p>
          </div>

          <form onSubmit={handleSave} className="bg-white rounded-xl shadow-md p-8 border-2 border-jungle-200 space-y-6">
            {message && (
              <div
                className={`p-4 rounded-lg ${
                  message.type === 'success'
                    ? 'bg-green-50 border border-green-200 text-green-700'
                    : 'bg-red-50 border border-red-200 text-red-700'
                }`}
              >
                {message.text}
              </div>
            )}

            <div>
              <h2 className="text-2xl font-bold text-jungle-800 mb-4">Notificaciones</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-jungle-50 rounded-lg">
                  <div>
                    <label htmlFor="email_notifications" className="text-lg font-medium text-jungle-800">
                      Notificaciones por Email
                    </label>
                    <p className="text-sm text-jungle-600">
                      Recibe recordatorios diarios sobre tus hábitos
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      id="email_notifications"
                      checked={settings.email_notifications_enabled}
                      onChange={(e) =>
                        setSettings({ ...settings, email_notifications_enabled: e.target.checked })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-jungle-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-jungle-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-jungle-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-jungle-600"></div>
                  </label>
                </div>

                {settings.email_notifications_enabled && (
                  <div>
                    <label htmlFor="notification_time" className="block text-sm font-medium text-jungle-700 mb-2">
                      Hora de Notificación
                    </label>
                    <input
                      type="time"
                      id="notification_time"
                      value={settings.notification_time || '09:00'}
                      onChange={(e) => setSettings({ ...settings, notification_time: e.target.value })}
                      className="w-full px-4 py-3 border border-jungle-300 rounded-lg focus:ring-2 focus:ring-jungle-500 focus:border-transparent outline-none transition"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-jungle-200">
              <button
                type="submit"
                disabled={saving}
                className="bg-jungle-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-jungle-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Guardando...' : 'Guardar Configuración'}
              </button>
            </div>
          </form>

          <div className="bg-white rounded-xl shadow-md p-8 border-2 border-jungle-200">
            <h2 className="text-2xl font-bold text-jungle-800 mb-4">Información de la Cuenta</h2>
            <div className="space-y-4">
              <div className="p-4 bg-jungle-50 rounded-lg">
                <div className="text-sm text-jungle-600 mb-1">Versión de la Aplicación</div>
                <div className="text-lg font-semibold text-jungle-800">Daily Tracker v1.0.0</div>
              </div>
              <div className="p-4 bg-jungle-50 rounded-lg">
                <div className="text-sm text-jungle-600 mb-1">Estado del Sistema</div>
                <div className="text-lg font-semibold text-green-600">✓ Operativo</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

