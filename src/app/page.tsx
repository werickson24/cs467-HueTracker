import { auth } from "@/lib/auth"
import { redirect } from 'next/navigation'
import HomePage from '@/components/homepage';

export default async function Home() {
  // Check authentication
  const session = await auth()

  // If user is logged in, redirect to dashboard
  if (session?.user) {
    redirect('/dashboard')
  }

  return (
    <HomePage/>
  )
}