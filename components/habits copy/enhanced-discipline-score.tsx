"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Sparkles, TrendingUp, Award, Target, Star, Trophy } from "lucide-react"
import type { Habit, DisciplineScore } from "@/lib/types/habits"
import { calculateDisciplineScore } from "@/lib/discipline"

interface EnhancedDisciplineScoreProps {
  habits: Habit[]
  previousScore?: number
}

export function EnhancedDisciplineScore({ habits, previousScore = 0 }: EnhancedDisciplineScoreProps) {
  const [score, setScore] = useState<DisciplineScore>({
    score: 0,
    level: "Novice",
    nextLevel: "Apprentice",
    progress: 0,
  })
  const [animate, setAnimate] = useState(false)
  const [showLevelUp, setShowLevelUp] = useState(false)
  const [scoreIncreased, setScoreIncreased] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const calculatedScore = calculateDisciplineScore(habits)

    // Check if score increased from previous
    const hasIncreased = calculatedScore.score > previousScore
    setScoreIncreased(hasIncreased)

    // Check if level changed
    const levelChanged = calculatedScore.level !== score.level && score.score > 0

    setScore(calculatedScore)
    setAnimate(true)

    if (levelChanged) {
      setShowLevelUp(true)

      // Simple confetti effect without external library
      if (cardRef.current) {
        // Create confetti elements
        for (let i = 0; i < 50; i++) {
          const confetti = document.createElement("div")
          confetti.className = "absolute w-2 h-2 rounded-full"
          confetti.style.backgroundColor = ["#4f46e5", "#8b5cf6", "#a855f7"][Math.floor(Math.random() * 3)]
          confetti.style.top = `${cardRef.current.offsetTop + Math.random() * cardRef.current.offsetHeight}px`
          confetti.style.left = `${cardRef.current.offsetLeft + Math.random() * cardRef.current.offsetWidth}px`
          confetti.style.zIndex = "50"
          confetti.style.transform = `rotate(${Math.random() * 360}deg)`
          confetti.style.animation = `fall-${Math.floor(Math.random() * 3) + 1} ${Math.random() * 2 + 1}s forwards`
          document.body.appendChild(confetti)

          // Remove after animation
          setTimeout(() => {
            document.body.removeChild(confetti)
          }, 3000)
        }
      }

      // Hide level up message after 5 seconds
      setTimeout(() => {
        setShowLevelUp(false)
      }, 5000)
    }

    const timer = setTimeout(() => setAnimate(false), 1000)
    return () => clearTimeout(timer)
  }, [habits, previousScore, score.level])

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

  const getLevelIcon = (level: string) => {
    switch (level) {
      case "Novice":
        return <Star className="h-4 w-4" />
      case "Apprentice":
        return <TrendingUp className="h-4 w-4" />
      case "Practitioner":
        return <Target className="h-4 w-4" />
      case "Expert":
        return <Award className="h-4 w-4" />
      case "Master":
        return <Trophy className="h-4 w-4" />
      case "Grandmaster":
        return <Sparkles className="h-4 w-4" />
      default:
        return <Star className="h-4 w-4" />
    }
  }

  return (
    <Card
      ref={cardRef}
      className="overflow-hidden border-t-4 border-t-indigo-500 shadow-lg bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm"
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex justify-between items-center">
          <span className="flex items-center">
            <Sparkles className="mr-2 h-5 w-5 text-indigo-500" />
            Discipline Score
          </span>
          <Badge className={`flex items-center gap-1 ${getLevelColor(score.level)}`}>
            {getLevelIcon(score.level)}
            {score.level}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <AnimatePresence>
          {showLevelUp && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-800 dark:text-indigo-300"
            >
              <div className="flex items-center">
                <Trophy className="h-5 w-5 mr-2 text-amber-500" />
                <p className="font-medium">
                  Level Up! You've reached <span className="font-bold">{score.level}</span> status!
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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
              <motion.circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                strokeDasharray={`${2 * Math.PI * 45}`}
                initial={{ strokeDashoffset: `${2 * Math.PI * 45 * (1 - previousScore / 100)}` }}
                animate={{ strokeDashoffset: `${2 * Math.PI * 45 * (1 - score.score / 100)}` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                strokeLinecap="round"
                className="text-indigo-500"
                transform="rotate(-90 50 50)"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.span
                className="text-3xl font-bold"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                key={score.score}
              >
                {score.score}
              </motion.span>
              <span className="text-xs text-gray-500">SCORE</span>
              {scoreIncreased && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute -bottom-8 text-green-600 dark:text-green-400 font-medium text-sm flex items-center"
                >
                  <TrendingUp className="h-4 w-4 mr-1" />+{(score.score - previousScore).toFixed(1)}
                </motion.div>
              )}
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

        <div className="mt-4 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
          <p className="text-sm text-indigo-700 dark:text-indigo-300">
            <span className="font-medium">Next Badge:</span> Maintain your streak for{" "}
            {7 - ((habits.find((h) => h.streak > 0)?.streak || 0) % 7)} more days to earn the "Consistency Champion"
            badge!
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
