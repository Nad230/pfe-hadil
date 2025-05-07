"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Plus,
  Settings,
  Eye,
  TrendingUp,
  Award,
  BarChart2,
  Clock,
  Target,
  Activity,
  Sparkles,
  Calendar,
  Zap,
  CheckCircle,
  Rocket,
  Lightbulb,
  Star,
  BookOpen,
} from "lucide-react"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { ErrorMessage } from "@/components/ui/error-message"
import { toast } from "sonner"
import type { Habit } from "@/lib/types/habits"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EnhancedDisciplineScore } from "@/components/habits/enhanced-discipline-score"
import { BadgesDisplay } from "@/components/habits/badges-display"
import { WeeklyHeatmap } from "@/components/habits/weekly-heatmap"
import { WeeklyReview } from "@/components/habits/weekly-review"
import { WeeklyAdvancedView } from "@/components/habits/weekly-advanced-view"
import { DailyCheckIn } from "@/components/habits/daily-check-in"
import { BadgeProgress } from "@/components/habits/badge-progress"
import { HabitJournal } from "@/components/habits/habit-journal"
import { Tooltip, ResponsiveContainer, PieChart as RePieChart, Pie, Cell, Legend } from "recharts"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { PieChart } from "lucide-react"
import Link from "next/link"
import { getEntrepreneurialQuote } from "@/lib/discipline"
import { calculateDisciplineScore } from "@/lib/discipline"

