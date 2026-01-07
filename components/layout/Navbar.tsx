import Link from 'next/link'
import { useRouter } from 'next/router'
import { signOut } from 'next-auth/react'

export default function Navbar() {
  const router = useRouter()
  const pathname = router.pathname

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: '🏠' },
    { href: '/habits', label: 'Hábitos', icon: '🌿' },
    { href: '/metrics', label: 'Métricas', icon: '📊' },
    { href: '/settings', label: 'Configuración', icon: '⚙️' },
  ]

  return (
    <nav className="bg-jungle-700 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/dashboard">
                <a className="text-2xl font-bold">
                  🌿 Daily Tracker
                </a>
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href}>
                  <a
                    className={`inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors ${
                      pathname === link.href
                        ? 'border-b-2 border-jungle-300 text-jungle-200'
                        : 'text-jungle-100 hover:text-white hover:border-b-2 hover:border-jungle-400'
                    }`}
                  >
                    <span className="mr-2">{link.icon}</span>
                    {link.label}
                  </a>
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center">
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="px-4 py-2 text-sm font-medium text-jungle-100 hover:text-white hover:bg-jungle-600 rounded-lg transition"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
