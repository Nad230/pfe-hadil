"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, ExternalLink, Users, MessageSquare, Pencil, Trash } from "lucide-react"
import { useEffect, useState } from "react"
import Cookies from "js-cookie"
import Link from "next/link"
import { EditProjectDialog } from "@/components/projects/edit-project-dialog"
import { DeleteProjectDialog } from "@/components/projects/delete-project-dialog"
import { AddProjectDialog } from "@/components/projects/add-project-dialog"

const DEFAULT_COVER = "https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"

const DEFAULT_USER_PHOTO = "https://cdn-icons-png.flaticon.com/512/3177/3177440.png";

interface Project {
  id: string
  title: string
  description: string
  userId: string
  teamId?: string
  coverPhoto?: string
  tags?: string[]
  comments?: any[]
  owner?: {
    fullname: string
    profile_photo: string
  }
  teamMembersCount?: number
}
interface AddProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  refreshProjects: () => void; // Make sure this line exists
}
export default function PortfolioPage() {
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [selectedProject, setSelectedProject] = useState<any | null>(null)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  


  const [showAddDialog, setShowAddDialog] = useState(false)


   const fetchProjects = async () => {
    try {
      const response = await fetch("http://localhost:3000/projects", {
        headers: { Authorization: `Bearer ${Cookies.get("token")}` }
      })
      if (!response.ok) throw new Error("Failed to fetch projects")
      const data = await response.json()

      const projectsWithDetails = await Promise.all(
        data.map(async (project: Project) => {
          // Fetch owner details
          const ownerResponse = await fetch(`http://localhost:3000/auth/${project.userId}`, {
            headers: { Authorization: `Bearer ${Cookies.get("token")}` }
          })
          const ownerData = await ownerResponse.json()

          // Fetch team member count if team exists
          let teamMembersCount = 0
         if (project.teamId) {
  const teamResponse = await fetch(`http://localhost:3000/team/${project.teamId}/Nbmembers`, {
    headers: { Authorization: `Bearer ${Cookies.get("token")}` }
  })

  if (!teamResponse.ok) {
    console.error(`Failed to fetch team members count for team ${project.teamId}`)
  } else {
    const teamData = await teamResponse.json()
    if (typeof teamData === "number") {
      teamMembersCount = teamData
    } else {
      console.warn("Unexpected team member count format:", teamData)
    }
  }
}

          return {
            ...project,
            owner: {
              fullname: ownerData.fullname,
              profile_photo: ownerData.profile_photo
            },
            teamMembersCount
          }
        })
      )

      setProjects(projectsWithDetails)
    } catch (error) {
      console.error("Failed to load projects", error)
      setProjects([])
    } finally {
      setLoading(false)
    }
  }

  

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch("http://localhost:3000/auth/me", {
        headers: { Authorization: `Bearer ${Cookies.get("token")}` }
      })
      const user = await response.json()
      setCurrentUserId(user?.sub || null)
    } catch (error) {
      console.error("Error fetching user:", error)
    }
  }

  useEffect(() => {
    fetchCurrentUser()
    fetchProjects()
  }, [])

  const deleteProject = async (projectId: string) => {
    try {
      await fetch(`http://localhost:3000/projects/${projectId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${Cookies.get("token")}` }
      })
      fetchProjects()
    } catch (error) {
      console.error("Error deleting project:", error)
    }
  }

  if (loading) return <div className="container py-8 text-center">Loading...</div>

  return (
    <div className="container py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Portfolio</h1>
          <p className="text-muted-foreground">Showcase your best work</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Project
        </Button>
      </div>

      {projects.length === 0 ? (
       <div className="text-center py-16 space-y-4">
       <h2 className="text-2xl font-semibold">Create your first project</h2>
       <p className="text-muted-foreground">Get started by adding a new project to showcase your work.</p>
       <Button onClick={() => setShowAddDialog(true)}>
         <Plus className="mr-2 h-4 w-4" />
         Add Project
       </Button>
     </div>
     
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => {
            const isOwner = currentUserId === project.userId
            
            return (
              <Card key={project.id} className="relative group">
                <Link href={`/project/${project.id}`} className="block">
                  <div className="aspect-video relative overflow-hidden">
                    <img
                      src={project.coverPhoto || DEFAULT_COVER}
                      alt={project.title}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                    {isOwner && (
                      <div className="absolute top-2 right-2 flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 bg-background/80 hover:bg-background"
                          onClick={(e) => {
                            e.preventDefault()
                            setSelectedProject(project)
                            setShowEditDialog(true)
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 bg-background/80 hover:bg-background"
                          onClick={(e) => {
                            e.preventDefault()
                            setSelectedProject(project)
                            setShowDeleteDialog(true)
                          }}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold text-xl">{project.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {project.description}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {project.tags?.map((tag: string) => (
                          <Badge key={tag} variant="secondary">{tag}</Badge>
                        ))}
                      </div>

                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        {project.teamMembersCount || 0} members
                      </div>
                      <div className="flex items-center gap-2">
                        {project.owner && (
                          <>
                            <img 
                              src={project.owner.profile_photo || DEFAULT_USER_PHOTO} 
                              className="h-4 w-4 rounded-full" 
                              alt={project.owner.fullname}
                            />
                            <span>{project.owner.fullname}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Link>
              </Card>
            )
          })}
        </div>
      )}

      <EditProjectDialog
        project={selectedProject}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        onSubmit={() => {
          setShowEditDialog(false)
          fetchProjects()
        }}
      />

      <DeleteProjectDialog
        project={selectedProject}
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={() => {
          if (selectedProject) deleteProject(selectedProject.id)
          setShowDeleteDialog(false)
        }}
      />

<AddProjectDialog
  open={showAddDialog}
  onOpenChange={setShowAddDialog}
  refreshProjects={fetchProjects} // Add this line
/>
    </div>
  )
}