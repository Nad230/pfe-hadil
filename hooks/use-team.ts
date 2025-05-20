import { useState, useEffect } from "react"
import Cookies from "js-cookie"

export const useTeam = (projectId: string) => {
  const [teamMembers, setTeamMembers] = useState<any[]>([])
  const [projectData, setProjectData] = useState<any>(null)

  const refreshTeam = async () => {
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
      console.error("Error fetching team:", error)
    }
  }

  useEffect(() => {
    if (projectId) refreshTeam()
  }, [projectId])

  return { teamMembers, projectData, refreshTeam }
}