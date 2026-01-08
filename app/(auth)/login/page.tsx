'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const csrfRes = await fetch('/api/auth/csrf')
      const csrfData = await csrfRes.json()
      const csrfToken = csrfData.csrfToken

      const formData = new URLSearchParams()
      formData.append('email', email)
      formData.append('password', password)
      formData.append('csrfToken', csrfToken)
      formData.append('callbackUrl', '/dashboard')
      formData.append('redirect', 'false')
      formData.append('json', 'true')

      const response = await fetch('/api/auth/signin/credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData,
        credentials: 'include',
      })

      const result = await response.json()

      if (result.error) {
        setError('Credenciales inválidas')
        setLoading(false)
      } else if (result.ok) {
        window.location.href = '/dashboard'
      } else {
        setError('Error al iniciar sesión')
        setLoading(false)
      }
    } catch (err) {
      setError('Error al iniciar sesión')
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
            <p className="text-jungle-600">Inicia sesión en tu cuenta</p>
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
                className="w-full px-4 py-3 border border-jungle-300 rounded-lg focus:ring-2 focus:ring-jungle-500 focus:border-transparent outline-none transition"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-jungle-600 text-white py-3 rounded-lg font-semibold hover:bg-jungle-700 transition disabled:opacity-50"
            >
              {loading ? 'Iniciando...' : 'Iniciar Sesión'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-jungle-600">
              ¿No tienes cuenta?{' '}
              <Link href="/register">
                <a className="text-jungle-600 font-semibold hover:text-jungle-800">
                  Regístrate
                </a>
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
