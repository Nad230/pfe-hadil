"use client"

import { useState, useEffect } from "react"

interface User {
  id: string
  fullname: string
  profile_photo?: string | null
  accessToken: string
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = () => {
      try {
        const accessToken = localStorage.getItem("access_token")
        const userData = localStorage.getItem("user_data")

        if (accessToken && userData) {
          const parsedUser = JSON.parse(userData)
          setUser({
            ...parsedUser,
            accessToken
          })
          setIsAuthenticated(true)
        } else {
          setUser(null)
          setIsAuthenticated(false)
        }
      } catch (error) {
        console.error("Error checking auth:", error)
        setUser(null)
        setIsAuthenticated(false)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()

    // Listen for storage changes
    const handleStorageChange = () => checkAuth()
    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [])

  return { user, isAuthenticated, loading }
}