import { redirect } from 'next/navigation'

export default async function Home() {
  // Always redirect to login for now - session check disabled
  // TODO: Re-enable session check once working
  redirect('/login')

  if (session) {
    redirect('/dashboard')
  } else {
    redirect('/login')
  }
}
