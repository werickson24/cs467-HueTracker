import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function Home() {
  const session = await getServerSession(authOptions)

  // If user is logged in, redirect to dashboard
  if (session) {
    redirect('/dashboard')
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-center">
            Filament Manager
          </h1>
          <p className="mt-2 text-center text-gray-600">
            Track and manage your 3D printing filaments
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <Link
            href="/login"
            className="w-full px-4 py-2 text-center text-white bg-blue-600 rounded hover:bg-blue-700"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="w-full px-4 py-2 text-center text-blue-600 border border-blue-600 rounded hover:bg-blue-50"
          >
            Create Account
          </Link>
        </div>
      </div>
    </div>
  )
}