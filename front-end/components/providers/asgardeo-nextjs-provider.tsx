"use client"

import { ReactNode } from 'react'

interface AsgardeoProviderProps {
  children: ReactNode
}

// For now, we'll use a simple wrapper and implement Asgardeo step by step
export function AsgardeoProvider({ children }: AsgardeoProviderProps) {
  return <>{children}</>
}
