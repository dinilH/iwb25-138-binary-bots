"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

interface WellnessEntry {
  date: string
  mood: number
  energy: number
  sleep: number
  sleepQuality: number
  stress: number
  water: number
  exercise: string
  symptoms: string[]
  notes: string
}

interface WellnessContextType {
  addWellnessEntry: (entry: WellnessEntry) => void
  getWellnessHistory: () => WellnessEntry[]
  getWellnessForDate: (date: string) => WellnessEntry | null
  updateWellnessEntry: (date: string, entry: Partial<WellnessEntry>) => void
}

const WellnessContext = createContext<WellnessContextType | undefined>(undefined)

export function WellnessProvider({ children }: { children: React.ReactNode }) {
  const [wellnessEntries, setWellnessEntries] = useState<WellnessEntry[]>([])

  useEffect(() => {
    const stored = localStorage.getItem("wellness-entries")
    if (stored) {
      setWellnessEntries(JSON.parse(stored))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("wellness-entries", JSON.stringify(wellnessEntries))
  }, [wellnessEntries])

  const addWellnessEntry = (entry: WellnessEntry) => {
    setWellnessEntries((prev) => {
      const filtered = prev.filter((e) => e.date !== entry.date)
      return [entry, ...filtered].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    })
  }

  const getWellnessHistory = () => {
    return wellnessEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }

  const getWellnessForDate = (date: string) => {
    return wellnessEntries.find((entry) => entry.date === date) || null
  }

  const updateWellnessEntry = (date: string, updatedEntry: Partial<WellnessEntry>) => {
    setWellnessEntries((prev) => prev.map((entry) => (entry.date === date ? { ...entry, ...updatedEntry } : entry)))
  }

  return (
    <WellnessContext.Provider
      value={{
        addWellnessEntry,
        getWellnessHistory,
        getWellnessForDate,
        updateWellnessEntry,
      }}
    >
      {children}
    </WellnessContext.Provider>
  )
}

export function useWellness() {
  const context = useContext(WellnessContext)
  if (context === undefined) {
    throw new Error("useWellness must be used within a WellnessProvider")
  }
  return context
}
