"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Calendar, Flag, ListTodo, Target } from "lucide-react"
import { differenceInDays, formatDistanceToNow } from "date-fns"
import { motion } from "framer-motion"
import { useParams, useRouter } from "next/navigation"
import Cookies from "js-cookie"
import { toast } from "sonner"

interface Project {
  id: string
  name: string
  description: string
  estimatedCompletionDate: string
  status: string
}

interface ProjectStats {
  totalMilestones: number
  totalTasks: number
  completedTasks: number
}

export function ProjectHeader() {
  const router = useRouter()
  const params = useParams()
  const [project, setProject] = useState<Project | null>(null)
  const [stats, setStats] = useState<ProjectStats | null>(null)
  const [loading, setLoading] = useState(true)

  const projectId = params.id as string

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!projectId) {
          toast.error("Invalid project ID")
          router.push("/portfolio")
          return
        }

        const token = Cookies.get("token")
        if (!token) {
          toast.error("Authentication required")
          router.push("/login")
          return
        }

        // Fetch project data and stats in parallel
        const [projectResponse, statsResponse] = await Promise.all([
          fetch(`http://localhost:3000/projects/${projectId}`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch(`http://localhost:3000/milestones/project/${projectId}/stats`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ])

        if (!projectResponse.ok) throw new Error("Failed to fetch project")
        if (!statsResponse.ok) throw new Error("Failed to fetch stats")

        const [projectData, statsData] = await Promise.all([
          projectResponse.json(),
          statsResponse.json()
        ])

        setProject(projectData)
        setStats(statsData)
      } catch (error) {
        toast.error("Failed to load project data")
        console.error("Fetch error:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [projectId, router])

  if (loading) return <div className="text-center py-8">Loading project...</div>
  if (!project) return <div className="text-center py-8">Project not found</div>

  // Calculate time-related information
  const timeInfo = {
    daysLeft: project.estimatedCompletionDate 
      ? differenceInDays(new Date(project.estimatedCompletionDate), new Date())
      : null,
    readableDate: project.estimatedCompletionDate
      ? formatDistanceToNow(new Date(project.estimatedCompletionDate), { addSuffix: true })
      : "No deadline set"
  }

  // Calculate progress using stats data
  const progress = stats && stats.totalTasks > 0 
    ? (stats.completedTasks / stats.totalTasks) * 100 
    : 0

  // Updated stats configuration using API data
  const statsConfig = [
    {
      icon: Target,
      label: "Status",
      value: project.status || "Not specified",
      color: "text-emerald-500",
      gradient: "from-emerald-500/20"
    },
    {
      icon: Calendar,
      label: "Time Remaining",
      value: timeInfo.daysLeft !== null 
        ? `${timeInfo.daysLeft} days (${timeInfo.readableDate})` 
        : timeInfo.readableDate,
      color: "text-blue-500",
      gradient: "from-blue-500/20"
    },
    {
      icon: Flag,
      label: "Milestones",
      value: stats?.totalMilestones ?? 0,
      color: "text-purple-500",
      gradient: "from-purple-500/20"
    },
    {
      icon: ListTodo,
      label: "Tasks",
      value: stats ? `${stats.completedTasks}/${stats.totalTasks}` : "0/0",
      color: "text-amber-500",
      gradient: "from-amber-500/20"
    }
  ]

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.15,
      }
    }
  }
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }
  
 
  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Project Title Section with gradient overlay */}
      <motion.div variants={itemVariants} className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-transparent rounded-lg" />
        <div className="relative p-6">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
            {project.name}
          </h1>
          <p className="text-muted-foreground mt-2">{project.description}</p>
        </div>
      </motion.div>

      {/* Interactive Stats Grid */}
      <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statsConfig.map((stat) => (
          <Card 
            key={stat.label}
            className="overflow-hidden group hover:shadow-lg transition-all duration-300"
          >
            <div className="relative p-6">
              <div className={`absolute inset-0 bg-gradient-to-r ${stat.gradient} to-transparent opacity-0 group-hover:opacity-100 transition-opacity`} />
              <div className="relative flex items-center gap-4">
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-xl font-semibold">{stat.value}</p>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </motion.div>

      {/* Animated Progress Section */}
      <motion.div variants={itemVariants}>
        <Card className="overflow-hidden">
          <div className="relative p-6">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
            <div className="relative space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">Overall Progress</h2>
                  <p className="text-sm text-muted-foreground">
                    Based on completed tasks across all milestones
                  </p>
                </div>
                <div className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
                  {Math.round(progress)}%
                </div>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent rounded-full" />
                <Progress value={progress} className="h-3 relative" />
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  )
}