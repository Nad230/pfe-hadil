"use client"

import { motion } from "framer-motion"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts"
import { useTheme } from "next-themes"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Calendar, TrendingUp, TrendingDown } from "lucide-react"

const progressData = [
  { week: "Week 1", score: 75, average: 70, goal: 80 },
  { week: "Week 2", score: 82, average: 72, goal: 80 },
  { week: "Week 3", score: 78, average: 73, goal: 80 },
  { week: "Week 4", score: 85, average: 75, goal: 80 },
  { week: "Week 5", score: 90, average: 76, goal: 80 },
  { week: "Week 6", score: 88, average: 77, goal: 80 },
  { week: "Week 7", score: 92, average: 78, goal: 80 },
]

const timeRanges = ["1W", "1M", "3M", "6M", "1Y", "ALL"] as const
type TimeRange = typeof timeRanges[number]

export function ProgressTracker() {
  const { theme } = useTheme()
  const isDark = theme === "dark"
  const [selectedRange, setSelectedRange] = useState<TimeRange>("1M")

  const currentScore = progressData[progressData.length - 1].score
  const previousScore = progressData[progressData.length - 2].score
  const improvement = currentScore - previousScore
  const isImproving = improvement > 0

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Learning Progress</h2>
        <div className="flex items-center gap-2">
          {timeRanges.map((range) => (
            <Button
              key={range}
              variant={selectedRange === range ? "default" : "ghost"}
              size="sm"
              onClick={() => setSelectedRange(range)}
              className="px-3"
            >
              {range}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/5"
        >
          <div className="text-sm text-muted-foreground mb-2">Current Score</div>
          <div className="text-2xl font-bold">{currentScore}%</div>
          <div className={`flex items-center gap-1 text-sm ${isImproving ? "text-green-500" : "text-red-500"}`}>
            {isImproving ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            {Math.abs(improvement)}% from last week
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-indigo-500/5"
        >
          <div className="text-sm text-muted-foreground mb-2">Average Score</div>
          <div className="text-2xl font-bold">
            {progressData[progressData.length - 1].average}%
          </div>
          <div className="text-sm text-muted-foreground">Class Average</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/5"
        >
          <div className="text-sm text-muted-foreground mb-2">Target Score</div>
          <div className="text-2xl font-bold">80%</div>
          <div className="text-sm text-muted-foreground">Course Goal</div>
        </motion.div>
      </div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="h-[300px]"
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={progressData}>
            <defs>
              <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="averageGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0.2} />
                <stop offset="100%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0} />
              </linearGradient>
            </defs>
            
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}
              vertical={false}
            />
            
            <XAxis
              dataKey="week"
              stroke={isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)"}
              tick={{ fill: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)" }}
            />
            
            <YAxis
              stroke={isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)"}
              tick={{ fill: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)" }}
              domain={[0, 100]}
            />
            
            <Tooltip
              contentStyle={{
                backgroundColor: isDark ? "rgba(0,0,0,0.8)" : "rgba(255,255,255,0.8)",
                border: "none",
                borderRadius: "0.5rem",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              }}
            />

            <Area
              type="monotone"
              dataKey="average"
              stroke="hsl(var(--muted-foreground))"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#averageGradient)"
            />

            <Area
              type="monotone"
              dataKey="score"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#scoreGradient)"
            />

            <Line
              type="monotone"
              dataKey="goal"
              stroke={isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)"}
              strokeDasharray="5 5"
              strokeWidth={2}
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      <div className="grid grid-cols-3 gap-4 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/5"
        >
          <p className="text-2xl font-bold text-green-500">92%</p>
          <p className="text-sm text-muted-foreground">Highest Score</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-indigo-500/5"
        >
          <p className="text-2xl font-bold">84.3%</p>
          <p className="text-sm text-muted-foreground">Average Score</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/5"
        >
          <p className="text-2xl font-bold text-blue-500">+15%</p>
          <p className="text-sm text-muted-foreground">Improvement</p>
        </motion.div>
      </div>
    </div>
  )
}