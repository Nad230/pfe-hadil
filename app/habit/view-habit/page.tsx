"use client"

import { useState, useEffect, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Calendar,
  BarChart2,
  TrendingUp,
  Award,
  CheckCircle,
  Clock,
  AlertCircle,
  Activity,
  RefreshCw,
  History,
} from "lucide-react"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { ErrorMessage } from "@/components/ui/error-message"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import type { Habit } from "@/lib/types/habits"
import { HabitCompletionForm } from "@/components/habits/habit-completion-form"

interface WeekData {
  startDate: Date
  endDate: Date
  completions: number
  target: number
  isTargetMet: boolean
  isComplete: boolean
}

export default function ViewHabitPage() {
  const searchParams = useSearchParams()
  const selectedId = searchParams.get("id")
  const activeTab = searchParams.get("tab") || "history"

  const [habits, setHabits] = useState<Habit[]>([])
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [weeklyProgress, setWeeklyProgress] = useState({ completed: 0, target: 0, percentage: 0 })
  const [weeklyHistory, setWeeklyHistory] = useState<WeekData[]>([])

  // Check authentication on component mount
  useEffect(() => {
    const token = localStorage.getItem("token") || localStorage.getItem("access_token")
    if (token) {
      setIsAuthenticated(true)
    } else {
      setError("Authentication required. Please log in.")
    }
  }, [])

  const fetchHabits = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      // Get token from localStorage (try both possible token names)
      const token = localStorage.getItem("token") || localStorage.getItem("access_token")
      if (!token) {
        setIsAuthenticated(false)
        setError("Authentication required. Please log in.")
        setLoading(false)
        return
      }

      console.log("Fetching habits from:", process.env.NEXT_PUBLIC_BACKEND_URL)

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/habits`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      // Try to parse response even if it's an error
      const responseData = await response.json().catch(() => null)
      console.log("Response status:", response.status)

      if (!response.ok) {
        // Extract error message from response if available
        const errorMessage = responseData?.message || `Failed to fetch habits: ${response.status}`
        throw new Error(errorMessage)
      }

      setHabits(responseData)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch habits"
      setError(errorMessage)
      console.error("Error fetching habits:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchHabits()
  }, [fetchHabits])

  useEffect(() => {
    if (habits.length > 0) {
      // First priority: URL parameter
      if (selectedId) {
        const habit = habits.find((h) => h.id === selectedId)
        if (habit) {
          setSelectedHabit(habit)
          calculateWeeklyProgress(habit)
          calculateWeeklyHistory(habit)
          // Store in localStorage for persistence
          localStorage.setItem("selectedHabitId", habit.id)
          return
        }
      }

      // Second priority: localStorage
      const storedHabitId = localStorage.getItem("selectedHabitId")
      if (storedHabitId) {
        const habit = habits.find((h) => h.id === storedHabitId)
        if (habit) {
          setSelectedHabit(habit)
          calculateWeeklyProgress(habit)
          calculateWeeklyHistory(habit)

          // Update URL without full navigation if it doesn't match
          if (selectedId !== storedHabitId) {
            const url = new URL(window.location.href)
            url.searchParams.set("id", storedHabitId)
            window.history.pushState({}, "", url.toString())
          }
          return
        }
      }

      // Fallback: first habit in the list
      if (!selectedHabit) {
        setSelectedHabit(habits[0])
        calculateWeeklyProgress(habits[0])
        calculateWeeklyHistory(habits[0])
        localStorage.setItem("selectedHabitId", habits[0].id)

        // Update URL without full navigation
        const url = new URL(window.location.href)
        url.searchParams.set("id", habits[0].id)
        window.history.pushState({}, "", url.toString())
      }
    }
  }, [habits, selectedId, selectedHabit])

  // Update the calculateWeeklyProgress function to ensure it properly resets
  const calculateWeeklyProgress = (habit: Habit) => {
    // If there are no completions, return 0 progress
    if (!habit.completions || habit.completions.length === 0) {
      return {
        completed: 0,
        target: habit.weeklyTarget,
        percentage: 0,
        startDate: new Date(habit.updatedAt),
        endDate: new Date(new Date(habit.updatedAt).setDate(new Date(habit.updatedAt).getDate() + 6)),
        daysLeft: 7,
      }
    }

    // Get the habit's updated date (which is reset when restarting)
    const habitStartDate = new Date(habit.updatedAt)
    habitStartDate.setHours(0, 0, 0, 0)

    // Calculate the end of the 7-day period
    const habitEndDate = new Date(habitStartDate)
    habitEndDate.setDate(habitStartDate.getDate() + 6)
    habitEndDate.setHours(23, 59, 59, 999)

    // Current date for comparison
    const today = new Date()

    // Find completions for the current 7-day period
    const currentPeriodCompletions = habit.completions.filter((completion) => {
      const completionDate = new Date(completion.date)
      // Normalize hours to avoid timezone issues
      completionDate.setHours(12, 0, 0, 0)
      return completionDate >= habitStartDate && completionDate <= habitEndDate && completion.completed
    })

    const completed = currentPeriodCompletions.length
    const percentage = habit.weeklyTarget > 0 ? Math.min(100, Math.round((completed / habit.weeklyTarget) * 100)) : 0

    // Calculate days left in the period
    const daysLeft = Math.max(0, Math.ceil((habitEndDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)))

    return {
      completed,
      target: habit.weeklyTarget,
      percentage,
      startDate: habitStartDate,
      endDate: habitEndDate,
      daysLeft,
    }
  }

  // Update the calculateWeeklyHistory function to ensure it properly resets
  const calculateWeeklyHistory = (habit: Habit) => {
    if (!habit) {
      setWeeklyHistory([])
      return
    }

    const completions = habit.completions || []
    const today = new Date()

    // Get the habit's creation/update date
    const habitStartDate = new Date(habit.updatedAt)
    habitStartDate.setHours(0, 0, 0, 0)

    // If there are no completions and the habit was recently reset,
    // just show one week with 0 progress
    if (completions.length === 0) {
      const periodEnd = new Date(habitStartDate)
      periodEnd.setDate(habitStartDate.getDate() + 6)
      periodEnd.setHours(23, 59, 59, 999)

      setWeeklyHistory([
        {
          startDate: habitStartDate,
          endDate: periodEnd,
          completions: 0,
          target: habit.weeklyTarget,
          isTargetMet: false,
          isComplete: false,
        },
      ])
      return
    }

    // Sort completions by date
    const sortedCompletions = [...completions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    // Calculate how many 7-day periods have passed since habit creation/restart
    const daysSinceStart = Math.floor((today.getTime() - habitStartDate.getTime()) / (1000 * 60 * 60 * 24))
    const periodsPassed = Math.max(1, Math.ceil(daysSinceStart / 7))

    // Create an array of periods
    const periods: WeekData[] = []

    for (let i = 0; i < periodsPassed; i++) {
      const periodStart = new Date(habitStartDate)
      periodStart.setDate(habitStartDate.getDate() + i * 7)

      const periodEnd = new Date(periodStart)
      periodEnd.setDate(periodStart.getDate() + 6)
      periodEnd.setHours(23, 59, 59, 999)

      // Find completions for this period
      const periodCompletions = sortedCompletions.filter((completion) => {
        const completionDate = new Date(completion.date)
        return completionDate >= periodStart && completionDate <= periodEnd && completion.completed
      })

      const completedCount = periodCompletions.length

      periods.push({
        startDate: periodStart,
        endDate: periodEnd,
        completions: completedCount,
        target: habit.weeklyTarget,
        isTargetMet: completedCount >= habit.weeklyTarget,
        isComplete: today > periodEnd,
      })
    }

    // Sort periods by date (newest first)
    periods.sort((a, b) => b.startDate.getTime() - a.startDate.getTime())

    setWeeklyHistory(periods)
  }

  const getStatusColor = (status: Habit["status"]) => {
    switch (status) {
      case "InProgress":
        return "bg-green-500"
      case "Completed":
        return "bg-blue-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusBadge = (status: Habit["status"]) => {
    switch (status) {
      case "InProgress":
        return <Badge className="bg-green-500">In Progress</Badge>
      case "Completed":
        return <Badge className="bg-blue-500">Completed</Badge>
      default:
        return <Badge variant="outline">Not Started</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
  }

  // Calculate completion rate
  const calculateCompletionRate = (habit: Habit) => {
    const completions = habit.completions || []
    if (completions.length === 0) return 0

    const completedCount = completions.filter((c) => c.completed).length
    return Math.round((completedCount / completions.length) * 100)
  }

  // Handle completion added
  const handleCompletionAdded = () => {
    fetchHabits()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-4xl font-bold text-center mb-2">Habit Analytics</h1>
          <p className="text-center text-gray-600 dark:text-gray-300 mb-8">
            Track your progress and visualize your growth
          </p>

          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : error ? (
            <ErrorMessage message={error} onRetry={fetchHabits} />
          ) : habits.length === 0 ? (
            <Card className="max-w-md mx-auto p-8 text-center">
              <Clock className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">No habits found</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">You haven't created any habits yet.</p>
              <Button asChild>
                <Link href="/habit/new-habits">Create your first habit</Link>
              </Button>
            </Card>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                      <span>Your Habits</span>
                      <Button variant="ghost" size="sm" onClick={fetchHabits} title="Refresh habits">
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {habits.map((habit) => (
                        <Button
                          key={habit.id}
                          variant={selectedHabit?.id === habit.id ? "default" : "outline"}
                          className="w-full justify-start mb-2 relative overflow-hidden group"
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedHabit(habit)
                            calculateWeeklyProgress(habit)
                            calculateWeeklyHistory(habit)

                            // Update URL without full navigation
                            const url = new URL(window.location.href)
                            url.searchParams.set("id", habit.id)
                            window.history.pushState({}, "", url.toString())
                          }}
                        >
                          <div className="flex items-center w-full">
                            <div className={`w-3 h-3 rounded-full mr-2 ${getStatusColor(habit.status)}`}></div>
                            <span className="truncate">{habit.name}</span>
                          </div>
                          <div className="absolute inset-0 bg-indigo-500/10 scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="md:col-span-2">
                {selectedHabit ? (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-2xl">{selectedHabit.name}</CardTitle>
                          {getStatusBadge(selectedHabit.status)}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{selectedHabit.description}</p>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                            <div className="flex items-center mb-2">
                              <BarChart2 className="w-4 h-4 mr-2 text-indigo-500" />
                              <span className="text-sm font-medium">Weekly Progress</span>
                            </div>
                            <div className="text-2xl font-bold">
                              {weeklyProgress.completed}/{weeklyProgress.target} days
                            </div>
                            <Progress
                              value={weeklyProgress.percentage}
                              className="h-1 mt-2"
                              indicatorClassName={
                                weeklyProgress.completed >= weeklyProgress.target ? "bg-green-500" : ""
                              }
                            />
                          </div>

                          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                            <div className="flex items-center mb-2">
                              <TrendingUp className="w-4 h-4 mr-2 text-green-500" />
                              <span className="text-sm font-medium">Streak</span>
                            </div>
                            <div className="text-2xl font-bold">{selectedHabit.streak} days</div>
                          </div>

                          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                            <div className="flex items-center mb-2">
                              <Award className="w-4 h-4 mr-2 text-amber-500" />
                              <span className="text-sm font-medium">Completion</span>
                            </div>
                            <div className="text-2xl font-bold">{calculateCompletionRate(selectedHabit)}%</div>
                          </div>

                          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                            <div className="flex items-center mb-2">
                              <Calendar className="w-4 h-4 mr-2 text-blue-500" />
                              <span className="text-sm font-medium">Weekly Target</span>
                            </div>
                            <div className="text-2xl font-bold">{selectedHabit.weeklyTarget} days/week</div>
                          </div>
                        </div>

                        {isAuthenticated && (
                          <div className="mb-6">
                            <HabitCompletionForm habit={selectedHabit} onCompletionAdded={handleCompletionAdded} />
                          </div>
                        )}

                        <Tabs defaultValue={activeTab}>
                          <TabsList className="mb-4">
                            <TabsTrigger value="history">History</TabsTrigger>
                            <TabsTrigger value="weekly">Weekly History</TabsTrigger>
                            <TabsTrigger value="trends">Trends</TabsTrigger>
                            <TabsTrigger value="insights">Insights</TabsTrigger>
                          </TabsList>

                          <TabsContent value="history">
                            <div className="space-y-4">
                              <h3 className="text-lg font-medium">Recent Activity</h3>
                              {selectedHabit.completions && selectedHabit.completions.length > 0 ? (
                                <div className="space-y-2">
                                  {selectedHabit.completions
                                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                    .slice(0, 7)
                                    .map((completion, index) => (
                                      <div
                                        key={completion.id || index}
                                        className={`flex items-center p-3 rounded-lg ${
                                          completion.completed
                                            ? "bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800"
                                            : "bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800"
                                        }`}
                                      >
                                        <div className="mr-3">
                                          {completion.completed ? (
                                            <CheckCircle className="w-5 h-5 text-green-500" />
                                          ) : (
                                            <AlertCircle className="w-5 h-5 text-red-500" />
                                          )}
                                        </div>
                                        <div className="flex-1">
                                          <div className="font-medium">
                                            {completion.completed ? "Completed" : "Missed"}
                                          </div>
                                          <div className="text-sm text-gray-500 dark:text-gray-400">
                                            {formatDate(completion.date)}
                                          </div>
                                        </div>
                                        {completion.notes && (
                                          <div className="text-sm italic text-gray-500 dark:text-gray-400 max-w-[50%] truncate">
                                            "{completion.notes}"
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                </div>
                              ) : (
                                <div className="text-center py-8 text-gray-500">
                                  No completion records found for this habit.
                                </div>
                              )}
                            </div>
                          </TabsContent>

                          <TabsContent value="weekly">
                            <div className="space-y-4">
                              <h3 className="text-lg font-medium flex items-center">
                                <History className="w-5 h-5 mr-2 text-indigo-500" />
                                Weekly History
                              </h3>

                              {weeklyHistory.length > 0 ? (
                                <div className="space-y-4">
                                  {weeklyHistory.map((week, index) => (
                                    <Card
                                      key={index}
                                      className={`border ${week.isTargetMet ? "border-green-200 dark:border-green-800" : week.isComplete ? "border-red-200 dark:border-red-800" : "border-amber-200 dark:border-amber-800"}`}
                                    >
                                      <CardContent className="p-4">
                                        <div className="flex justify-between items-center">
                                          <div>
                                            <h4 className="font-medium">Week {weeklyHistory.length - index}</h4>
                                            <p className="text-sm text-muted-foreground">
                                              {week.startDate.toLocaleDateString()} -{" "}
                                              {week.endDate.toLocaleDateString()}
                                            </p>
                                          </div>
                                          <Badge
                                            variant={week.isTargetMet ? "default" : "outline"}
                                            className={week.isTargetMet ? "bg-green-500" : ""}
                                          >
                                            {week.isTargetMet
                                              ? "Target Met"
                                              : week.isComplete
                                                ? "Target Missed"
                                                : "In Progress"}
                                          </Badge>
                                        </div>

                                        <div className="mt-4">
                                          <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm font-medium">Progress</span>
                                            <span className="text-sm">
                                              {week.completions}/{week.target} days
                                            </span>
                                          </div>
                                          <Progress
                                            value={(week.completions / week.target) * 100}
                                            className="h-2"
                                            indicatorClassName={week.isTargetMet ? "bg-green-500" : ""}
                                          />
                                        </div>
                                      </CardContent>
                                    </Card>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-center py-8 text-gray-500">
                                  No period history available for this habit.
                                </div>
                              )}
                            </div>
                          </TabsContent>

                          <TabsContent value="trends">
                            <div className="space-y-4">
                              <h3 className="text-lg font-medium">Weekly Trends</h3>
                              {selectedHabit.completions && selectedHabit.completions.length > 0 ? (
                                <div className="h-64 flex items-end justify-between gap-2">
                                  {Array.from({ length: 7 }).map((_, index) => {
                                    const date = new Date()
                                    date.setDate(date.getDate() - 6 + index)
                                    date.setHours(0, 0, 0, 0)

                                    const dateStr = date.toISOString().split("T")[0]

                                    const completion = selectedHabit.completions?.find((c) => {
                                      const cDate = new Date(c.date)
                                      cDate.setHours(0, 0, 0, 0)
                                      return cDate.toISOString().split("T")[0] === dateStr
                                    })

                                    const dayName = date.toLocaleDateString("en-US", { weekday: "short" })
                                    const dayNum = date.getDate()

                                    const isToday = new Date().toISOString().split("T")[0] === dateStr

                                    return (
                                      <div key={index} className="flex flex-col items-center">
                                        <div
                                          className={`w-10 ${
                                            completion?.completed
                                              ? "bg-green-500"
                                              : completion
                                                ? "bg-red-500"
                                                : "bg-gray-300 dark:bg-gray-700"
                                          } rounded-t-md`}
                                          style={{
                                            height: `${completion?.completed ? 40 + Math.random() * 120 : 30}px`,
                                          }}
                                        ></div>
                                        <div
                                          className={`text-xs mt-2 font-medium ${isToday ? "text-indigo-600 dark:text-indigo-400" : ""}`}
                                        >
                                          {dayName}
                                        </div>
                                        <div
                                          className={`text-xs ${isToday ? "text-indigo-600 dark:text-indigo-400" : ""}`}
                                        >
                                          {dayNum}
                                        </div>
                                      </div>
                                    )
                                  })}
                                </div>
                              ) : (
                                <div className="text-center py-8 text-gray-500">No data available for trends.</div>
                              )}
                            </div>
                          </TabsContent>

                          <TabsContent value="insights">
                            <div className="space-y-4">
                              <h3 className="text-lg font-medium">Habit Insights</h3>
                              <div className="grid gap-4">
                                <Card>
                                  <CardContent className="p-4 flex items-start">
                                    <Activity className="w-5 h-5 mr-3 text-indigo-500 mt-0.5" />
                                    <div>
                                      <h4 className="font-medium">Consistency Score</h4>
                                      <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {selectedHabit.streak > 5
                                          ? "You're showing excellent consistency with this habit!"
                                          : selectedHabit.streak > 2
                                            ? "You're building consistency with this habit."
                                            : "Try to be more consistent with this habit to build a streak."}
                                      </p>
                                    </div>
                                  </CardContent>
                                </Card>

                                <Card>
                                  <CardContent className="p-4 flex items-start">
                                    <TrendingUp className="w-5 h-5 mr-3 text-green-500 mt-0.5" />
                                    <div>
                                      <h4 className="font-medium">Weekly Progress</h4>
                                      <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {weeklyProgress.completed >= weeklyProgress.target
                                          ? "Congratulations! You've met your target for this week."
                                          : `You need ${weeklyProgress.target - weeklyProgress.completed} more ${
                                              weeklyProgress.target - weeklyProgress.completed === 1 ? "day" : "days"
                                            } to reach your target of ${weeklyProgress.target} days.`}
                                      </p>
                                    </div>
                                  </CardContent>
                                </Card>

                                <Card>
                                  <CardContent className="p-4 flex items-start">
                                    <Calendar className="w-5 h-5 mr-3 text-blue-500 mt-0.5" />
                                    <div>
                                      <h4 className="font-medium">Weekly Cycle</h4>
                                      <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {weeklyHistory.length > 0
                                          ? `You've completed ${weeklyHistory.filter((w) => w.isTargetMet).length} out of ${weeklyHistory.length} weeks for this habit.`
                                          : "Start tracking this habit to see your weekly cycle data."}
                                      </p>
                                    </div>
                                  </CardContent>
                                </Card>
                              </div>
                            </div>
                          </TabsContent>
                        </Tabs>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center p-8">
                      <Clock className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium mb-2">No habit selected</h3>
                      <p className="text-gray-500 dark:text-gray-400 mb-4">
                        Select a habit from the list to view detailed analytics
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
