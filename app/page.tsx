export default function Home() {
  // Redirect handled on client side
  if (typeof window !== 'undefined') {
    window.location.href = '/login'
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-jungle-50">
      <div className="text-jungle-600 text-lg">Redirigiendo...</div>
    </div>
  )
}
