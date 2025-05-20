"use client"

import { Card } from "@/components/ui/card"
import { motion } from "framer-motion"
import { BookOpen, Trophy, Clock, Target } from "lucide-react"

const stats = [
  {
    title: "Courses Enrolled",
    value: "12",
    icon: BookOpen,
    color: "text-blue-500",
  },
  {
    title: "Achievements",
    value: "24",
    icon: Trophy,
    color: "text-yellow-500",
  },
  {
    title: "Study Hours",
    value: "156",
    icon: Clock,
    color: "text-green-500",
  },
  {
    title: "Goals Completed",
    value: "8",
    icon: Target,
    color: "text-purple-500",
  },
]

export function AcademicStats() {
  return (
    <>
      {stats.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="p-6 glassmorphism">
            <div className="flex items-center gap-4">
              <div className={`${stat.color}`}>
                <stat.icon className="h-8 w-8" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <h3 className="text-2xl font-bold">{stat.value}</h3>
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </>
  )
}