"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, XCircle, Loader2, AlertCircle, Calendar, Info } from "lucide-react"
import { toast } from "sonner"
import { Progress } from "@/components/ui/progress"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { Habit } from "@/lib/types/habits"

interface HabitCompletionFormProps {
  habit: Habit
  onCompletionAdded: () => void
}

export function HabitCompletionForm({ habit, onCompletionAdded }: HabitCompletionFormProps) {
  const [notes, setNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [alreadyCompletedToday, setAlreadyCompletedToday] = useState(false)
  const [weeklyProgress, setWeeklyProgress] = useState({
    completed: 0,
    target: habit.weeklyTarget,
    startDate: null as Date | null,
    endDate: null as Date | null,
    daysLeft: 0,
    isTargetMet: false,
  })

  // Check if habit was already completed today and calculate weekly progress
  useEffect(() => {
    checkTodayCompletion()
    calculateWeeklyProgress()
  }, [habit])

  const checkTodayCompletion = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const completions = habit.completions || []
    const todayCompletion = completions.find((completion) => {
      const completionDate = new Date(completion.date)
      completionDate.setHours(0, 0, 0, 0)
      return completionDate.getTime() === today.getTime()
    })

    setAlreadyCompletedToday(!!todayCompletion)
  }

  // Update to use habit creation/restart date for week calculation
  const calculateWeeklyProgress = () => {
    if (!habit) return

    // Get the habit's updated date (which is reset when restarting)
    const habitStartDate = new Date(habit.updatedAt)
    habitStartDate.setHours(0, 0, 0, 0)

    // Calculate the end of the 7-day period
    const habitEndDate = new Date(habitStartDate)
    habitEndDate.setDate(habitStartDate.getDate() + 6)
    habitEndDate.setHours(23, 59, 59, 999)

    // Current date for comparison
    const today = new Date()

    const completions = habit.completions || []

    // If there are no completions (which happens after a reset), set progress to 0
    if (completions.length === 0) {
      setWeeklyProgress({
        completed: 0,
        target: habit.weeklyTarget,
        startDate: habitStartDate,
        endDate: habitEndDate,
        daysLeft: Math.max(0, Math.ceil((habitEndDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))),
        isTargetMet: false,
      })
      return
    }

    // Find completions for the current 7-day period
    const currentPeriodCompletions = completions.filter((completion) => {
      const completionDate = new Date(completion.date)
      // Normalize hours to avoid timezone issues
      completionDate.setHours(12, 0, 0, 0)
      return completionDate >= habitStartDate && completionDate <= habitEndDate && completion.completed
    })

    const completed = currentPeriodCompletions.length
    const daysLeft = Math.max(0, Math.ceil((habitEndDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)))
    const isTargetMet = completed >= habit.weeklyTarget

    setWeeklyProgress({
      completed,
      target: habit.weeklyTarget,
      startDate: habitStartDate,
      endDate: habitEndDate,
      daysLeft,
      isTargetMet,
    })
  }

  const formatDate = (date: Date | null) => {
    if (!date) return "Not started"
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    })
  }

  // Update the recordCompletion function to ensure the date is correctly handled
  const recordCompletion = async (completed: boolean) => {
    setIsSubmitting(true)

    try {
      // Check if already completed today
      if (alreadyCompletedToday) {
        toast.error("Already recorded today", {
          description: "You can only record progress for this habit once per day.",
        })
        setIsSubmitting(false)
        return
      }

      // Check if weekly target is already met
      if (completed && weeklyProgress.isTargetMet) {
        toast.info("Weekly target already met", {
          description: `You've already met your target of ${habit.weeklyTarget} days for this period!`,
        })
      }

      // Get token from localStorage (try both possible token names)
      const token = localStorage.getItem("token") || localStorage.getItem("access_token")
      if (!token) {
        toast.error("Authentication required", {
          description: "Please log in to record habit completion",
        })
        return
      }

      console.log(`Recording completion for habit ${habit.id}: ${completed ? "completed" : "missed"}`)

      // Use the current date with time set to noon to avoid timezone issues
      const today = new Date()
      today.setHours(12, 0, 0, 0)

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/habits/${habit.id}/completion`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          completed,
          notes: notes.trim() || undefined,
          date: today.toISOString(), // Explicitly send the current date
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `Failed to record completion: ${response.status}`)
      }

      const data = await response.json()
      console.log("Completion recorded successfully:", data)

      // Update the habit with the new completion and streak
      const updatedHabit = { ...habit }
      updatedHabit.streak = completed ? habit.streak + 1 : 0

      if (!updatedHabit.completions) {
        updatedHabit.completions = []
      }

      updatedHabit.completions.unshift({
        id: data.id,
        habitId: habit.id,
        date: today.toISOString(),
        completed,
        notes: notes.trim() || undefined,
      })

      // Clear notes after successful submission
      setNotes("")

      // Update local state
      setAlreadyCompletedToday(true)
      calculateWeeklyProgress()

      // Show success toast
      toast.success(completed ? "Habit completed!" : "Habit missed", {
        description: completed
          ? `Great job! You've completed "${habit.name}". Your streak is now ${updatedHabit.streak} days!`
          : `You've recorded "${habit.name}" as missed today. Your streak has been reset.`,
      })

      // Notify parent component to refresh data
      onCompletionAdded()
    } catch (error) {
      console.error("Error recording completion:", error)
      toast.error("Error", {
        description: error instanceof Error ? error.message : "Failed to record habit completion",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Record Today's Progress</span>
          <span className="text-sm font-normal text-muted-foreground flex items-center">
            <span className="mr-2">
              {weeklyProgress.completed}/{weeklyProgress.target} days completed this week
            </span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="w-80">
                  <div className="space-y-2">
                    <p className="font-medium">7-Day Week Information</p>
                    <div className="grid grid-cols-2 gap-1 text-xs">
                      <span className="text-muted-foreground">Week Start:</span>
                      <span>{formatDate(weeklyProgress.startDate)}</span>
                      <span className="text-muted-foreground">Week End:</span>
                      <span>{formatDate(weeklyProgress.endDate)}</span>
                      <span className="text-muted-foreground">Days Left:</span>
                      <span>{weeklyProgress.daysLeft} days</span>
                      <span className="text-muted-foreground">Target Met:</span>
                      <span>{weeklyProgress.isTargetMet ? "Yes" : "No"}</span>
                      <span className="text-muted-foreground">Progress:</span>
                      <span>
                        {weeklyProgress.completed}/{weeklyProgress.target} days completed this week
                      </span>
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Weekly Progress</span>
            <span className="text-sm">
              {weeklyProgress.completed}/{weeklyProgress.target} days completed
            </span>
          </div>
          <Progress
            value={(weeklyProgress.completed / weeklyProgress.target) * 100}
            className="h-2"
            indicatorClassName={weeklyProgress.isTargetMet ? "bg-green-500" : ""}
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>
              Week: {formatDate(weeklyProgress.startDate)} - {formatDate(weeklyProgress.endDate)}
            </span>
            <span>{weeklyProgress.daysLeft} days left</span>
          </div>
        </div>

        {alreadyCompletedToday ? (
          <div className="bg-muted p-4 rounded-md flex items-center mb-4">
            <AlertCircle className="h-5 w-5 text-amber-500 mr-2" />
            <p className="text-sm">You've already recorded your progress for today.</p>
          </div>
        ) : weeklyProgress.isTargetMet ? (
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-md flex items-center mb-4">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            <p className="text-sm">
              You've met your target of {habit.weeklyTarget} days! Any additional completions will count toward
              exceeding your goal.
            </p>
          </div>
        ) : (
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md flex items-center mb-4">
            <Calendar className="h-5 w-5 text-blue-500 mr-2" />
            <p className="text-sm">
              You need {habit.weeklyTarget - weeklyProgress.completed} more{" "}
              {habit.weeklyTarget - weeklyProgress.completed === 1 ? "day" : "days"} to reach your target.
            </p>
          </div>
        )}

        <Textarea
          placeholder="Add notes about your progress (optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="min-h-[100px]"
          disabled={isSubmitting || alreadyCompletedToday}
        />
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
          onClick={() => recordCompletion(false)}
          disabled={isSubmitting || alreadyCompletedToday}
        >
          {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <XCircle className="mr-2 h-4 w-4" />}
          Missed
        </Button>
        <Button
          variant="outline"
          className="border-green-200 text-green-600 hover:bg-green-50 dark:border-green-800 dark:text-green-400 dark:hover:bg-green-950"
          onClick={() => recordCompletion(true)}
          disabled={isSubmitting || alreadyCompletedToday}
        >
          {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
          Completed
        </Button>
      </CardFooter>
    </Card>
  )
}
