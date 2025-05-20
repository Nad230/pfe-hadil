"use client"

import { useState,useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Building2, Calendar, ArrowUpRight, Clock, CheckCircle2, XCircle } from "lucide-react"
import Cookies from "js-cookie"
import { toast } from "sonner"
import { useRouter } from "next/navigation";

interface Job {
  id: string
  title: string
  companyName: string
  status: string
  publicationDate: string
  companyLogo: string
}

const statusColors = {
  applied: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
  interview: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100",
  offer: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
}

const statusEmojis = {
  applied: "📝",
  interview: "🤝",
  offer: "🎉",
  rejected: "💔"
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [isNavigating, setIsNavigating] = useState(false)

  useEffect(() => {
    const fetchChosenJobs = async () => {
      try {
        const token = Cookies.get("token")
        const response = await fetch("http://localhost:3000/project-offline-ai/aijobsChosed", {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (!response.ok) throw new Error('Failed to fetch chosen jobs')
        
        const data = await response.json()
        setJobs(data)
      } catch (error) {
        console.error("Error fetching chosen jobs:", error)
        toast.error("Failed to load chosen jobs")
      } finally {
        setLoading(false)
      }
    }

    fetchChosenJobs()
  }, [])

const successRate = Array.isArray(jobs)
  ? (jobs.filter(job => job.status === "offer").length / jobs.length) * 100 || 0
  : 0;

  const handleStatusChange = async (jobId: string, newStatus: string) => {
    try {
      const token = Cookies.get("token")
      const response = await fetch(`http://localhost:3000/project-offline-ai/updataijobs/${jobId}`, {
        method: "PUT",
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      })

      if (!response.ok) throw new Error("Failed to update status")

      setJobs(prevJobs =>
        prevJobs.map(job => 
          job.id === jobId ? { ...job, status: newStatus } : job
        )
      )
    } catch (error) {
      console.error("Error updating status:", error)
      toast.error("Failed to update status")
    }
  }
  const router = useRouter();

 
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold">Job Applications</h1>
            <p className="text-muted-foreground">
              Track and manage your job applications
            </p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Application
          </Button>
        </div>
          {loading && (
            <div className="text-center py-8">Loading your chosen jobs...</div>
          )}

          {/* Empty state - Updated to be more friendly and encouraging */}
          {!loading && jobs.length === 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <div className="max-w-md mx-auto">
                <div className="mb-6 text-6xl">🔎</div>
                <h3 className="text-2xl font-semibold mb-3">No jobs to track yet!</h3>
                <p className="text-muted-foreground mb-6">
                  You haven't applied to any jobs to track. Start by applying to some positions, 
                  and I'll be right here to help you track your progress!
                </p>
                <Button 
                  onClick={() => router.push('/jobs/search')}
                  size="lg"
                >
                  Find and Apply to Jobs
                </Button>
              </div>
            </motion.div>
          )}

          {/* Content */}
          {!loading && jobs.length > 0 && (
            <>
              {/* Stats */}
              <div className="grid gap-4 md:grid-cols-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Total Applications</p>
                      <p className="text-2xl font-bold">{jobs.length}</p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Success Rate</p>
                      <p className="text-2xl font-bold">{successRate.toFixed(0)}%</p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                      <ArrowUpRight className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Interviews</p>
                      <p className="text-2xl font-bold">
                        {jobs.filter(job => job.status === "interview").length}
                      </p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                      <Clock className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Offers</p>
                      <p className="text-2xl font-bold">
                        {jobs.filter(job => job.status === "offer").length}
                      </p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center">
                      <CheckCircle2 className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Progress */}
           <Card>
                <CardHeader>
                  <CardTitle>Application Success Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{successRate.toFixed(0)}%</span>
                    </div>
                    <Progress value={successRate} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              {/* Jobs List */}
              <div className="grid gap-4">
                {jobs.map((job, index) => (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center gap-6">
                          <div className="h-16 w-16 rounded-lg overflow-hidden">
                            <img 
                              src={job.companyLogo} 
                              alt={job.companyName}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          
                          <div className="flex-1 space-y-1">
                            <h3 className="font-semibold text-lg">{job.title}</h3>
                            <p className="text-muted-foreground">{job.companyName}</p>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              <span>{new Date(job.publicationDate).toLocaleDateString()}</span>
                            </div>

                            <Select
    value={job.status}
    onValueChange={(value) => handleStatusChange(job.id, value)}
  >
    <SelectTrigger className="w-[140px]">
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      {Object.entries(statusEmojis).map(([status, emoji]) => (
        <SelectItem key={status} value={status}>
          <span className="flex items-center gap-2">
            {emoji} {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        </SelectItem>
      ))}
    </SelectContent>
  </Select>

  <Badge className={statusColors[job.status as keyof typeof statusColors]}>
    {statusEmojis[job.status as keyof typeof statusEmojis]}{" "}
    {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
  </Badge>

  {job.status === "interview" && (
    <Button 
      variant="outline"
      onClick={async () => {
        if (isNavigating) return
        setIsNavigating(true)
        try {
          await router.push(`/jobs/${job.id}`)
          router.refresh()
        } catch (error) {
          toast.error("Failed to navigate to training")
        } finally {
          setIsNavigating(false)
        }
      }}
      disabled={isNavigating}
    >
      {isNavigating ? "Redirecting..." : "🚀 Let's Train for It"}
    </Button>
  )}

  {job.status === "offer" && (
    <Button 
      variant="default"
      className="bg-green-600 hover:bg-green-700"
      onClick={async () => {
        if (isNavigating) return
        setIsNavigating(true)
        try {
          await router.push("/freelance")
          router.refresh()
        } catch (error) {
          toast.error("Failed to navigate to projects")
        } finally {
          setIsNavigating(false)
        }
      }}
      disabled={isNavigating}
    >
      {isNavigating ? "Starting..." : "🎉 Let's Start Work"}
    </Button>
  )}
</div>
                        
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
  )
}