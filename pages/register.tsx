import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'

export default function RegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Error al crear la cuenta')
      } else {
        router.push('/login?registered=true')
      }
    } catch (err) {
      setError('Error al crear la cuenta')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-jungle-100 to-jungle-200 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-jungle-300">
          <div className="text-center mb-8">
            <h1 className="text-4xl mb-2">🌿</h1>
            <h2 className="text-3xl font-bold text-jungle-800 mb-2">Daily Tracker</h2>
            <p className="text-jungle-600">Crea tu cuenta</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-jungle-700 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-jungle-300 rounded-lg focus:ring-2 focus:ring-jungle-500 focus:border-transparent outline-none transition"
                placeholder="tu@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-jungle-700 mb-2">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 border border-jungle-300 rounded-lg focus:ring-2 focus:ring-jungle-500 focus:border-transparent outline-none transition"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-jungle-700 mb-2">
                Confirmar Contraseña
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 border border-jungle-300 rounded-lg focus:ring-2 focus:ring-jungle-500 focus:border-transparent outline-none transition"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-jungle-600 text-white py-3 rounded-lg font-semibold hover:bg-jungle-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creando cuenta...' : 'Registrarse'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-jungle-600">
              ¿Ya tienes cuenta?{' '}
              <Link href="/login">
                <a className="text-jungle-600 font-semibold hover:text-jungle-800">
                  Inicia sesión
                </a>
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

