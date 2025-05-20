"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton"



import { 
  Brain, 
  Target, 
  Sparkles, 
  Rocket, 
  Zap, 
  Trophy,
  Crown,
  Flame,
  Shield,
  LineChart,
  Clock,
  Lightbulb
} from "lucide-react"

export default function ImplementationPlan() {
  const [strategy, setStrategy] = useState("lean")
  const [aiMilestones, setAiMilestones] = useState(false)
  const [focusScore, setFocusScore] = useState(78)
  const [indieCoins, setIndieCoins] = useState(450)
  const [task, setTask] = useState(null)
  const [aiSuggestions, setAiSuggestions] = useState(null)
const [loadingSuggestions, setLoadingSuggestions] = useState(false)
const [error, setError] = useState(null)

  const router = useRouter();



  useEffect(() => {
    async function fetchCurrentTask() {
      try {
        const response = await fetch(`http://localhost:3000/tasks/current_task`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
        })
        const data = await response.json()
        setTask(data)
        console.log("idtask from current",data.id)
      } catch (error) {
        console.error("Error fetching task:", error)
      }
    }

    fetchCurrentTask()
  }, [])

  useEffect(() => {
    async function fetchAISuggestions() {
      if (!task?.id) return
      
      try {
        setLoadingSuggestions(true)
        const response = await fetch(
          `http://localhost:3000/tasks/aitask_suggest/${task.id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${Cookies.get("token")}`,
            },
          }
        )
        
        if (!response.ok) throw new Error('Failed to fetch suggestions')
        
        const data = await response.json()
        console.log('API Response:', data) // Log full response for debugging
        
        // Set suggestions from correct path
        setAiSuggestions(data.tasks[0]?.aiSuggestions || [])
        
        // Also update the task with optimization data if needed
        if (data.tasks[0]?.aiTaskOptimization) {
          setTask(prev => ({...prev, aiTaskOptimization: data.tasks[0].aiTaskOptimization}))
        }
  
        setError(null)
      } catch (err) {
        setError(err.message)
        console.error("AI Suggestions Error:", err)
      } finally {
        setLoadingSuggestions(false)
      }
    }
  
    fetchAISuggestions()
  }, [task?.id])
  


 
  
  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-900">
              <Rocket className="h-8 w-8 text-purple-500" />
            </div>
            Implementation Planner
          </h1>
          <p className="text-muted-foreground">
            Turn your vision into reality with AI-powered planning 🚀
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-amber-100 dark:bg-amber-900/50 rounded-xl">
            <Crown className="h-5 w-5 text-amber-500" />
            <span className="font-semibold text-amber-700 dark:text-amber-300">
              {indieCoins} coins
            </span>
          </div>
          <Button className="gap-2">
            <Sparkles className="h-4 w-4" />
            Get Pro Tips
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Focus Score</p>
                <div className="text-2xl font-bold">{focusScore}%</div>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
                <Target className="h-6 w-6 text-green-500" />
              </div>
            </div>
            <Progress value={focusScore} className="mt-4" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Productivity Streak</p>
                <div className="text-2xl font-bold">7 days</div>
              </div>
              <div className="h-12 w-12 rounded-full bg-orange-100 dark:bg-orange-900/50 flex items-center justify-center">
                <Flame className="h-6 w-6 text-orange-500" />
              </div>
            </div>
            <div className="flex gap-1 mt-4">
              {Array.from({ length: 7 }).map((_, i) => (
                <div 
                  key={i}
                  className="flex-1 h-2 rounded-full bg-orange-500"
                />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Time Saved</p>
                <div className="text-2xl font-bold">12.5 hrs</div>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                <Clock className="h-6 w-6 text-blue-500" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              vs. manual planning
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">AI Insights</p>
                <div className="text-2xl font-bold">24</div>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center">
                <Lightbulb className="h-6 w-6 text-purple-500" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              Generated this week
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Strategy Selection */}
        <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Rocket className="h-6 w-6 text-purple-500" />
            Current Task
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <h2 className="text-xl font-bold">{task?.name}</h2>
            <p className="text-muted-foreground">{task?.description}</p>

            <div className="flex gap-4 mt-2">
              <Badge variant="outline">{task?.status}</Badge>
              <Badge variant="secondary">{task?.priority}</Badge>
              <Badge>{task?.type}</Badge>
            </div>

            <div className="flex items-center gap-4 mt-4 text-sm">
              <Clock className="h-4 w-4 text-gray-500" />
              <span>Start: {new Date(task?.startDate).toLocaleDateString()}</span>
              <span>Due: {new Date(task?.dueDate).toLocaleDateString()}</span>
            </div>

            <div className="mt-4">
              <p className="text-sm font-medium text-muted-foreground">Progress</p>
              <Progress value={task?.progress} />
            </div>

            {task?.milestone && (
              <div className="mt-4">
                <p className="text-sm font-medium text-muted-foreground">Milestone</p>
                <p>{task?.milestone.name}</p>
              </div>
            )}

            {task?.milestone?.project && (
              <div className="mt-4">
                <p className="text-sm font-medium text-muted-foreground">Project</p>
                <p>{task?.milestone.project.name}</p>
              </div>
            )}
             <div className="mt-6 flex justify-end">
            <Button
              onClick={() => router.push("/time-tracker")} // Navigates to Time Tracker
              className="bg-green-600 text-white hover:bg-green-700"
            >
              Let’s Start Work 😊
            </Button>
          </div>
          </div>
        </CardContent>
      </Card>
        {/* AI Planning */}
        <Card>
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      <Zap className="h-5 w-5 text-amber-500" />
      AI Task Enhancement
    </CardTitle>
  </CardHeader>
  <CardContent className="space-y-6">
    <div className="space-y-4">
      <div className="text-sm font-medium flex items-center gap-2">
        <Brain className="h-4 w-4 text-purple-500" />
        AI-Powered Recommendations
      </div>
      
      {loadingSuggestions && (
        <div className="space-y-4">
          <Skeleton className="h-[72px] w-full rounded-lg" />
          <Skeleton className="h-[72px] w-full rounded-lg" />
          <Skeleton className="h-[72px] w-full rounded-lg" />
        </div>
      )}

      {error && (
        <div className="p-4 rounded-lg bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-300">
          ⚠️ Error loading suggestions: {error}
        </div>
      )}

{aiSuggestions?.length > 0 ? (
  <div className="grid gap-2">
    {/* AI Optimization Strategy */}
    {task.aiTaskOptimization && (
      <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 mb-4">
        <div className="flex items-start gap-3">
          <Zap className="h-4 w-4 text-blue-500 mt-1 flex-shrink-0" />
          <div>
            <h4 className="font-medium mb-2">Optimization Strategy</h4>
            <p className="text-sm">{task.aiTaskOptimization}</p>
          </div>
        </div>
      </div>
    )}

    {/* AI Suggestions List */}
    {aiSuggestions.map((suggestion, i) => (
      <div 
        key={i}
        className="p-4 rounded-lg bg-muted/50 border border-transparent hover:border-purple-200 dark:hover:border-purple-800 transition-colors"
      >
        <div className="flex items-start gap-3">
          <Sparkles className="h-4 w-4 text-purple-500 mt-1 flex-shrink-0" />
          <div className="space-y-1 flex-1">
            <p className="text-sm">{suggestion}</p>
          </div>
        </div>
      </div>
    ))}
  </div>
) : (
  !loadingSuggestions && !error && (
    <div className="p-4 rounded-lg bg-muted text-center text-sm text-muted-foreground">
      No AI suggestions available for this task
    </div>
  )
)}
    </div>
  </CardContent>
</Card>
      </div>
     
  

      {/* Achievement Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            Implementation Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-4">
              <div className="font-medium">Recent Badges</div>
              <div className="flex gap-2">
                <Badge variant="outline" className="gap-1 border-purple-200 dark:border-purple-800">
                  <Zap className="h-3 w-3 text-purple-500" />
                  Quick Starter
                </Badge>
                <Badge variant="outline" className="gap-1 border-blue-200 dark:border-blue-800">
                  <LineChart className="h-3 w-3 text-blue-500" />
                  Milestone Master
                </Badge>
              </div>
            </div>

            <div className="space-y-4">
              <div className="font-medium">Current Challenge</div>
              <div className="flex items-center gap-2 text-sm">
                <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/50">
                  <Target className="h-4 w-4 text-green-500" />
                </div>
                Complete 5 deep work sessions
              </div>
            </div>

            <div className="space-y-4">
              <div className="font-medium">Next Reward</div>
              <div className="flex items-center gap-2 text-sm">
                <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/50">
                  <Crown className="h-4 w-4 text-amber-500" />
                </div>
                100 indie coins (2/5 completed)
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}