"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Sparkles, TrendingUp, Award, Target } from "lucide-react"
import type { Habit, DisciplineScore } from "@/lib/types/habits"
import { calculateDisciplineScore } from "@/lib/discipline"

interface DisciplineScoreProps {
  habits: Habit[]
}

export function DisciplineScore({ habits }: DisciplineScoreProps) {
  const [score, setScore] = useState<DisciplineScore>({
    score: 0,
    level: "Novice",
    nextLevel: "Apprentice",
    progress: 0,
  })
  const [animate, setAnimate] = useState(false)

  useEffect(() => {
    const calculatedScore = calculateDisciplineScore(habits)
    setScore(calculatedScore)
    setAnimate(true)

    const timer = setTimeout(() => setAnimate(false), 1000)
    return () => clearTimeout(timer)
  }, [habits])

  const getLevelColor = (level: string) => {
    switch (level) {
      case "Novice":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
      case "Apprentice":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
      case "Practitioner":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
      case "Expert":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
      case "Master":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
      case "Grandmaster":
        return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  return (
    <Card className="overflow-hidden border-t-4 border-t-indigo-500">
      <CardHeader className="pb-2">
        <CardTitle className="flex justify-between items-center">
          <span className="flex items-center">
            <Sparkles className="mr-2 h-5 w-5 text-indigo-500" />
            Discipline Score
          </span>
          <Badge className={getLevelColor(score.level)}>{score.level}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">Progress to {score.nextLevel}</span>
          <span className="text-sm font-medium">{score.progress}%</span>
        </div>
        <Progress value={score.progress} className="h-2 mb-6" indicatorClassName="bg-indigo-500" />

        <div className="flex items-center justify-center mb-6">
          <motion.div
            className="relative w-32 h-32 flex items-center justify-center"
            initial={{ scale: 0.8 }}
            animate={{ scale: animate ? 1.1 : 1 }}
            transition={{ duration: 0.5 }}
          >
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                className="text-gray-200 dark:text-gray-800"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                strokeDasharray={`${2 * Math.PI * 45}`}
                strokeDashoffset={`${2 * Math.PI * 45 * (1 - score.score / 100)}`}
                strokeLinecap="round"
                className="text-indigo-500"
                transform="rotate(-90 50 50)"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold">{score.score}</span>
              <span className="text-xs text-gray-500">SCORE</span>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="flex flex-col items-center p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <TrendingUp className="h-5 w-5 text-indigo-500 mb-1" />
            <span className="text-xs text-gray-500">Consistency</span>
          </div>
          <div className="flex flex-col items-center p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <Award className="h-5 w-5 text-amber-500 mb-1" />
            <span className="text-xs text-gray-500">Achievement</span>
          </div>
          <div className="flex flex-col items-center p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <Target className="h-5 w-5 text-green-500 mb-1" />
            <span className="text-xs text-gray-500">Focus</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
