'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'

export default function AuthSuccess() {
  const router = useRouter()
  const { refreshUser } = useAuth()

  useEffect(() => {
    // Refresh user data after successful authentication
    refreshUser().then(() => {
      // Redirect to dashboard or home page after a short delay
      setTimeout(() => {
        router.push('/')
      }, 2000)
    })
  }, [refreshUser, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50">
      <div className="max-w-md w-full mx-auto p-6">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Login Successful!</h1>
          <p className="text-gray-600 mb-6">
            Welcome to SheCare. You have been successfully authenticated.
          </p>
          
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-pink-500 border-t-transparent"></div>
            <span className="ml-2 text-sm text-gray-500">Redirecting to dashboard...</span>
          </div>
        </div>
      </div>
    </div>
  )
}
