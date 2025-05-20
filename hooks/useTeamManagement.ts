import { useState, useEffect } from "react"
import Cookies from "js-cookie"

export const useTeamManagement = (projectId: string) => {
  const [teamMembers, setTeamMembers] = useState<any[]>([])
  const [projectData, setProjectData] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchedUser, setSearchedUser] = useState<any>(null)
  const [errorMessage, setErrorMessage] = useState("")

  const fetchProjectAndTeam = async () => {
    try {
      const token = Cookies.get("token")
      const projectResponse = await fetch(`http://localhost:3000/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await projectResponse.json()
      setProjectData(data)

      if (data.team) {
        const members = await Promise.all(
          data.team.members.map(async (member: any) => {
            const userResponse = await fetch(`http://localhost:3000/auth/${member.userId}`, {
              headers: { Authorization: `Bearer ${token}` }
            })
            return userResponse.json()
          })
        )
        setTeamMembers(members)
      }
    } catch (error) {
      console.error("Error fetching project or team members:", error)
    }
  }

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

  return {
    teamMembers,
    projectData,
    searchQuery,
    setSearchQuery,
    searchedUser,
    errorMessage,
    fetchProjectAndTeam,
    handleSearch
  }
}