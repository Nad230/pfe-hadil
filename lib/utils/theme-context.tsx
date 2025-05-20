
"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useLocalStorage } from "@/hooks/use-local-storage"

type Mood = "joyful" | "calm" | "focused" | "dreamy" | "energetic" | "mysterious"
type TimeOfDay = "dawn" | "morning" | "afternoon" | "evening" | "night"

interface ThemeContextType {
  mood: Mood
  setMood: (mood: Mood) => void
  timeOfDay: TimeOfDay
  themeColor: string
  themeSecondary: string
  themeAccent: string
  themeName: string
  discoveredThemes: string[]
  unlockTheme: (theme: string) => void
  setCustomTheme: (theme: {
    primary: string
    secondary: string
    accent: string
    name: string
  }) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mood, setMood] = useState<Mood>("calm")
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>("afternoon")
  const [themeColor, setThemeColor] = useState("#6366f1")
  const [themeSecondary, setThemeSecondary] = useState("#818cf8")
  const [themeAccent, setThemeAccent] = useState("#c4b5fd")
  const [themeName, setThemeName] = useState("default")

  const [discoveredThemes, setDiscoveredThemes] = useLocalStorage<string[]>("discovered-themes", [])

  // Determine time of day
  useEffect(() => {
    const updateTimeOfDay = () => {
      const hour = new Date().getHours()
      if (hour >= 5 && hour < 8) setTimeOfDay("dawn")
      else if (hour >= 8 && hour < 12) setTimeOfDay("morning")
      else if (hour >= 12 && hour < 17) setTimeOfDay("afternoon")
      else if (hour >= 17 && hour < 21) setTimeOfDay("evening")
      else setTimeOfDay("night")
    }

    updateTimeOfDay()
    const interval = setInterval(updateTimeOfDay, 60000)
    return () => clearInterval(interval)
  }, [])

  // Update theme based on time of day and mood
  useEffect(() => {
    const updateTheme = () => {
      let primary = "#6366f1"
      let secondary = "#818cf8"
      let accent = "#c4b5fd"
      let name = "default"

      // Time-based themes
      if (timeOfDay === "dawn") {
        primary = "#f97316"
        secondary = "#fdba74"
        accent = "#ffedd5"
        name = "dawn"
      } else if (timeOfDay === "morning") {
        primary = "#0ea5e9"
        secondary = "#7dd3fc"
        accent = "#e0f2fe"
        name = "morning"
      } else if (timeOfDay === "afternoon") {
        primary = "#6366f1"
        secondary = "#818cf8"
        accent = "#c4b5fd"
        name = "afternoon"
      } else if (timeOfDay === "evening") {
        primary = "#8b5cf6"
        secondary = "#a78bfa"
        accent = "#ddd6fe"
        name = "evening"
      } else if (timeOfDay === "night") {
        primary = "#1e293b"
        secondary = "#334155"
        accent = "#94a3b8"
        name = "night"
      }

      // Mood modifiers
      if (mood === "joyful") {
        primary = "#f59e0b"
        secondary = "#fbbf24"
        accent = "#fef3c7"
        name = `joyful-${timeOfDay}`
      } else if (mood === "calm") {
        primary = "#0ea5e9"
        secondary = "#38bdf8"
        accent = "#bae6fd"
        name = `calm-${timeOfDay}`
      } else if (mood === "focused") {
        primary = "#4f46e5"
        secondary = "#6366f1"
        accent = "#c7d2fe"
        name = `focused-${timeOfDay}`
      } else if (mood === "dreamy") {
        primary = "#8b5cf6"
        secondary = "#a78bfa"
        accent = "#ddd6fe"
        name = `dreamy-${timeOfDay}`
      } else if (mood === "energetic") {
        primary = "#ef4444"
        secondary = "#f87171"
        accent = "#fee2e2"
        name = `energetic-${timeOfDay}`
      } else if (mood === "mysterious") {
        primary = "#6b21a8"
        secondary = "#8b5cf6"
        accent = "#ddd6fe"
        name = `mysterious-${timeOfDay}`
      }

      setThemeColor(primary)
      setThemeSecondary(secondary)
      setThemeAccent(accent)
      setThemeName(name)

      // Apply theme to document
      document.documentElement.style.setProperty("--theme-primary", primary)
      document.documentElement.style.setProperty("--theme-secondary", secondary)
      document.documentElement.style.setProperty("--theme-accent", accent)
    }

    updateTheme()
  }, [timeOfDay, mood])

  const unlockTheme = (theme: string) => {
    if (!discoveredThemes.includes(theme)) {
      setDiscoveredThemes([...discoveredThemes, theme])
    }
  }

  const setCustomTheme = (theme: { primary: string; secondary: string; accent: string; name: string }) => {
    setThemeColor(theme.primary)
    setThemeSecondary(theme.secondary)
    setThemeAccent(theme.accent)
    setThemeName(theme.name)

    document.documentElement.style.setProperty("--theme-primary", theme.primary)
    document.documentElement.style.setProperty("--theme-secondary", theme.secondary)
    document.documentElement.style.setProperty("--theme-accent", theme.accent)
  }

  return (
    <ThemeContext.Provider
      value={{
        mood,
        setMood,
        timeOfDay,
        themeColor,
        themeSecondary,
        themeAccent,
        themeName,
        discoveredThemes,
        unlockTheme,
        setCustomTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