export default function EntrepreneurialHabitDashboard() {
  const router = useRouter()
  const [habits, setHabits] = useState<Habit[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [activeTab, setActiveTab] = useState("overview")
  const [quote, setQuote] = useState({ quote: "", author: "" })
  const [previousScore, setPreviousScore] = useState(0)
  const [journalEntries, setJournalEntries] = useState<Record<string, string>>({})
  const [theme, setTheme] = useState<"light" | "dark">("light")

  // Check system preference for theme
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
        setTheme("dark")
      }

      // Listen for changes
      window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (event) => {
        setTheme(event.matches ? "dark" : "light")
      })
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
        // Handle 401 Unauthorized specifically
        if (response.status === 401) {
          setIsAuthenticated(false)
          setError("Your session has expired. Please log in again.")
          setLoading(false)
          return
        }

        // Handle server errors with retry
        if (response.status >= 500 && retryCount < 3) {
          setRetryCount((prev) => prev + 1)
          setTimeout(() => fetchHabits(), 1000)
          return
        }

        // Extract error message from response if available
        const errorMessage = responseData?.message || `Failed to fetch habits: ${response.status}`
        throw new Error(errorMessage)
      }

      // Reset retry count on success
      setRetryCount(0)

      // Store previous score for animation
      const currentHabits = responseData || []
      if (habits.length > 0) {
        const { score } = calculateDisciplineScore(habits)
        setPreviousScore(score)
      }

      setHabits(currentHabits)

      // Simulate fetching journal entries (in a real app, this would be a separate API call)
      // This is just for demonstration purposes
      const mockJournalEntries: Record<string, string> = {}
      const today = new Date()
      for (let i = 0; i < 7; i++) {
        const date = new Date()
        date.setDate(today.getDate() - i)
        const dateStr = date.toISOString().split("T")[0]

        if (i === 1) {
          mockJournalEntries[dateStr] =
            "Today I completed my morning routine and worked on my business plan. I'm making good progress on building consistency."
        } else if (i === 3) {
          mockJournalEntries[dateStr] =
            "Struggled with motivation today, but managed to complete 2 out of 3 habits. Need to focus on getting enough sleep."
        }
      }
      setJournalEntries(mockJournalEntries)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch habits"
      setError(errorMessage)
      console.error("Error fetching habits:", err)

      toast.error("Error loading habits", {
        description: errorMessage,
      })
    } finally {
      setLoading(false)
    }
  }, [retryCount])

  // Check authentication on component mount
  useEffect(() => {
    const token = localStorage.getItem("token") || localStorage.getItem("access_token")
    if (token) {
      setIsAuthenticated(true)
    } else {
      setError("Authentication required. Please log in.")
    }

    // Get a motivational quote
    setQuote(getEntrepreneurialQuote())
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      // Initial fetch
      fetchHabits()
    }
  }, [isAuthenticated, fetchHabits])

  // Handle habit check-in
  const handleHabitCheckIn = async (habitId: string, completed: boolean, notes?: string) => {
    const today = new Date().toISOString().split("T")[0]

    // Optimistic update
    setHabits((prevHabits) =>
      prevHabits.map((habit) => {
        if (habit.id === habitId) {
          const existingCompletions = habit.completions || []
          const todayCompletionIndex = existingCompletions.findIndex(
            (c) => new Date(c.date).toISOString().split("T")[0] === today,
          )

          const newCompletions = [...existingCompletions]

          if (todayCompletionIndex >= 0) {
            // Update existing completion
            newCompletions[todayCompletionIndex] = {
              ...newCompletions[todayCompletionIndex],
              completed,
              notes: notes || newCompletions[todayCompletionIndex].notes,
            }
          } else {
            // Add new completion
            newCompletions.push({
              id: `temp-${Date.now()}`,
              habitId,
              date: new Date().toISOString(),
              completed,
              notes,
            })
          }

          return {
            ...habit,
            completions: newCompletions,
            // Update streak if needed
            streak: completed ? habit.streak + 1 : 0,
          }
        }
        return habit
      }),
    )

    // In a real app, you would make an API call here
    // This is just a simulation for the demo
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve()
      }, 500)
    })
  }

  // Handle journal save
  const handleSaveJournal = async (date: string, content: string) => {
    // Update local state
    setJournalEntries((prev) => ({
      ...prev,
      [date]: content,
    }))

    // In a real app, you would make an API call here
    // This is just a simulation for the demo
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve()
      }, 500)
    })
  }

  // Get recent habits
  const getRecentHabits = () => {
    // Make sure we have habits data
    if (!habits || habits.length === 0) {
      return []
    }

    return habits
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 3)
      .map((habit) => {
        // Calculate progress based on completions
        const completions = habit.completions || []
        const recentCompletions = completions.filter((c) => {
          const date = new Date(c.date)
          const now = new Date()
          const weekAgo = new Date()
          weekAgo.setDate(now.getDate() - 7)
          return date >= weekAgo && date <= now
        })

        const progress =
          habit.weeklyTarget > 0
            ? Math.min(
                100,
                Math.round((recentCompletions.filter((c) => c.completed).length / habit.weeklyTarget) * 100),
              )
            : 0

        // Get last completed date
        const lastCompletion = completions
          .filter((c) => c.completed)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]

        const lastCompletedDate = lastCompletion ? new Date(lastCompletion.date) : null

        const lastCompleted = lastCompletedDate
          ? isToday(lastCompletedDate)
            ? "Today"
            : isYesterday(lastCompletedDate)
              ? "Yesterday"
              : lastCompletedDate.toLocaleDateString()
          : "Never"

        return {
          id: habit.id,
          name: habit.name,
          lastCompleted,
          streak: habit.streak,
          progress,
          status: habit.status,
          type: habit.type,
          weeklyTarget: habit.weeklyTarget,
          goalId: habit.goalId,
          goal: habit.goal,
        }
      })
  }

  // Helper functions for date comparison
  const isToday = (date: Date) => {
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  const isYesterday = (date: Date) => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    return (
      date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear()
    )
  }

  // Get status color
  const getStatusColor = (status: Habit["status"]) => {
    switch (status) {
      case "InProgress":
        return "bg-green-500"
      case "Paused":
        return "bg-amber-500"
      case "Completed":
        return "bg-blue-500"
      default:
        return "bg-gray-500"
    }
  }

  // Handle navigation to view habit
  const handleViewHabit = (habitId: string) => {
    router.push(`/habit/view-habit?id=${habitId}`)
  }

  // Handle navigation to control habit
  const handleControlHabit = (habitId: string) => {
    router.push(`/habit/control-habit?id=${habitId}`)
  }

  const handleRetry = () => {
    setRetryCount(0)
    fetchHabits()
  }

  // Get all badges from habits
  const getAllBadges = () => {
    return habits
      .flatMap((habit) => habit.badges || [])
      .sort((a, b) => new Date(b.earnedAt).getTime() - new Date(a.earnedAt).getTime())
  }

  // Calculate stats from real data
  const calculateStats = () => {
    const activeHabits = habits.filter((h) => h.status === "InProgress").length

    // Calculate completion rate
    const completions = habits.flatMap((h) => h.completions || [])
    const completedCount = completions.filter((c) => c.completed).length
    const completionRate = completions.length > 0 ? Math.round((completedCount / completions.length) * 100) : 0

    // Find longest streak
    const maxStreak = habits.reduce((max, habit) => Math.max(max, habit.streak), 0)

    // Total completions
    const totalCompletions = completedCount

    return [
      {
        label: "Active Habits",
        value: activeHabits.toString(),
        icon: <Activity className="w-5 h-5 text-indigo-500" />,
        description: "Habits currently in progress",
        color: "bg-indigo-50 dark:bg-indigo-950/30",
        textColor: "text-indigo-600 dark:text-indigo-400",
      },
      {
        label: "Completion Rate",
        value: `${completionRate}%`,
        icon: <CheckCircle className="w-5 h-5 text-green-500" />,
        description: "Overall habit completion rate",
        color: "bg-green-50 dark:bg-green-950/30",
        textColor: "text-green-600 dark:text-green-400",
      },
      {
        label: "Longest Streak",
        value: `${maxStreak} days`,
        icon: <TrendingUp className="w-5 h-5 text-amber-500" />,
        description: "Your best consistency streak",
        color: "bg-amber-50 dark:bg-amber-950/30",
        textColor: "text-amber-600 dark:text-amber-400",
      },
      {
        label: "Total Completions",
        value: totalCompletions.toString(),
        icon: <Award className="w-5 h-5 text-blue-500" />,
        description: "Total habit completions recorded",
        color: "bg-blue-50 dark:bg-blue-950/30",
        textColor: "text-blue-600 dark:text-blue-400",
      },
    ]
  }

  // Generate chart data
  const generateHabitTypeData = () => {
    if (!habits || habits.length === 0) return []

    const goodHabits = habits.filter((h) => h.type === "GoodHabit").length
    const badHabits = habits.filter((h) => h.type === "BadHabit").length

    return [
      { name: "Good Habits", value: goodHabits },
      { name: "Bad Habits", value: badHabits },
    ]
  }

  const generateHabitStatusData = () => {
    if (!habits || habits.length === 0) return []

    const inProgress = habits.filter((h) => h.status === "InProgress").length
    const paused = habits.filter((h) => h.status === "Paused").length
    const completed = habits.filter((h) => h.status === "Completed").length
    const notStarted = habits.filter((h) => h.status === "NotStarted").length

    return [
      { name: "In Progress", value: inProgress },
      { name: "Paused", value: paused },
      { name: "Completed", value: completed },
      { name: "Not Started", value: notStarted },
    ]
  }

  const recentHabits = getRecentHabits()
  const allBadges = getAllBadges()

  const stats = calculateStats()
  const habitTypeData = generateHabitTypeData()
  const habitStatusData = generateHabitStatusData()

  // Colors for charts
  const PIE_COLORS = ["#4f46e5", "#ef4444", "#10b981", "#f59e0b"]
  const STATUS_COLORS = ["#10b981", "#f59e0b", "#3b82f6", "#6b7280"]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50/20 to-white dark:from-gray-900 dark:via-indigo-950/10 dark:to-gray-800">
      {/* Hero Section with Animated Background */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 dark:from-indigo-500/5 dark:to-purple-500/5"></div>
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-indigo-500/10 dark:bg-indigo-500/5"
              style={{
                width: `${Math.random() * 300 + 50}px`,
                height: `${Math.random() * 300 + 50}px`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animation: `float ${Math.random() * 20 + 10}s infinite ease-in-out`,
                animationDelay: `${Math.random() * 5}s`,
              }}
            ></div>
          ))}
        </div>

        <div className="container relative z-10 mx-auto px-6 pt-12 pb-20">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="text-center mb-12"
            >
              <div className="inline-block mb-4 px-4 py-1.5 bg-indigo-100 dark:bg-indigo-900/30 rounded-full text-indigo-700 dark:text-indigo-300 font-medium text-sm">
                Entrepreneurial Success System
              </div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 dark:from-indigo-400 dark:via-purple-400 dark:to-indigo-400">
                Habit Dashboard
              </h1>
              <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
                Track your entrepreneurial habits, build discipline, and achieve your business goals through consistent
                daily actions.
              </p>

              {/* Quote Card */}
              {quote.quote && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.7 }}
                  className="max-w-2xl mx-auto"
                >
                  <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-indigo-100 dark:border-indigo-900/30">
                    <CardContent className="p-6">
                      <div className="flex gap-4 items-start">
                        <div className="text-4xl text-indigo-400">"</div>
                        <div>
                          <p className="italic text-gray-700 dark:text-gray-300 mb-2">{quote.quote}</p>
                          <p className="text-right text-indigo-600 dark:text-indigo-400 font-medium">
                            — {quote.author}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Quick Stats Overview */}
              {!loading && !error && habits.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.7 }}
                  className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-12"
                >
                  {stats.map((stat, index) => (
                    <Card
                      key={index}
                      className={`${stat.color} border-none shadow-md hover:shadow-lg transition-shadow`}
                    >
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{stat.label}</p>
                            <p className={`text-2xl font-bold ${stat.textColor}`}>{stat.value}</p>
                          </div>
                          <div className="p-2 rounded-full bg-white dark:bg-gray-700 shadow-sm">{stat.icon}</div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </motion.div>
              )}
            </motion.div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <LoadingSpinner size="lg" />
                <p className="mt-4 text-gray-600 dark:text-gray-400">Loading your entrepreneurial journey...</p>
              </div>
            ) : error ? (
              <ErrorMessage message={error} onRetry={handleRetry} />
            ) : (
              <>
                {/* Dashboard Tabs */}
                <Tabs value={activeTab} className="mb-4" onValueChange={setActiveTab}>
                  <div className="flex justify-center">
                    <TabsList className="mb-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-1 rounded-full">
                      <TabsTrigger value="overview" className="px-6 rounded-full data-[state=active]:bg-indigo-600">
                        <BarChart2 className="w-4 h-4 mr-2" /> Overview
                      </TabsTrigger>
                      <TabsTrigger value="discipline" className="px-6 rounded-full data-[state=active]:bg-indigo-600">
                        <Zap className="w-4 h-4 mr-2" /> Discipline
                      </TabsTrigger>
                      <TabsTrigger value="insights" className="px-6 rounded-full data-[state=active]:bg-indigo-600">
                        <Activity className="w-4 h-4 mr-2" /> Insights
                      </TabsTrigger>
                      <TabsTrigger value="journal" className="px-6 rounded-full data-[state=active]:bg-indigo-600">
                        <BookOpen className="w-4 h-4 mr-2" /> Journal
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent value="overview">
                    {/* Daily Check-in */}
                    <div className="mb-8">
                      <DailyCheckIn habits={habits} onCheckIn={handleHabitCheckIn} />
                    </div>

                    {/* Recent Habits Section */}
                    <div className="mb-12">
                      <div className="flex justify-between items-center mb-6">
                        <div>
                          <h2 className="text-2xl font-bold flex items-center">
                            <Rocket className="mr-2 h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                            Recent Habits
                          </h2>
                          <p className="text-gray-500 dark:text-gray-400">
                            Your most recently updated entrepreneurial habits
                          </p>
                        </div>
                        <Button asChild className="bg-indigo-600 hover:bg-indigo-700 shadow-md">
                          <Link href="/habit/new-habits">
                            <Plus className="mr-2 h-4 w-4" /> Add New Habit
                          </Link>
                        </Button>
                      </div>

                      {recentHabits.length > 0 ? (
                        <div className="grid md:grid-cols-3 gap-6">
                          {recentHabits.map((habit, index) => (
                            <motion.div
                              key={habit.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.5, delay: index * 0.1 }}
                              className="cursor-pointer group"
                              onClick={() => handleViewHabit(habit.id)}
                            >
                              <Card
                                className="h-full border-t-4 overflow-hidden transition-all duration-200 hover:shadow-xl group-hover:border-indigo-500 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm"
                                style={{ borderTopColor: getStatusColor(habit.status) }}
                              >
                                <CardHeader className="pb-2">
                                  <div className="flex justify-between items-start">
                                    <CardTitle className="text-xl group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                      {habit.name}
                                    </CardTitle>
                                    <div
                                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        habit.type === "GoodHabit"
                                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                          : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                                      }`}
                                    >
                                      {habit.type === "GoodHabit" ? "Good Habit" : "Bad Habit"}
                                    </div>
                                  </div>
                                  <div className="flex justify-between text-sm text-gray-500 mt-2">
                                    <span className="flex items-center">
                                      <Clock className="w-3 h-3 mr-1" /> Last: {habit.lastCompleted}
                                    </span>
                                    <span className="flex items-center">
                                      <TrendingUp className="w-3 h-3 mr-1" /> Streak: {habit.streak} days
                                    </span>
                                  </div>
                                </CardHeader>
                                <CardContent>
                                  <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm">Weekly Progress</span>
                                    <span className="text-sm font-medium">{habit.progress}%</span>
                                  </div>
                                  <Progress
                                    value={habit.progress}
                                    className="h-2 mb-4"
                                    indicatorClassName={habit.progress >= 100 ? "bg-green-500" : "bg-indigo-500"}
                                  />
                                  <div className="flex justify-between mt-4">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="border-indigo-200 text-indigo-600 hover:bg-indigo-50 dark:border-indigo-800 dark:text-indigo-400 dark:hover:bg-indigo-950 shadow-sm"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleControlHabit(habit.id)
                                      }}
                                    >
                                      <Settings className="mr-2 h-4 w-4" /> Control
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="border-indigo-200 text-indigo-600 hover:bg-indigo-50 dark:border-indigo-800 dark:text-indigo-400 dark:hover:bg-indigo-950 shadow-sm"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleViewHabit(habit.id)
                                      }}
                                    >
                                      <Eye className="mr-2 h-4 w-4" /> View
                                    </Button>
                                  </div>
                                </CardContent>
                              </Card>
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <Card className="p-8 text-center border border-dashed bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
                          <div className="mx-auto w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mb-4">
                            <Sparkles className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                          </div>
                          <h3 className="text-xl font-semibold mb-2">Start Your Habit Journey</h3>
                          <p className="text-gray-500 mb-6 max-w-md mx-auto">
                            You don't have any habits yet. Create your first habit to begin tracking your progress.
                          </p>
                          <Button asChild className="bg-indigo-600 hover:bg-indigo-700 shadow-md">
                            <Link href="/habit/new-habits">
                              <Plus className="mr-2 h-4 w-4" /> Create Your First Habit
                            </Link>
                          </Button>
                        </Card>
                      )}
                    </div>

                    {/* Weekly Advanced View */}
                    <div className="mb-12">
                      <WeeklyAdvancedView habits={habits} />
                    </div>
                  </TabsContent>

                  <TabsContent value="discipline">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                      {/* Enhanced Discipline Score Card */}
                      <EnhancedDisciplineScore habits={habits} previousScore={previousScore} />

                      {/* Weekly Heatmap */}
                      <WeeklyHeatmap habits={habits} />
                    </div>

                    {/* Badge Progress */}
                    <div className="mb-12">
                      <BadgeProgress habits={habits} />
                    </div>

                    {/* Weekly Review */}
                    <WeeklyReview habits={habits} />

                    {/* Badges Display */}
                    <BadgesDisplay badges={allBadges} />
                  </TabsContent>

                  <TabsContent value="insights">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                      {/* Habit Type Distribution */}
                      <Card className="shadow-lg border-none bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
                        <CardHeader>
                          <CardTitle className="flex items-center">
                            <PieChart className="w-5 h-5 mr-2 text-indigo-500" />
                            <span>Habit Type Distribution</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                          <div className="h-80 flex items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                              <RePieChart>
                                <Pie
                                  data={habitTypeData}
                                  cx="50%"
                                  cy="50%"
                                  labelLine={false}
                                  outerRadius={120}
                                  fill="#8884d8"
                                  dataKey="value"
                                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                >
                                  {habitTypeData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                  ))}
                                </Pie>
                                <Tooltip
                                  contentStyle={{
                                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                                    borderRadius: "8px",
                                    border: "none",
                                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                                  }}
                                />
                                <Legend />
                              </RePieChart>
                            </ResponsiveContainer>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Habit Status Distribution */}
                      <Card className="shadow-lg border-none bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
                        <CardHeader>
                          <CardTitle className="flex items-center">
                            <Activity className="w-5 h-5 mr-2 text-green-500" />
                            <span>Habit Status Distribution</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                          <div className="h-80 flex items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                              <RePieChart>
                                <Pie
                                  data={habitStatusData}
                                  cx="50%"
                                  cy="50%"
                                  labelLine={false}
                                  outerRadius={120}
                                  fill="#8884d8"
                                  dataKey="value"
                                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                >
                                  {habitStatusData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                                  ))}
                                </Pie>
                                <Tooltip
                                  contentStyle={{
                                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                                    borderRadius: "8px",
                                    border: "none",
                                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                                  }}
                                />
                                <Legend />
                              </RePieChart>
                            </ResponsiveContainer>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Quick Actions */}
                    <div className="mb-12">
                      <h2 className="text-2xl font-bold mb-6 flex items-center">
                        <Lightbulb className="mr-2 h-5 w-5 text-amber-500" />
                        Quick Actions
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Button
                          asChild
                          className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 h-auto py-6 flex-col shadow-md"
                        >
                          <Link href="/habit/new-habits">
                            <Plus className="h-8 w-8 mb-2" />
                            <span className="text-lg">Add New Habit</span>
                          </Link>
                        </Button>
                        <Button
                          asChild
                          className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 h-auto py-6 flex-col shadow-md"
                        >
                          <Link href="/habit/control-habit">
                            <Settings className="h-8 w-8 mb-2" />
                            <span className="text-lg">Control Habits</span>
                          </Link>
                        </Button>
                        <Button
                          asChild
                          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 h-auto py-6 flex-col shadow-md"
                        >
                          <Link href="/habit/view-habit">
                            <BarChart2 className="h-8 w-8 mb-2" />
                            <span className="text-lg">View Analytics</span>
                          </Link>
                        </Button>
                        <Button
                          asChild
                          className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 h-auto py-6 flex-col shadow-md"
                        >
                          <Link href="/habit/calendar">
                            <Calendar className="h-8 w-8 mb-2" />
                            <span className="text-lg">Calendar View</span>
                          </Link>
                        </Button>
                      </div>
                    </div>

                    {/* Professional Summary */}
                    <Card className="shadow-lg border-none bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 mb-12">
                      <CardContent className="p-8">
                        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                          <div className="bg-white dark:bg-gray-800 p-4 rounded-full shadow-md">
                            <Award className="h-12 w-12 text-indigo-600" />
                          </div>
                          <div>
                            <h2 className="text-2xl font-bold mb-2">Professional Habit Analysis</h2>
                            <p className="text-gray-600 dark:text-gray-300 mb-4">
                              This dashboard provides comprehensive analytics and visualizations of your habit formation
                              journey. The data-driven insights help identify patterns, track progress, and optimize
                              your habit-building strategy.
                            </p>
                            <div className="flex flex-wrap gap-2">
                              <Badge className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300 hover:bg-indigo-200">
                                Data Visualization
                              </Badge>
                              <Badge className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 hover:bg-green-200">
                                Progress Tracking
                              </Badge>
                              <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 hover:bg-blue-200">
                                Behavioral Analysis
                              </Badge>
                              <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 hover:bg-amber-200">
                                Performance Metrics
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Habit Health Summary */}
                    <div className="mb-12">
                      <h2 className="text-2xl font-bold mb-6 flex items-center">
                        <Star className="mr-2 h-5 w-5 text-amber-500" />
                        Habit Health Summary
                      </h2>
                      <Card className="shadow-lg border-none bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
                        <CardContent className="p-6">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="flex flex-col items-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                              <div className="mb-3 p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                                <Activity className="h-8 w-8 text-green-600 dark:text-green-400" />
                              </div>
                              <h3 className="text-xl font-semibold mb-1">Overall Health</h3>
                              <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                                {habits.length > 0
                                  ? Math.round(
                                      (habits.filter((h) => h.status === "InProgress").length / habits.length) * 100,
                                    )
                                  : 0}
                                %
                              </div>
                              <p className="text-center text-sm text-gray-600 dark:text-gray-300">
                                Based on active habits and completion rates
                              </p>
                            </div>

                            <div className="flex flex-col items-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                              <div className="mb-3 p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-full">
                                <TrendingUp className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                              </div>
                              <h3 className="text-xl font-semibold mb-1">Growth Trend</h3>
                              <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">
                                {habits.some((h) => h.streak > 3) ? "Positive" : "Neutral"}
                              </div>
                              <p className="text-center text-sm text-gray-600 dark:text-gray-300">
                                Based on streak consistency and progress
                              </p>
                            </div>

                            <div className="flex flex-col items-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                              <div className="mb-3 p-3 bg-amber-100 dark:bg-amber-900/30 rounded-full">
                                <Target className="h-8 w-8 text-amber-600 dark:text-amber-400" />
                              </div>
                              <h3 className="text-xl font-semibold mb-1">Target Achievement</h3>
                              <div className="text-3xl font-bold text-amber-600 dark:text-amber-400 mb-2">
                                {habits.length > 0
                                  ? Math.round(
                                      (habits.filter((h) => {
                                        const completions = h.completions || []
                                        const recentCompletions = completions.filter((c) => {
                                          const date = new Date(c.date)
                                          const now = new Date()
                                          const weekAgo = new Date()
                                          weekAgo.setDate(now.getDate() - 7)
                                          return date >= weekAgo && date <= now && c.completed
                                        }).length
                                        return recentCompletions >= h.weeklyTarget
                                      }).length /
                                        habits.length) *
                                        100,
                                    )
                                  : 0}
                                %
                              </div>
                              <p className="text-center text-sm text-gray-600 dark:text-gray-300">
                                Percentage of habits meeting weekly targets
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="journal">
                    <div className="mb-12">
                      <HabitJournal habits={habits} onSaveJournal={handleSaveJournal} savedEntries={journalEntries} />
                    </div>
                  </TabsContent>
                </Tabs>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
