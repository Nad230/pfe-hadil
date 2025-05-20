// hooks/use-user.ts
import { useState, useEffect } from "react"
import Cookies from "js-cookie"

export const useUser = () => {
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const token = Cookies.get("token")
      if (!token) {
        setLoading(false)
        return
      }
      
      try {
        const response = await fetch("http://localhost:3000/auth/me", {
          headers: { Authorization: `Bearer ${token}` }
        })
        const data = await response.json()
        setCurrentUser(data)
      } catch (error) {
        console.error("Error fetching current user:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCurrentUser()
  }, [])

  return { currentUser, loading }
}