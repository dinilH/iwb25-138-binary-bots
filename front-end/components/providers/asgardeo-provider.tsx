"use client"

import { ReactNode, useEffect, useState } from "react"
import dynamic from "next/dynamic"
import type { AuthReactConfig } from "@asgardeo/auth-react"

interface AsgardeoProviderProps {
  children: ReactNode
}

// Dynamically import AuthProvider to avoid SSR issues
const AuthProvider = dynamic(
  () => import("@asgardeo/auth-react").then((mod) => ({ default: mod.AuthProvider })),
  { ssr: false }
)

export function AsgardeoProvider({ children }: AsgardeoProviderProps) {
  const [isClient, setIsClient] = useState(false)
  const [config, setConfig] = useState<AuthReactConfig | null>(null)

  useEffect(() => {
    // Only run on client side
    setIsClient(true)
    
    // Import config on client side
    import("@/config/asgardeo.config").then((configModule) => {
      setConfig(configModule.asgardeoConfig)
    })
  }, [])

  // Return children without Asgardeo provider during SSR
  if (!isClient || !config) {
    return <>{children}</>
  }

  return (
    <AuthProvider config={config}>
      {children}
    </AuthProvider>
  )
}
