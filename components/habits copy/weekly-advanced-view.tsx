"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Calendar, CheckCircle, XCircle, Zap, Award, TrendingUp } from "lucide-react"
import type { Habit } from "@/lib/types/habits"

interface WeeklyAdvancedViewProps {
  habits: Habit[]
}

export function WeeklyAdvancedView({ habits }: WeeklyAdvancedViewProps) {
  const [weeklyData, setWeeklyData] = useState<{
    daysCompleted: number
    totalDays: number
    progress: number
    dailyStatus: { date: string; day: string; completed: boolean; total: number }[]
    motivationalMessage: string
  }>({
    daysCompleted: 0,
    totalDays: 7,
    progress: 0,
    dailyStatus: [],
    motivationalMessage: "",
  })

  useEffect(() => {
    if (!habits || habits.length === 0) return

    // Get the current week's days
    const today = new Date()
    const currentDay = today.getDay() // 0 = Sunday, 1 = Monday, etc.
    const daysInWeek = 7

    // Create array of days for the current week
    const days = Array.from({ length: daysInWeek }, (_, i) => {
      const date = new Date(today)
      // Adjust to get days from the beginning of the week (Sunday)
      date.setDate(today.getDate() - currentDay + i)
      return {
        date: date.toISOString().split("T")[0],
        day: date.toLocaleDateString("en-US", { weekday: "short" }),
        completed: false,
        total: 0,
      }
    })

    // Count completions for each day
    habits.forEach((habit) => {
      const completions = habit.completions || []

      completions.forEach((completion) => {
        const completionDate = new Date(completion.date).toISOString().split("T")[0]
        const dayIndex = days.findIndex((d) => d.date === completionDate)

        if (dayIndex >= 0) {
          days[dayIndex].total++
          if (completion.completed) {
            days[dayIndex].completed = true
          }
        }
      })
    })

    // Calculate days completed this week
    const daysWithCompletions = days.filter((day) => day.completed).length
    const progress = Math.round((daysWithCompletions / daysInWeek) * 100)

    // Generate motivational message based on progress
    let message = ""
    if (progress >= 85) {
      message = "Exceptional week! You're building powerful entrepreneurial habits."
    } else if (progress >= 70) {
      message = "Great progress this week! Consistency is building your success."
    } else if (progress >= 50) {
      message = "Solid effort! Keep pushing to reach your entrepreneurial goals."
    } else if (progress >= 30) {
      message = "You're making progress. Each habit completed builds your foundation."
    } else {
      message = "Every habit counts. Start small and build momentum this week."
    }

    setWeeklyData({
      daysCompleted: daysWithCompletions,
      totalDays: daysInWeek,
      progress,
      dailyStatus: days,
      motivationalMessage: message,
    })
  }, [habits])

  return (
    <Card className="shadow-lg border-none bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center">
          <Calendar className="mr-2 h-5 w-5 text-indigo-500" />
          Weekly Progress View
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center">
              <span className="text-lg font-medium">Weekly Goal</span>
              <Badge className="ml-2 bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300">
                {weeklyData.daysCompleted}/{weeklyData.totalDays} days
              </Badge>
            </div>
            <span className="text-lg font-medium">{weeklyData.progress}%</span>
          </div>
          <Progress
            value={weeklyData.progress}
            className="h-2.5 mb-1"
            indicatorClassName={
              weeklyData.progress >= 85 ? "bg-green-500" : weeklyData.progress >= 50 ? "bg-indigo-500" : "bg-amber-500"
            }
          />
        </div>

        <div className="grid grid-cols-7 gap-1 mb-6">
          {weeklyData.dailyStatus.map((day, index) => (
            <motion.div
              key={day.date}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="flex flex-col items-center"
            >
              <div className="text-xs text-gray-500 mb-1">{day.day}</div>
              <div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center
                  ${day.completed ? "bg-green-100 dark:bg-green-900/30" : "bg-gray-100 dark:bg-gray-700"}
                `}
              >
                {day.completed ? (
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                ) : (
                  <XCircle className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                )}
              </div>
              <div className="text-xs text-center mt-1">{day.total > 0 ? `${day.total} habits` : "No data"}</div>
            </motion.div>
          ))}
        </div>

        <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg">
          <div className="flex items-start">
            <Zap className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mt-0.5 mr-2 flex-shrink-0" />
            <p className="text-indigo-700 dark:text-indigo-300 italic">{weeklyData.motivationalMessage}</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="flex items-center p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
            <Award className="h-8 w-8 text-amber-500 mr-3" />
            <div>
              <div className="font-medium">Streak Bonus</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">+5% discipline for 5+ day streaks</div>
            </div>
          </div>
          <div className="flex items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <TrendingUp className="h-8 w-8 text-green-500 mr-3" />
            <div>
              <div className="font-medium">Consistency</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {weeklyData.progress >= 70 ? "Excellent" : weeklyData.progress >= 40 ? "Good" : "Building"}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
