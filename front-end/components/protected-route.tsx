"use client"

import { useEffect, ReactNode } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Loader2, Shield, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface ProtectedRouteProps {
  children: ReactNode
  fallback?: ReactNode
  requireEmailVerification?: boolean
}

export function ProtectedRoute({ 
  children, 
  fallback,
  requireEmailVerification = false 
}: ProtectedRouteProps) {
  const { user, login, isLoading, isAuthenticated } = useAuth()

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#FF407D] mx-auto mb-4" />
          <p className="text-gray-600">Loading authentication...</p>
        </div>
      </div>
    )
  }

  // Show custom fallback if provided
  if (!isAuthenticated && fallback) {
    return <>{fallback}</>
  }

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-gradient-to-r from-[#FF407D] to-[#FFCAD4] rounded-full flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="text-2xl">Authentication Required</CardTitle>
            <CardDescription>
              Please sign in to access this page. We use Asgardeo for secure authentication.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button 
              onClick={login}
              className="w-full bg-gradient-to-r from-[#FF407D] to-[#FFCAD4] hover:from-[#FFCAD4] hover:to-[#FF407D] text-white"
            >
              Sign in with Asgardeo
            </Button>
            <p className="text-xs text-gray-500 mt-4">
              Your privacy and security are our top priorities
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Check email verification if required
  if (requireEmailVerification && user && !user.isEmailVerified) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="h-6 w-6 text-yellow-600" />
            </div>
            <CardTitle className="text-2xl">Email Verification Required</CardTitle>
            <CardDescription>
              Please verify your email address to access this feature. Check your inbox for a verification link.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-gray-600 mb-4">
              Signed in as: <strong>{user.email}</strong>
            </p>
            <p className="text-xs text-gray-500">
              Didn't receive the email? Check your spam folder or contact support.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Render children if authenticated (and email verified if required)
  return <>{children}</>
}

export default ProtectedRoute
