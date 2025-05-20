import { useState } from "react"
import Cookies from "js-cookie"

export const useUserSearch = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchedUser, setSearchedUser] = useState<any>(null)
  const [errorMessage, setErrorMessage] = useState("")

  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    try {
      const token = Cookies.get("token")
      const response = await fetch(
        `http://localhost:3000/auth/search?name=${encodeURIComponent(searchQuery)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      const data = await response.json()

      if (!response.ok) {
        setErrorMessage("No users found")
        setSearchedUser(null)
        return
      }

      setSearchedUser(data)
      setErrorMessage("")
    } catch (error) {
      setErrorMessage("An error occurred. Please try again.")
    }
  }

  return { searchQuery, setSearchQuery, searchedUser, errorMessage, handleSearch }
}