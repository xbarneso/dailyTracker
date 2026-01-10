'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function Navbar() {
  const [pathname, setPathname] = useState('')

  useEffect(() => {
    // Set initial pathname
    if (typeof window !== 'undefined') {
      setPathname(window.location.pathname)
    }
    
    // Update pathname on navigation
    const updatePathname = () => {
      if (typeof window !== 'undefined') {
        setPathname(window.location.pathname)
      }
    }
    
    // Listen for popstate (browser back/forward)
    window.addEventListener('popstate', updatePathname)
    
    // Also update when clicking links (using a small delay to catch Next.js navigation)
    const handleClick = () => {
      setTimeout(updatePathname, 50)
    }
    document.addEventListener('click', handleClick)
    
    return () => {
      window.removeEventListener('popstate', updatePathname)
      document.removeEventListener('click', handleClick)
    }
  }, [])

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: '🏠' },
    { href: '/habits', label: 'Hábitos', icon: '🌿' },
    { href: '/metrics', label: 'Métricas', icon: '📊' },
    { href: '/settings', label: 'Configuración', icon: '⚙️' },
  ]

  const handleSignOut = async () => {
    try {
      const response = await fetch('/api/auth/signout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      if (response.ok) {
        window.location.href = '/login'
      }
    } catch (error) {
      console.error('Error signing out:', error)
      window.location.href = '/login'
    }
  }

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <nav className="bg-jungle-700 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/dashboard">
                <a className="text-xl sm:text-2xl font-bold">
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
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="sm:hidden p-2 text-jungle-100 hover:text-white hover:bg-jungle-600 rounded-lg transition"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? '✕' : '☰'}
            </button>
            <button
              onClick={handleSignOut}
              className="hidden sm:block px-4 py-2 text-sm font-medium text-jungle-100 hover:text-white hover:bg-jungle-600 rounded-lg transition"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden border-t border-jungle-600 py-2">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <a
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-2 text-base font-medium transition-colors ${
                    pathname === link.href
                      ? 'bg-jungle-600 text-white'
                      : 'text-jungle-100 hover:bg-jungle-600 hover:text-white'
                  }`}
                >
                  <span className="mr-2">{link.icon}</span>
                  {link.label}
                </a>
              </Link>
            ))}
            <button
              onClick={handleSignOut}
              className="block w-full text-left px-4 py-2 text-base font-medium text-jungle-100 hover:bg-jungle-600 hover:text-white transition-colors"
            >
              Cerrar Sesión
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}
