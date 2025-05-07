"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Building2, DollarSign, Clock, MapPin, ExternalLink, Search, Filter, Loader2 } from "lucide-react"
import Cookies from "js-cookie"
import { RocketIcon, ChevronDown, ChevronUp, Hash, Brain, Code, Paintbrush } from "lucide-react"
import { useRouter } from "next/navigation";

import { toast } from "sonner"

interface Job {
  id: string
  jobType: string
  publicationDate: Date
  candidateRequiredLocation: string
  title: string
  companyName: string
  companyLogo: string
  location: string
  category: string
  salary: string
  tags: string[]
  description: string
  url: string
  chosed: boolean
  status: string
}

export default function OpportunitiesPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [jobTypeFilter, setJobTypeFilter] = useState<string>("all")
  const [loading, setLoading] = useState(true)
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false)

  const [selectedCount, setSelectedCount] = useState(0);
  const toggleDescription = (jobId: string) => {
    setJobs(prevJobs => prevJobs.map(job => 
      job.id === jobId ? { ...job, isExpanded: !job.isExpanded } : job
    ))
  }
  const tagColors = [
    "bg-blue-100 text-blue-800 dark:bg-blue-900",
    "bg-green-100 text-green-800 dark:bg-green-900",
    "bg-purple-100 text-purple-800 dark:bg-purple-900",
    "bg-pink-100 text-pink-800 dark:bg-pink-900",
    "bg-orange-100 text-orange-800 dark:bg-orange-900"
  ]
  const getTagColor = (index: number) => tagColors[index % tagColors.length]

  // Category icons and colors
  const categoryStyles = {
    "AI/ML": { icon: <Brain className="h-4 w-4" />, color: "bg-purple-500/20 text-purple-600" },
    "Development": { icon: <Code className="h-4 w-4" />, color: "bg-blue-500/20 text-blue-600" },
    "Design": { icon: <Paintbrush className="h-4 w-4" />, color: "bg-pink-500/20 text-pink-600" },
    "default": { icon: <Hash className="h-4 w-4" />, color: "bg-gray-500/20 text-gray-600" }
  }

  // Job type styles
  const jobTypeStyles = {
    "Full-time": "bg-green-100 text-green-800 dark:bg-green-900",
    "Part-time": "bg-blue-100 text-blue-800 dark:bg-blue-900",
    "Contract": "bg-orange-100 text-orange-800 dark:bg-orange-900",
    "Freelance": "bg-purple-100 text-purple-800 dark:bg-purple-900"
  }

  // Truncate description function
  const truncateDescription = (text: string, maxSentences = 2) => {
    const sentences = text.split(/[.!?]\s+/)
    if (sentences.length <= maxSentences) return text
    return sentences.slice(0, maxSentences).join('. ') + '...'
  }
 

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const token = Cookies.get("token")
        const response = await fetch("http://localhost:3000/project-offline-ai/aijobs", {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (!response.ok) {
          throw new Error('Failed to fetch jobs')
        }

        const data = await response.json()
        setJobs(data)
      } catch (error) {
        toast.error("Failed to load job opportunities")
        console.error("Error fetching jobs:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchJobs()
  }, [])
  const handleChooseJob = async (jobId: string) => {
    try {
      const token = Cookies.get("token");
      const response = await fetch(
        `http://localhost:3000/project-offline-ai/updataijobs/${jobId}`, // Fixed typo in URL (updataijobs → updateaijobs)
        {
          method: "PUT",
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json' // Add content type
          },
          body: JSON.stringify({ // Add request body
            chosed: true,
            status: "Applied"
          })
        }
      );
  
      if (!response.ok) throw new Error("Failed to update job");
  
      // Update local state
      setJobs(prevJobs =>
        prevJobs.map(job =>
          job.id === jobId
            ? { ...job, chosed: true, status: "Applied" }
            : job
        )
      );
  
      toast.success("Successfully applied to job!");
    } catch (error) {
      toast.error("Failed to apply to job");
      console.error("Error applying to job:", error);
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesJobType = jobTypeFilter === "all" || job.jobType.toLowerCase() === jobTypeFilter

    return matchesSearch && matchesJobType
  })

  return (
      <div className="container mx-auto py-8 space-y-8">
      <div className="text-center space-y-4">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
        >
          🚀 AI Job Opportunities! 🤖
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-muted-foreground text-lg"
        >
          Discover the latest AI-related job opportunities
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid gap-4 md:grid-cols-[2fr,1fr] items-start"
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              📋 Job Listings
              <Badge variant="outline" className="border-pink-500 text-pink-600">
                {filteredJobs.length} Opportunities
              </Badge>
            </CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search jobs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 w-[300px]"
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
          {loading ? (
            <div className="text-center py-8">✨ Scanning the AI universe for jobs...</div>
          ) : filteredJobs.length === 0 ? (
            <div className="text-center py-8">😞 No magic found... Try different filters!</div>
          ) : (
              filteredJobs.map((job, index) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border rounded-lg p-6 space-y-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                    <h3 className="text-xl font-semibold flex items-center gap-2">
                      {job.title}
                      {job.category.includes('AI') && '🤖'}
                    </h3>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      🏢 {job.companyName}
                    </div>
                    </div>
                    <Badge className={`${categoryStyles[job.category as keyof typeof categoryStyles]?.color || categoryStyles.default.color} flex items-center gap-1`}>
                    {categoryStyles[job.category as keyof typeof categoryStyles]?.icon || categoryStyles.default.icon}
                    {job.category}
                  </Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <span className="text-2xl">📍</span>
                    <span>{job.candidateRequiredLocation || job.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={jobTypeStyles[job.jobType as keyof typeof jobTypeStyles] || 'bg-gray-100'}>
                      {job.jobType}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <span className="text-2xl">💰</span>
                    <span className={job.salary ? 'text-green-600 font-medium' : ''}>
                      {job.salary || 'Salary Confidential'}
                    </span>
                  </div>
                </div>

                  <div className="flex flex-wrap gap-2">
                    {job.tags.map(tag => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <div 
                  className="group cursor-pointer relative"
                  onClick={() => toggleDescription(job.id)}
                >
                  <p className="text-muted-foreground relative pr-8">
                    {job.isExpanded ? (
                      <>
                        {job.description}
                        <ChevronUp className="absolute right-0 top-0 h-4 w-4 text-purple-600 group-hover:animate-bounce" />
                      </>
                    ) : (
                      <>
                        {truncateDescription(job.description)}
                        {job.description.split(/[.!?]\s+/).length > 2 && (
                          <span className="text-purple-600 font-medium ml-1">
                            <ChevronDown className="inline h-4 w-4 group-hover:animate-bounce" />
                          </span>
                        )}
                      </>
                    )}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    📅 Posted {new Date(job.publicationDate).toLocaleDateString()}
                  </span>
                  <div className="flex items-center gap-4">
  <Button 
    onClick={() => handleChooseJob(job.id)}
    disabled={job.chosed}
    variant={job.chosed ? "outline" : "default"}
  >
    {job.chosed ? "✓ Applied" : "Choose this Work"}
  </Button>
  <Button 
    asChild
    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
  >
    <a href={job.url} target="_blank" rel="noopener noreferrer">
      <RocketIcon className="mr-2 h-4 w-4" />
      Launch Application
    </a>
  </Button>
</div>
                </div>
              </motion.div>
              ))
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Job Type</label>
                <Select value={jobTypeFilter} onValueChange={setJobTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select job type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="full-time">Full Time</SelectItem>
                    <SelectItem value="part-time">Part Time</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="freelance">Freelance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
  <CardHeader>
    <CardTitle>Job Alert</CardTitle>
  </CardHeader>
  <CardContent className="space-y-4">
    <p className="text-sm text-muted-foreground">
      Get notified when new AI jobs are posted
    </p>
    <Button className="w-full">
      Create Job Alert
    </Button>
  </CardContent>
</Card>

{jobs.some(job => job.chosed) && (
  <Card>
    <CardContent className="pt-6">
      <Button 
        className="w-full bg-green-600 hover:bg-green-700"
        onClick={async () => {
          if (isNavigating) return
          setIsNavigating(true)
          try {
            await router.push('/jobs')
            router.refresh() // Ensure client cache updates
          } catch (error) {
            toast.error("Failed to navigate to jobs page")
          } finally {
            setIsNavigating(false)
          }
        }}
        disabled={isNavigating}
      >
        {isNavigating ? (
          <span className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Redirecting...
          </span>
        ) : (
          `🚀 Let's start tracking your jobs (${jobs.filter(job => job.chosed).length})`
        )}
      </Button>
    </CardContent>
  </Card>
)}
        </div>
      </motion.div>
    </div>
  )
}