"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, CheckCircle, XCircle, RefreshCw } from "lucide-react"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { ErrorMessage } from "@/components/ui/error-message"
import { toast } from "sonner"
import type { Habit, HabitCompletion } from "@/lib/types/habits"

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [habits, setHabits] = useState<Habit[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [completions, setCompletions] = useState<
    Record<string, Record<string, { completed: boolean; habitName: string }>>
  >({})

  useEffect(() => {
    fetchHabits()
  }, [])

  // Update the fetchHabits function to match the working pattern
  const fetchHabits = async () => {
    setLoading(true)
    setError(null)
    try {
      // Get token from localStorage (try both possible token names)
      const token = localStorage.getItem("token") || localStorage.getItem("access_token")
      if (!token) {
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

      // Process completions into a more usable format
      const completionsMap: Record<string, Record<string, { completed: boolean; habitName: string }>> = {}

      responseData.forEach((habit: Habit) => {
        if (habit.completions && habit.completions.length > 0) {
          habit.completions.forEach((completion: HabitCompletion) => {
            const completionDate = new Date(completion.date)
            // Normalize hours to avoid timezone issues
            completionDate.setHours(12, 0, 0, 0)
            const dateString = formatDateString(
              completionDate.getFullYear(),
              completionDate.getMonth(),
              completionDate.getDate(),
            )

            if (!completionsMap[dateString]) {
              completionsMap[dateString] = {}
            }

            completionsMap[dateString][habit.id] = {
              completed: completion.completed,
              habitName: habit.name,
            }
          })
        }
      })

      setCompletions(completionsMap)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch habits"
      setError(errorMessage)
      console.error("Error fetching habits:", err)
    } finally {
      setLoading(false)
    }
  }

  // Update the recordCompletion function to ensure the date is correctly handled
  const recordCompletion = async (habitId: string, completed: boolean) => {
    try {
      // Check if the selected date is today
      const today = new Date()
      today.setHours(12, 0, 0, 0) // Set to noon to avoid timezone issues
      const selectedDateObj = new Date(selectedDate || "")
      selectedDateObj.setHours(12, 0, 0, 0)

      if (selectedDateObj.getTime() !== today.getTime()) {
        toast.error("Cannot record completion", {
          description: "You can only record completions for today.",
        })
        return
      }

      // Get token from localStorage (try both possible token names)
      const token = localStorage.getItem("token") || localStorage.getItem("access_token")
      if (!token) {
        toast.error("Authentication required", {
          description: "Please log in to record habit completion",
        })
        return
      }

      const habit = habits.find((h) => h.id === habitId)
      if (!habit) {
        toast.error("Habit not found")
        return
      }

      // Check if already completed today
      const dateString = formatDateString(today.getFullYear(), today.getMonth(), today.getDate())

      if (completions[dateString]?.[habitId]) {
        toast.error("Already recorded today", {
          description: "You can only record progress for this habit once per day.",
        })
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/habits/${habitId}/completion`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          completed,
          notes: `Recorded from calendar view`,
          date: today.toISOString(), // Explicitly send the current date
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `Failed to record completion: ${response.status}`)
      }

      toast.success(completed ? "Habit completed!" : "Habit missed", {
        description: completed
          ? `Great job! You've completed "${habit.name}".`
          : `You've recorded "${habit.name}" as missed today.`,
      })

      // Refresh habits to update the calendar
      fetchHabits()
    } catch (error) {
      console.error("Error recording completion:", error)
      toast.error("Error", {
        description: error instanceof Error ? error.message : "Failed to record habit completion",
      })
    }
  }

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay()
  }

  const formatDateString = (year: number, month: number, day: number) => {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
  }

  const renderCalendar = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const daysInMonth = getDaysInMonth(year, month)
    const firstDayOfMonth = getFirstDayOfMonth(year, month)
    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 border border-gray-100 dark:border-gray-800"></div>)
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = formatDateString(year, month, day)
      const isToday =
        day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear()
      const isSelected = dateString === selectedDate

      const completionsForDay = completions[dateString] || {}
      const completedCount = Object.values(completionsForDay).filter((item) => item.completed).length
      const totalHabitsForDay = Object.keys(completionsForDay).length
      const hasCompletions = totalHabitsForDay > 0

      days.push(
        <div
          key={day}
          className={`h-24 border border-gray-100 dark:border-gray-800 p-1 overflow-hidden transition-colors ${
            isSelected ? "bg-indigo-50 dark:bg-indigo-900/20" : isToday ? "bg-amber-50 dark:bg-amber-900/20" : ""
          } hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer`}
          onClick={() => setSelectedDate(dateString)}
        >
          <div className="flex justify-between items-start">
            <span
              className={`inline-block w-6 h-6 rounded-full text-center text-sm ${
                isToday
                  ? "bg-amber-500 text-white"
                  : isSelected
                    ? "bg-indigo-500 text-white"
                    : "text-gray-700 dark:text-gray-300"
              }`}
            >
              {day}
            </span>
            {hasCompletions && (
              <Badge variant="outline" className="text-xs">
                {completedCount}/{totalHabitsForDay}
              </Badge>
            )}
          </div>
          <div className="mt-1 space-y-1">
            {hasCompletions &&
              Object.entries(completionsForDay)
                .slice(0, 2)
                .map(([habitId, data]) => {
                  return (
                    <div
                      key={habitId}
                      className={`text-xs truncate flex items-center ${
                        data.completed ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400"
                      }`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full ${data.completed ? "bg-green-500" : "bg-red-500"} mr-1`}
                      ></div>
                      {data.completed ? <CheckCircle className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
                      <span className="truncate">{data.habitName}</span>
                    </div>
                  )
                })}
            {totalHabitsForDay > 2 && <div className="text-xs text-gray-500">+{totalHabitsForDay - 2} more</div>}
          </div>
        </div>,
      )
    }

    return days
  }

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
    setSelectedDate(null)
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
    setSelectedDate(null)
  }

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  return (
    <div className="container mx-auto px-6 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-4xl font-bold text-center mb-2">Habit Calendar</h1>
        <p className="text-center text-gray-600 dark:text-gray-300 mb-8">
          Track your habit completions throughout the month
        </p>

        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : error ? (
          <ErrorMessage message={error} onRetry={fetchHabits} />
        ) : (
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <Button variant="outline" onClick={prevMonth}>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h2>
                <Button variant="ghost" size="icon" onClick={fetchHabits} title="Refresh calendar">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
              <Button variant="outline" onClick={nextMonth}>
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>

            <div className="grid grid-cols-7 gap-0 mb-4">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="text-center font-medium py-2 border-b border-gray-200 dark:border-gray-700">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-0 mb-8">{renderCalendar()}</div>

            {selectedDate && (
              <Card className="mt-8">
                <CardHeader>
                  <CardTitle>
                    Habits for{" "}
                    {new Date(selectedDate).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {habits.map((habit) => {
                      const completionsForDay = completions[selectedDate] || {}
                      const habitData = completionsForDay[habit.id]
                      const isCompleted = habitData?.completed

                      // Check if selected date is today
                      const today = new Date()
                      today.setHours(0, 0, 0, 0)
                      const selectedDateObj = new Date(selectedDate)
                      selectedDateObj.setHours(0, 0, 0, 0)
                      const isToday = selectedDateObj.getTime() === today.getTime()

                      return (
                        <div
                          key={habit.id}
                          className={`flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 ${
                            isCompleted === true
                              ? "border-green-200 dark:border-green-800"
                              : isCompleted === false
                                ? "border-red-200 dark:border-red-800"
                                : ""
                          }`}
                        >
                          <div className="flex items-center">
                            <div
                              className={`w-3 h-3 rounded-full ${
                                isCompleted === true
                                  ? "bg-green-500"
                                  : isCompleted === false
                                    ? "bg-red-500"
                                    : "bg-gray-300 dark:bg-gray-600"
                              } mr-3`}
                            ></div>
                            <div>
                              <span className="font-medium">{habit.name}</span>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {habit.type === "GoodHabit" ? "Good Habit" : "Bad Habit"} • Target: {habit.weeklyTarget}{" "}
                                days/week
                              </p>
                            </div>
                          </div>
                          {isCompleted !== undefined ? (
                            <Badge
                              variant={isCompleted ? "default" : "destructive"}
                              className={isCompleted ? "bg-green-500" : ""}
                            >
                              {isCompleted ? "Completed" : "Missed"}
                            </Badge>
                          ) : isToday ? (
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
                                onClick={() => recordCompletion(habit.id, false)}
                              >
                                <XCircle className="w-3 h-3 mr-1" /> Miss
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-green-200 text-green-600 hover:bg-green-50 dark:border-green-800 dark:text-green-400 dark:hover:bg-green-950"
                                onClick={() => recordCompletion(habit.id, true)}
                              >
                                <CheckCircle className="w-3 h-3 mr-1" /> Complete
                              </Button>
                            </div>
                          ) : (
                            <Badge variant="outline">Not Tracked</Badge>
                          )}
                        </div>
                      )
                    })}

                    {habits.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        No habits found. Create some habits to track them on the calendar.
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </motion.div>
    </div>
  )
}
