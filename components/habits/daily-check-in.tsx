"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle, XCircle, Clock, Lightbulb, Sparkles } from "lucide-react"
import { toast } from "sonner"
import type { Habit } from "@/lib/types/habits"

interface DailyCheckInProps {
  habits: Habit[]
  onCheckIn?: (habitId: string, completed: boolean, notes?: string) => Promise<void>
}

export function DailyCheckIn({ habits, onCheckIn }: DailyCheckInProps) {
  const [todayHabits, setTodayHabits] = useState<Array<Habit & { completed?: boolean; notes?: string }>>([])
  const [loading, setLoading] = useState<Record<string, boolean>>({})
  const [showFeedback, setShowFeedback] = useState(false)
  const [feedbackMessage, setFeedbackMessage] = useState("")
  const [feedbackType, setFeedbackType] = useState<"success" | "warning" | "info">("info")

  useEffect(() => {
    if (!habits || habits.length === 0) return

    // Filter habits that are in progress
    const activeHabits = habits.filter((h) => h.status === "InProgress")

    // Check if habits have been completed today
    const today = new Date().toISOString().split("T")[0]

    const habitsWithTodayStatus = activeHabits.map((habit) => {
      const completions = habit.completions || []
      const todayCompletion = completions.find((c) => new Date(c.date).toISOString().split("T")[0] === today)

      return {
        ...habit,
        completed: todayCompletion?.completed || false,
        notes: todayCompletion?.notes || "",
      }
    })

    setTodayHabits(habitsWithTodayStatus)
  }, [habits])

  const handleCheckIn = async (habitId: string, completed: boolean, notes?: string) => {
    if (!onCheckIn) return

    setLoading((prev) => ({ ...prev, [habitId]: true }))

    try {
      await onCheckIn(habitId, completed, notes)

      // Update local state
      setTodayHabits((prev) => prev.map((h) => (h.id === habitId ? { ...h, completed, notes: notes || h.notes } : h)))

      // Generate feedback based on completion status
      const completedCount = todayHabits.filter((h) => h.completed || (h.id === habitId && completed)).length
      const totalCount = todayHabits.length

      if (completed) {
        if (completedCount === totalCount) {
          setFeedbackMessage("Amazing! You've completed all your habits today. Your discipline score is growing!")
          setFeedbackType("success")
        } else {
          setFeedbackMessage(`Great job! You've completed ${completedCount}/${totalCount} habits today.`)
          setFeedbackType("success")
        }
      } else {
        setFeedbackMessage("It's okay to miss sometimes. Remember why you started this habit journey.")
        setFeedbackType("warning")
      }

      setShowFeedback(true)

      // Hide feedback after 5 seconds
      setTimeout(() => {
        setShowFeedback(false)
      }, 5000)
    } catch (error) {
      toast.error("Failed to update habit", {
        description: "Please try again later",
      })
    } finally {
      setLoading((prev) => ({ ...prev, [habitId]: false }))
    }
  }

  const getTimeOfDay = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "morning"
    if (hour < 18) return "afternoon"
    return "evening"
  }

  if (todayHabits.length === 0) {
    return (
      <Card className="shadow-lg border-none bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="mr-2 h-5 w-5 text-indigo-500" />
            Daily Check-in
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-6">
          <Lightbulb className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No active habits to check in</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Start by creating some habits or activating paused ones.
          </p>
          <Button asChild className="bg-indigo-600 hover:bg-indigo-700">
            <a href="/habit/new-habits">Create a new habit</a>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-lg border-none bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center">
          <Clock className="mr-2 h-5 w-5 text-indigo-500" />
          Daily Check-in
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <h3 className="text-lg font-medium mb-1">Good {getTimeOfDay()}, Entrepreneur!</h3>
          <p className="text-gray-500 dark:text-gray-400">Track your progress by checking in your habits for today.</p>
        </div>

        <AnimatePresence>
          {showFeedback && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className={`mb-4 p-4 rounded-lg ${
                feedbackType === "success"
                  ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300"
                  : feedbackType === "warning"
                    ? "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300"
                    : "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
              }`}
            >
              <div className="flex items-start">
                <Sparkles className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                <p>{feedbackMessage}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-4">
          {todayHabits.map((habit) => (
            <motion.div
              key={habit.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-medium">{habit.name}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{habit.description || "No description"}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className={`${
                      habit.completed
                        ? "bg-green-100 text-green-700 border-green-200 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800"
                        : "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
                    }`}
                    onClick={() => handleCheckIn(habit.id, true, habit.notes)}
                    disabled={loading[habit.id]}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Done
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className={`${
                      !habit.completed
                        ? "bg-red-100 text-red-700 border-red-200 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800"
                        : "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
                    }`}
                    onClick={() => handleCheckIn(habit.id, false, habit.notes)}
                    disabled={loading[habit.id]}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Skip
                  </Button>
                </div>
              </div>
              <Textarea
                placeholder="Add notes about today's habit (optional)"
                className="mt-2 h-20 resize-none"
                value={habit.notes || ""}
                onChange={(e) => {
                  setTodayHabits((prev) => prev.map((h) => (h.id === habit.id ? { ...h, notes: e.target.value } : h)))
                }}
                onBlur={() => {
                  if (habit.completed !== undefined) {
                    handleCheckIn(habit.id, habit.completed, habit.notes)
                  }
                }}
              />
            </motion.div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
          <div className="flex items-center">
            <Lightbulb className="h-5 w-5 text-amber-500 mr-2" />
            <p className="text-sm text-indigo-700 dark:text-indigo-300">
              <span className="font-medium">Pro Tip:</span> Checking in daily, even when you miss a habit, builds
              self-awareness and improves long-term success.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
