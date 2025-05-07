"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Trophy, Star, Clock, Target } from "lucide-react"

export function CourseProgress() {
  const stats = [
    {
      label: "Course Progress",
      value: "65%",
      icon: Target,
      color: "text-blue-500",
      progress: 65
    },
    {
      label: "Time Spent",
      value: "12h 30m",
      icon: Clock,
      color: "text-green-500"
    },
    {
      label: "Points Earned",
      value: "2,450",
      icon: Star,
      color: "text-yellow-500"
    },
    {
      label: "Achievements",
      value: "8/12",
      icon: Trophy,
      color: "text-purple-500"
    }
  ]

  return (
    <div className="flex gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="p-4 min-w-[140px]">
            <div className="flex items-center gap-2">
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
              <span className="text-sm font-medium">{stat.label}</span>
            </div>
            <div className="mt-2 text-2xl font-bold">{stat.value}</div>
            {stat.progress && (
              <Progress value={stat.progress} className="mt-2 h-1" />
            )}
          </Card>
        </motion.div>
      ))}
    </div>
  )
}