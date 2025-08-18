"use client"

import { ReactNode } from 'react'

interface AsgardeoProviderProps {
  children: ReactNode
}


export function AsgardeoProvider({ children }: AsgardeoProviderProps) {
  return <>{children}</>
}
