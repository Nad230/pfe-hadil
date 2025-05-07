"use client"

import { DialogFooter } from "@/components/ui/dialog"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Play, RefreshCw, Trash2, Clock, BarChart, Calendar, Loader2, Eye } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { ErrorMessage } from "@/components/ui/error-message"
import { toast } from "sonner"
import Link from "next/link"
import type { Habit } from "@/lib/types/habits"

export default function ControlHabitPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const selectedId = searchParams.get("id")

  const [habits, setHabits] = useState<Habit[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("all")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [habitToDelete, setHabitToDelete] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState("newest")
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [resetDialogOpen, setResetDialogOpen] = useState(false)
  const [habitToReset, setHabitToReset] = useState<string | null>(null)

  // Check authentication on component mount
  useEffect(() => {
    const token = localStorage.getItem("token") || localStorage.getItem("access_token")
    if (token) {
      setIsAuthenticated(true)
    } else {
      setError("Authentication required. Please log in.")
    }
  }, [])

  useEffect(() => {
    // If an ID is provided in the URL, scroll to that habit
    if (selectedId && habits.length > 0) {
      const element = document.getElementById(`habit-${selectedId}`)
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" })
      }
    }
  }, [selectedId, habits])

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
      setHabits(responseData)
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

  useEffect(() => {
    if (isAuthenticated) {
      fetchHabits()
    }
  }, [isAuthenticated, fetchHabits])

  // Update the updateHabitStatus function to match the working pattern
  const updateHabitStatus = async (id: string, newStatus: Habit["status"]) => {
    setActionLoading(id)

    try {
      // Get token from localStorage (try both possible token names)
      const token = localStorage.getItem("token") || localStorage.getItem("access_token")
      if (!token) {
        setIsAuthenticated(false)
        setError("Authentication required. Please log in.")
        setActionLoading(null)
        return
      }

      // Optimistically update UI
      setHabits((prev) => prev.map((habit) => (habit.id === id ? { ...habit, status: newStatus } : habit)))

      console.log(`Updating habit ${id} status to ${newStatus}`)
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/habits/${id}/status`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      // Try to parse response even if it's an error
      const responseData = await response.json().catch(() => null)

      if (!response.ok) {
        // Revert optimistic update on error
        fetchHabits()

        // Extract error message from response if available
        const errorMessage = responseData?.message || `Failed to update habit status: ${response.status}`
        throw new Error(errorMessage)
      }

      // Update with server data
      setHabits(habits.map((habit) => (habit.id === id ? responseData : habit)))

      // Use sonner toast
      toast.success("Status updated", {
        description: `Habit status changed to ${newStatus}`,
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update habit status"
      console.error("Error updating habit status:", err)

      // Use sonner toast for error
      toast.error("Error", {
        description: errorMessage,
      })
    } finally {
      setActionLoading(null)
    }
  }

  // Update the deleteHabit function to match the working pattern
  const deleteHabit = async () => {
    if (!habitToDelete) return

    setActionLoading(habitToDelete)

    try {
      // Get token from localStorage (try both possible token names)
      const token = localStorage.getItem("token") || localStorage.getItem("access_token")
      if (!token) {
        setIsAuthenticated(false)
        setError("Authentication required. Please log in.")
        setActionLoading(null)
        return
      }

      // Optimistically update UI
      setHabits((prev) => prev.filter((habit) => habit.id !== habitToDelete))
      setDeleteDialogOpen(false)

      console.log(`Deleting habit ${habitToDelete}`)
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/habits/${habitToDelete}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        // Revert optimistic update on error
        fetchHabits()

        // Try to get error message from response
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData?.message || `Failed to delete habit: ${response.status}`
        throw new Error(errorMessage)
      }

      // Use sonner toast
      toast.success("Habit deleted", {
        description: "The habit has been permanently deleted",
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete habit"
      console.error("Error deleting habit:", err)

      // Use sonner toast for error
      toast.error("Error", {
        description: errorMessage,
      })
    } finally {
      setHabitToDelete(null)
      setActionLoading(null)
    }
  }

  const confirmResetHabit = (id: string) => {
    setHabitToReset(id)
    setResetDialogOpen(true)
  }

  // Update the resetHabitProgress function to ensure progress is completely reset
  const resetHabitProgress = async () => {
    if (!habitToReset) return

    setActionLoading(habitToReset)

    try {
      // Get token from localStorage (try both possible token names)
      const token = localStorage.getItem("token") || localStorage.getItem("access_token")
      if (!token) {
        setIsAuthenticated(false)
        setError("Authentication required. Please log in.")
        setActionLoading(null)
        return
      }

      // Call the new reset endpoint
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/habits/${habitToReset}/reset`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        // Try to get error message from response
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData?.message || `Failed to reset habit: ${response.status}`
        throw new Error(errorMessage)
      }

      // Get the updated habit data
      const updatedHabit = await response.json()

      // Update the habit in the UI
      setHabits((prev) =>
        prev.map((habit) => {
          if (habit.id === habitToReset) {
            return {
              ...updatedHabit,
              completions: [], // Ensure completions are empty in the UI
            }
          }
          return habit
        }),
      )

      setResetDialogOpen(false)

      // Use sonner toast
      toast.success("Habit reset", {
        description: "Your habit has been completely reset. Progress is now 0% and a new 7-day week starts from today.",
      })

      // Refresh habits to update the UI
      fetchHabits()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to reset habit"
      console.error("Error resetting habit:", err)

      // Use sonner toast for error
      toast.error("Error", {
        description: errorMessage,
      })
    } finally {
      setHabitToReset(null)
      setActionLoading(null)
    }
  }

  const confirmDelete = (id: string) => {
    setHabitToDelete(id)
    setDeleteDialogOpen(true)
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

  // Filter habits based on active tab
  const filteredHabits =
    activeTab === "all"
      ? habits
      : habits.filter((habit) =>
          activeTab === "active"
            ? habit.status === "InProgress"
            : activeTab === "completed"
              ? habit.status === "Completed"
              : habit.status === "NotStarted",
        )

  // Sort habits based on selected sort option
  const sortedHabits = [...filteredHabits].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      case "oldest":
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      case "alphabetical":
        return a.name.localeCompare(b.name)
      case "progress":
        // Calculate progress based on completions
        const aCompletions = a.completions || []
        const bCompletions = b.completions || []
        const aProgress =
          a.weeklyTarget > 0
            ? Math.min(100, Math.round((aCompletions.filter((c) => c.completed).length / a.weeklyTarget) * 100))
            : 0
        const bProgress =
          b.weeklyTarget > 0
            ? Math.min(100, Math.round((bCompletions.filter((c) => c.completed).length / b.weeklyTarget) * 100))
            : 0
        return bProgress - aProgress
      default:
        return 0
    }
  })

  // Calculate weekly progress for a habit based on creation/restart date
  const calculateWeeklyProgress = (habit: Habit) => {
    const completions = habit.completions || []
    if (completions.length === 0) return { completed: 0, target: habit.weeklyTarget, percentage: 0 }

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
    const currentPeriodCompletions = completions.filter((completion) => {
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

  const handleRetry = () => {
    setRetryCount(0)
    fetchHabits()
  }

  // Handle view button click
  const handleViewClick = (e: React.MouseEvent<HTMLButtonElement>, habitId: string) => {
    e.preventDefault()
    e.stopPropagation()

    // Navigate to view habit page with the selected habit ID
    router.push(`/habit/view-habit?id=${habitId}`)

    // Store the habit ID in localStorage for persistence across page loads
    localStorage.setItem("selectedHabitId", habitId)
  }

  // Format date to display
  const formatDate = (date: Date | null | undefined) => {
    if (!date) return "Not available"
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-4xl font-bold text-center mb-2">Control Your Habits</h1>
          <p className="text-center text-gray-600 dark:text-gray-300 mb-8">
            Track, manage, and update your habit progress
          </p>

          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : error ? (
            <ErrorMessage message={error} onRetry={handleRetry} />
          ) : (
            <Tabs defaultValue="all" className="max-w-4xl mx-auto" onValueChange={setActiveTab}>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <TabsList>
                  <TabsTrigger value="all">All Habits</TabsTrigger>
                  <TabsTrigger value="active">In Progress</TabsTrigger>
                  <TabsTrigger value="completed">Completed</TabsTrigger>
                  <TabsTrigger value="notStarted">Not Started</TabsTrigger>
                </TabsList>

                <div className="flex items-center gap-2">
                  <Select defaultValue="newest" onValueChange={setSortBy}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="oldest">Oldest First</SelectItem>
                      <SelectItem value="progress">Progress</SelectItem>
                      <SelectItem value="alphabetical">Alphabetical</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="icon" onClick={fetchHabits} title="Refresh habits">
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <TabsContent value={activeTab} className="mt-0">
                <div className="grid gap-6 md:grid-cols-2">
                  <AnimatePresence>
                    {sortedHabits.length > 0 ? (
                      sortedHabits.map((habit, index) => {
                        const weeklyProgress = calculateWeeklyProgress(habit)
                        return (
                          <motion.div
                            key={habit.id}
                            id={`habit-${habit.id}`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                            className={selectedId === habit.id ? "ring-2 ring-indigo-500 rounded-lg" : ""}
                          >
                            <Card
                              className="overflow-hidden border-t-4"
                              style={{ borderTopColor: getStatusColor(habit.status).replace("bg-", "") }}
                            >
                              <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                  <CardTitle className="text-xl">{habit.name}</CardTitle>
                                  {getStatusBadge(habit.status)}
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{habit.description}</p>
                              </CardHeader>

                              <CardContent className="pb-2">
                                <div className="flex justify-between items-center mb-2">
                                  <span className="text-sm font-medium">Progress</span>
                                  <span className="text-sm font-medium">
                                    {weeklyProgress.completed}/{weeklyProgress.target} days
                                  </span>
                                </div>
                                <Progress
                                  value={weeklyProgress.percentage}
                                  className="h-2"
                                  indicatorClassName={
                                    weeklyProgress.completed >= weeklyProgress.target ? "bg-green-500" : ""
                                  }
                                />

                                <div className="grid grid-cols-1 gap-2 mt-4">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                      <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                                      <span className="text-sm">Period:</span>
                                    </div>
                                    <span className="text-sm">
                                      {formatDate(weeklyProgress.startDate)} - {formatDate(weeklyProgress.endDate)}
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                      <Clock className="w-4 h-4 mr-2 text-gray-500" />
                                      <span className="text-sm">Days left:</span>
                                    </div>
                                    <span className="text-sm">{weeklyProgress.daysLeft} days</span>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                      <BarChart className="w-4 h-4 mr-2 text-gray-500" />
                                      <span className="text-sm">Streak:</span>
                                    </div>
                                    <span className="text-sm">{habit.streak} days</span>
                                  </div>
                                </div>
                              </CardContent>

                              <CardFooter className="flex justify-between pt-2">
                                <div className="flex space-x-2">
                                  {/* For NotStarted habits */}
                                  {habit.status === "NotStarted" && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="text-green-600 border-green-600"
                                      onClick={() => updateHabitStatus(habit.id, "InProgress")}
                                      disabled={actionLoading === habit.id || !isAuthenticated}
                                    >
                                      {actionLoading === habit.id ? (
                                        <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                                      ) : (
                                        <Play className="w-4 h-4 mr-1" />
                                      )}
                                      Start
                                    </Button>
                                  )}

                                  {/* For InProgress habits */}
                                  {habit.status === "InProgress" && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="text-amber-600 border-amber-600"
                                      onClick={() => confirmResetHabit(habit.id)}
                                      disabled={actionLoading === habit.id || !isAuthenticated}
                                    >
                                      {actionLoading === habit.id ? (
                                        <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                                      ) : (
                                        <RefreshCw className="w-4 h-4 mr-1" />
                                      )}
                                      Restart
                                    </Button>
                                  )}
                                </div>

                                <div className="flex space-x-2">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={(e) => handleViewClick(e, habit.id)}
                                    className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950/50"
                                  >
                                    <Eye className="w-4 h-4 mr-1" />
                                    View
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-red-500"
                                    onClick={() => confirmDelete(habit.id)}
                                    disabled={actionLoading === habit.id || !isAuthenticated}
                                  >
                                    {actionLoading === habit.id && habitToDelete === habit.id ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <Trash2 className="w-4 h-4" />
                                    )}
                                  </Button>
                                </div>
                              </CardFooter>
                            </Card>
                          </motion.div>
                        )
                      })
                    ) : (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="col-span-2 text-center py-12"
                      >
                        <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                          <Clock className="w-8 h-8 text-gray-500" />
                        </div>
                        <h3 className="text-lg font-medium mb-2">No habits found</h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-4">
                          {activeTab === "all"
                            ? "You haven't created any habits yet."
                            : `You don't have any ${activeTab} habits.`}
                        </p>
                        <Button asChild>
                          <Link href="/habit/new-habits">Create a new habit</Link>
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </motion.div>
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Habit</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this habit? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={deleteHabit} disabled={!isAuthenticated}>
              {actionLoading === habitToDelete ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4 mr-2" />
              )}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Habit Progress</DialogTitle>
            <DialogDescription>
              Are you sure you want to reset this habit? This will:
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Clear all completions</li>
                <li>Reset your streak to zero</li>
                <li>Reset your progress percentage to 0%</li>
                <li>Start a new 7-day week from today</li>
              </ul>
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={resetHabitProgress} disabled={!isAuthenticated}>
              {actionLoading === habitToReset ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              Reset Habit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
