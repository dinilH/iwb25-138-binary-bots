"use client"

import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AuthDebugComponent() {
  const { user, login, logout, isLoading, isAuthenticated, error } = useAuth()

  const handleLogin = async () => {
    try {
      await login()
    } catch (err) {
      console.error("Login failed:", err)
    }
  }

  return (
    <Card className="max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle>Asgardeo Auth Debug</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <strong>Status:</strong> {isLoading ? "Loading..." : isAuthenticated ? "Authenticated" : "Not Authenticated"}
        </div>
        
        {error && (
          <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            <strong>Error:</strong> {error}
          </div>
        )}
        
        {user && (
          <div className="p-3 bg-green-100 border border-green-400 text-green-700 rounded">
            <strong>User:</strong> {user.name} ({user.email})
          </div>
        )}
        
        <div className="space-y-2">
          {!isAuthenticated ? (
            <Button onClick={handleLogin} disabled={isLoading} className="w-full">
              {isLoading ? "Signing in..." : "Sign In with Asgardeo"}
            </Button>
          ) : (
            <Button onClick={logout} variant="outline" className="w-full">
              Sign Out
            </Button>
          )}
        </div>
        
        <div className="text-xs text-gray-600 space-y-1">
          <div><strong>Client ID:</strong> {process.env.NEXT_PUBLIC_ASGARDEO_CLIENT_ID}</div>
          <div><strong>Base URL:</strong> {process.env.NEXT_PUBLIC_ASGARDEO_BASE_URL}</div>
          <div><strong>App URL:</strong> {process.env.NEXT_PUBLIC_APP_URL}</div>
        </div>
      </CardContent>
    </Card>
  )
}
