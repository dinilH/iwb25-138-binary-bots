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
  const [asgardeoAuth, setAsgardeoAuth] = useState<any>(null)

  // Initialize Asgardeo on client side only
  useEffect(() => {
    const initAsgardeo = async () => {
      try {
        if (typeof window !== 'undefined') {
          // Dynamic import to avoid SSR issues
          const { AsgardeoSPAClient } = await import("@asgardeo/auth-spa")
          
          const config = {
            signInRedirectURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
            signOutRedirectURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
            clientID: process.env.NEXT_PUBLIC_ASGARDEO_CLIENT_ID || "",
            baseUrl: process.env.NEXT_PUBLIC_ASGARDEO_BASE_URL || "",
            scope: ["openid", "profile", "email"],
            resourceServerURLs: [],
            enablePKCE: true,
            clockTolerance: 300,
            endpoints: {
              authorizationEndpoint: "/oauth2/authorize",
              tokenEndpoint: "/oauth2/token",
              userinfoEndpoint: "/oauth2/userinfo",
              logoutEndpoint: "/oidc/logout",
              revokeTokenEndpoint: "/oauth2/revoke"
            },
            validateIDToken: true,
            storage: "localStorage"
          }

          const authClient = AsgardeoSPAClient.getInstance()
          if (authClient) {
            await authClient.initialize(config)
            
            setAsgardeoAuth(authClient)
            
            // Check if user is already authenticated
            const isAuth = await authClient.isAuthenticated()
            if (isAuth) {
              const basicUserInfo = await authClient.getBasicUserInfo()
              if (basicUserInfo) {
                setUser({
                  id: basicUserInfo.sub || "unknown",
                  email: basicUserInfo.email || "",
                  name: basicUserInfo.name || basicUserInfo.given_name || "User",
                  firstName: basicUserInfo.given_name,
                  lastName: basicUserInfo.family_name,
                  avatar: basicUserInfo.picture || "/placeholder-user.jpg",
                  isEmailVerified: basicUserInfo.email_verified || false
                })
                setIsAuthenticated(true)
              }
            }
          }
          
          setIsLoading(false)
        }
      } catch (err) {
        console.error("Failed to initialize Asgardeo:", err)
        setError("Failed to initialize authentication")
        setIsLoading(false)
      }
    }

    initAsgardeo()
  }, [])

  const login = async (): Promise<void> => {
    try {
      setError(null)
      
      if (!asgardeoAuth) {
        throw new Error("Authentication not initialized")
      }

      console.log("Redirecting to Asgardeo login...")
      // This will redirect to Asgardeo login page
      await asgardeoAuth.signIn()
      
    } catch (err) {
      console.error("Login error:", err)
      let errorMessage = "Failed to sign in. Please try again."
      
      if (err instanceof Error) {
        if (err.message.includes("redirect_uri_mismatch")) {
          errorMessage = "Redirect URI mismatch. Please check your Asgardeo app configuration."
        } else if (err.message.includes("invalid_client")) {
          errorMessage = "Invalid client configuration. Please check your Client ID."
        } else if (err.message.includes("access_denied")) {
          errorMessage = "Access denied. Please check your permissions."
        }
        console.error("Detailed error:", err.message)
      }
      
      setError(errorMessage)
      throw err
    }
  }

  const logout = async (): Promise<void> => {
    try {
      setError(null)
      
      if (asgardeoAuth) {
        await asgardeoAuth.signOut()
      }
      
      setUser(null)
      setIsAuthenticated(false)
      console.log("Signed out successfully")
    } catch (err) {
      console.error("Logout error:", err)
      setError("Failed to sign out. Please try again.")
      throw err
    }
  }

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        login, 
        logout, 
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
