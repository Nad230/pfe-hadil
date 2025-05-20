"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Award, Star, Trophy, Medal, Flame, Target, CheckCircle, Calendar } from "lucide-react"
import type { Habit } from "@/lib/types/habits"

interface BadgeProgressProps {
  habits: Habit[]
}

interface BadgeProgress {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  progress: number
  threshold: number
  color: string
}

export function BadgeProgress({ habits }: BadgeProgressProps) {
  const [badgeProgress, setBadgeProgress] = useState<BadgeProgress[]>([])

  useEffect(() => {
    if (!habits || habits.length === 0) return

    // Calculate badge progress
    const badges: BadgeProgress[] = [
      {
        id: "streak-master",
        name: "Streak Master",
        description: "Maintain a 7-day streak on any habit",
        icon: <Flame className="h-5 w-5" />,
        progress: 0,
        threshold: 7,
        color: "text-orange-500",
      },
      {
        id: "completion-champion",
        name: "Completion Champion",
        description: "Complete 20 habit check-ins",
        icon: <CheckCircle className="h-5 w-5" />,
        progress: 0,
        threshold: 20,
        color: "text-green-500",
      },
      {
        id: "habit-collector",
        name: "Habit Collector",
        description: "Create and maintain 5 active habits",
        icon: <Star className="h-5 w-5" />,
        progress: 0,
        threshold: 5,
        color: "text-amber-500",
      },
      {
        id: "perfect-week",
        name: "Perfect Week",
        description: "Complete all habits for 7 consecutive days",
        icon: <Calendar className="h-5 w-5" />,
        progress: 0,
        threshold: 7,
        color: "text-indigo-500",
      },
      {
        id: "goal-achiever",
        name: "Goal Achiever",
        description: "Complete a habit linked to a goal",
        icon: <Target className="h-5 w-5" />,
        progress: 0,
        threshold: 1,
        color: "text-blue-500",
      },
    ]

    // Calculate progress for each badge
    const maxStreak = Math.max(...habits.map((h) => h.streak), 0)
    badges[0].progress = Math.min(maxStreak, badges[0].threshold)

    const totalCompletions = habits.reduce((sum, habit) => {
      const completions = habit.completions || []
      return sum + completions.filter((c) => c.completed).length
    }, 0)
    badges[1].progress = Math.min(totalCompletions, badges[1].threshold)

    const activeHabits = habits.filter((h) => h.status === "InProgress").length
    badges[2].progress = Math.min(activeHabits, badges[2].threshold)

    // Calculate perfect week (this is simplified - would need more complex logic in a real app)
    const today = new Date()
    const weekAgo = new Date()
    weekAgo.setDate(today.getDate() - 7)

    let perfectDays = 0
    for (let i = 0; i < 7; i++) {
      const date = new Date()
      date.setDate(today.getDate() - i)
      const dateStr = date.toISOString().split("T")[0]

      const allCompletedForDay = habits.every((habit) => {
        const completions = habit.completions || []
        const dayCompletion = completions.find((c) => new Date(c.date).toISOString().split("T")[0] === dateStr)
        return dayCompletion?.completed || false
      })

      if (allCompletedForDay) perfectDays++
      else break // Break streak if a day is missed
    }
    badges[3].progress = perfectDays

    // Goal achiever
    const habitWithCompletedGoal = habits.some(
      (h) => h.goalId && h.status === "Completed" && h.goal?.status === "Completed",
    )
    badges[4].progress = habitWithCompletedGoal ? 1 : 0

    setBadgeProgress(badges)
  }, [habits])

  return (
    <Card className="shadow-lg border-none bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center">
          <Trophy className="mr-2 h-5 w-5 text-amber-500" />
          Badge Progress
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {badgeProgress.map((badge, index) => (
            <motion.div
              key={badge.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-full bg-white dark:bg-gray-800 ${badge.color}`}>{badge.icon}</div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="font-medium">{badge.name}</h3>
                    <span className="text-sm font-medium">
                      {badge.progress}/{badge.threshold}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{badge.description}</p>
                  <Progress
                    value={(badge.progress / badge.threshold) * 100}
                    className="h-2"
                    indicatorClassName={
                      badge.progress >= badge.threshold
                        ? "bg-green-500"
                        : badge.id === "streak-master"
                          ? "bg-orange-500"
                          : badge.id === "completion-champion"
                            ? "bg-green-500"
                            : badge.id === "habit-collector"
                              ? "bg-amber-500"
                              : badge.id === "perfect-week"
                                ? "bg-indigo-500"
                                : "bg-blue-500"
                    }
                  />
                  {badge.progress >= badge.threshold && (
                    <div className="mt-2 text-sm text-green-600 dark:text-green-400 flex items-center">
                      <Medal className="h-4 w-4 mr-1" />
                      Badge Earned!
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
          <div className="flex items-start">
            <Award className="h-5 w-5 text-amber-500 mt-0.5 mr-2 flex-shrink-0" />
            <p className="text-sm text-amber-700 dark:text-amber-300">
              Earning badges increases your discipline score and unlocks special features. Keep up the good work!
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
