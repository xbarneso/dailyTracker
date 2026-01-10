import { useEffect } from 'react'
import { useSession } from 'next-auth/client'

export default function Home() {
  const [session, loading] = useSession()

  useEffect(() => {
    if (loading) return
    
    if (session) {
      window.location.href = '/dashboard'
    } else {
      window.location.href = '/login'
    }
  }, [session, loading])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-jungle-600">Cargando...</div>
    </div>
  )
}

