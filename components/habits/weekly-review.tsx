"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { BarChart2, TrendingUp, Award, AlertTriangle, ArrowUp, ArrowDown, Lightbulb } from "lucide-react"
import type { Habit } from "@/lib/types/habits"
import { generateWeeklyReview, generateSuggestions } from "@/lib/discipline"

interface WeeklyReviewProps {
  habits: Habit[]
}

export function WeeklyReview({ habits }: WeeklyReviewProps) {
  const [review, setReview] = useState({
    completionRate: 0,
    streakGrowth: 0,
    topHabit: null as string | null,
    improvementArea: null as string | null,
    summary: "",
  })
  const [suggestions, setSuggestions] = useState<string[]>([])

  useEffect(() => {
    if (habits && habits.length > 0) {
      const weeklyReview = generateWeeklyReview(habits)
      setReview(weeklyReview)

      const habitSuggestions = generateSuggestions(habits)
      setSuggestions(habitSuggestions)
    }
  }, [habits])

  const getCompletionRateColor = (rate: number) => {
    if (rate >= 80) return "bg-green-500"
    if (rate >= 60) return "bg-blue-500"
    if (rate >= 40) return "bg-amber-500"
    return "bg-red-500"
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center">
          <BarChart2 className="mr-2 h-5 w-5 text-indigo-500" />
          Weekly Performance Review
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Taux de complétion */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Completion Rate</span>
              <span className="text-sm font-medium">{review.completionRate}%</span>
            </div>
            <Progress
              value={review.completionRate}
              className="h-2"
              indicatorClassName={getCompletionRateColor(review.completionRate)}
            />
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
              <div className="flex items-center mb-1">
                <TrendingUp className="w-4 h-4 mr-2 text-indigo-500" />
                <span className="text-sm font-medium">Streak Growth</span>
              </div>
              <div className="flex items-center">
                <span className="text-xl font-bold">{review.streakGrowth}</span>
                {review.streakGrowth > 0 ? (
                  <Badge className="ml-2 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                    <ArrowUp className="w-3 h-3 mr-1" /> Growing
                  </Badge>
                ) : (
                  <Badge className="ml-2 bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                    <ArrowDown className="w-3 h-3 mr-1" /> Stagnant
                  </Badge>
                )}
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
              <div className="flex items-center mb-1">
                <Award className="w-4 h-4 mr-2 text-amber-500" />
                <span className="text-sm font-medium">Top Performer</span>
              </div>
              {review.topHabit ? (
                <div className="text-sm font-medium truncate">{review.topHabit}</div>
              ) : (
                <div className="text-sm text-gray-500">No data yet</div>
              )}
            </div>
          </div>

          {/* Résumé */}
          <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg">
            <p className="text-sm text-indigo-700 dark:text-indigo-300">{review.summary}</p>
          </div>

          {/* Zone d'amélioration */}
          {review.improvementArea && (
            <div className="flex items-start bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-amber-500 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-amber-700 dark:text-amber-300 mb-1">Focus Area</h4>
                <p className="text-sm text-amber-600 dark:text-amber-400">
                  Consider improving consistency with <strong>{review.improvementArea}</strong>
                </p>
              </div>
            </div>
          )}

          {/* Suggestions */}
          <div>
            <h4 className="font-medium flex items-center mb-3">
              <Lightbulb className="w-4 h-4 mr-2 text-amber-500" />
              Suggestions for Improvement
            </h4>

            <div className="space-y-2">
              {suggestions.map((suggestion, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="flex items-start"
                >
                  <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 mr-2"></div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{suggestion}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
