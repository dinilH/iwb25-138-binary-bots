"use client"

import { ReactNode, useEffect, useState } from "react"
import dynamic from "next/dynamic"
import type { AuthReactConfig } from "@asgardeo/auth-react"

interface AsgardeoProviderProps {
  children: ReactNode
}


const AuthProvider = dynamic(
  () => import("@asgardeo/auth-react").then((mod) => ({ default: mod.AuthProvider })),
  { ssr: false }
)

export function AsgardeoProvider({ children }: AsgardeoProviderProps) {
  const [isClient, setIsClient] = useState(false)
  const [config, setConfig] = useState<AuthReactConfig | null>(null)

  useEffect(() => {
    
    setIsClient(true)
    
    
    import("@/config/asgardeo.config").then((configModule) => {
      setConfig(configModule.asgardeoConfig)
    })
  }, [])

  
  if (!isClient || !config) {
    return <>{children}</>
  }

  return (
    <AuthProvider config={config}>
      {children}
    </AuthProvider>
  )
}
