"use client"

import { useState, useEffect } from "react"

export function useDailyCheckin() {
  const [shouldShowCheckin, setShouldShowCheckin] = useState(false)
  const [hasCheckedIn, setHasCheckedIn] = useState(true)

  useEffect(() => {
    // Vérifier si l'utilisateur s'est déjà connecté aujourd'hui
    const lastCheckin = localStorage.getItem("lastCheckin")
    const today = new Date().toISOString().split("T")[0]

    if (lastCheckin !== today) {
      setShouldShowCheckin(true)
      setHasCheckedIn(false)
    } else {
      setShouldShowCheckin(false)
      setHasCheckedIn(true)
    }
  }, [])

  const completeCheckin = () => {
    const today = new Date().toISOString().split("T")[0]
    localStorage.setItem("lastCheckin", today)
    setShouldShowCheckin(false)
    setHasCheckedIn(true)
  }

  const resetCheckin = () => {
    localStorage.removeItem("lastCheckin")
    setShouldShowCheckin(true)
    setHasCheckedIn(false)
  }

  return {
    shouldShowCheckin,
    hasCheckedIn,
    completeCheckin,
    resetCheckin,
  }
}
