"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { mockTeamMembers } from "@/lib/mock-data/team"
import Cookies from "js-cookie"
import { useToast } from "@/hooks/use-toast"


interface TeamMember {
    id: string
    fullName: string
    role: string
    avatar?: string
    taskProgress: number
    activeTasks: number
    completedTasks: number
  }

export default function TeamPage() {
    const { toast } = useToast()
  const searchParams = useSearchParams()
  const teamId = searchParams.get("teamId")
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])

  useEffect(() => {
    const fetchTeamMembers = async () => {
      if (!teamId) return

      try {
        const response = await fetch(
          `http://localhost:3000/team/${teamId}/members`,
          {
            headers: { 
              Authorization: `Bearer ${Cookies.get("token")}` 
            },
          }
        )

        if (!response.ok) throw new Error("Failed to fetch team members")

        const data = await response.json()
        
        // Map API response to TeamMember structure
        const mappedMembers = data.map((member: any) => ({
          id: member.userId,
          fullName: member.user.fullname || "Unnamed Member",
          role: member.role || "Member",
          avatar: member.profile_photo,
          taskProgress: member.taskProgress || 0,
          activeTasks: member.activeTasks || 0,
          completedTasks: member.completedTasks || 0
        }))

        setTeamMembers(mappedMembers)
      } catch (error) {
        toast({
          title: "Error loading team",
          description: error instanceof Error ? error.message : "Unknown error",
          variant: "destructive"
        })
      }
    }

    fetchTeamMembers()
  }, [teamId, toast])

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Team Members</h1>
      </div>
  
      {teamId ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {teamMembers.map((member) => (
            <Link 
              key={member.id} 
              href={`/team/${member.id}?teamId=${teamId}`}
              className="hover:shadow-lg transition-shadow"
            >
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={member.avatar} alt={member.fullName} />
                      <AvatarFallback>
                        {member.fullName.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div>
                      <h2 className="text-xl font-semibold">{member.fullName}</h2>
                      <p className="text-sm text-muted-foreground">{member.role}</p>
                    </div>
  
                    <div className="w-full space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Tasks Progress</span>
                        <span>{member.taskProgress}%</span>
                      </div>
                      <Progress value={member.taskProgress} className="h-2" />
                    </div>
  
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium">{member.activeTasks}</p>
                        <p className="text-muted-foreground">Active Tasks</p>
                      </div>
                      <div>
                        <p className="font-medium">{member.completedTasks}</p>
                        <p className="text-muted-foreground">Completed</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No team selected</p>
        </div>
      )}
    </div>
  )}