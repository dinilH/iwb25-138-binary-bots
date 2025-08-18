"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface User {
  id: string
  email: string
  name: string
  avatar?: string
  firstName?: string
  lastName?: string
  isEmailVerified?: boolean
  organization?: string
}

interface AuthContextType {
  user: User | null
  login: () => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
  isLoading: boolean
  isAuthenticated: boolean
  error: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Initialize - check for existing session
  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/user', {
        method: 'GET',
        credentials: 'include',
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.isAuthenticated && data.user) {
          setUser(data.user)
          setIsAuthenticated(true)
        } else {
          setUser(null)
          setIsAuthenticated(false)
        }
      } else {
        setUser(null)
        setIsAuthenticated(false)
      }
    } catch (error) {
      console.error('Error checking auth status:', error)
      setUser(null)
      setIsAuthenticated(false)
    }
    setIsLoading(false)
  }

  const login = async (): Promise<void> => {
    try {
      setError(null)
      console.log("Attempting to redirect to Asgardeo...")
      
      // Create the Asgardeo sign-in URL
      const clientId = process.env.NEXT_PUBLIC_ASGARDEO_CLIENT_ID
      const baseUrl = process.env.NEXT_PUBLIC_ASGARDEO_BASE_URL
      const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/callback`
      
      if (!clientId || !baseUrl) {
        throw new Error("Asgardeo configuration missing")
      }

      // Construct the authorization URL
      const authUrl = new URL(`${baseUrl}/oauth2/authorize`)
      authUrl.searchParams.set('client_id', clientId)
      authUrl.searchParams.set('redirect_uri', redirectUri)
      authUrl.searchParams.set('response_type', 'code')
      authUrl.searchParams.set('scope', 'openid profile email')
      authUrl.searchParams.set('state', Math.random().toString(36).substring(7))

      console.log("Redirecting to:", authUrl.toString())
      
      // Redirect to Asgardeo
      window.location.href = authUrl.toString()
      
    } catch (err) {
      console.error("Login error:", err)
      let errorMessage = "Failed to sign in. Please try again."
      
      if (err instanceof Error) {
        if (err.message.includes("configuration missing")) {
          errorMessage = "Authentication service configuration is missing."
        }
      }
      
      setError(errorMessage)
      throw err
    }
  }

  const logout = async (): Promise<void> => {
    try {
      setError(null)
      
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })
      
      if (response.ok) {
        setUser(null)
        setIsAuthenticated(false)
        console.log("Signed out successfully")
        // Optionally redirect to home page
        window.location.href = '/'
      } else {
        console.error('Logout failed')
        setError("Failed to sign out. Please try again.")
      }
    } catch (err) {
      console.error("Logout error:", err)
      setError("Failed to sign out. Please try again.")
      // Clear local state even if API call fails
      setUser(null)
      setIsAuthenticated(false)
      throw err
    }
  }

  const refreshUser = async (): Promise<void> => {
    await checkAuthStatus()
  }

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        login, 
        logout, 
        refreshUser,
        isLoading, 
        isAuthenticated,
        error 
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
