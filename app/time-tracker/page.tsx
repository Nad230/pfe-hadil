"use client"

import { useState, useEffect } from "react"
import { TimeTrackerHeader } from "@/components/time-tracker/time-tracker-header"
import { TimeTrackerStats } from "@/components/time-tracker/time-tracker-stats"
import { TimeTrackerTimer } from "@/components/time-tracker/time-tracker-timer"
import { TimeTrackerEntries } from "@/components/time-tracker/time-tracker-entries"
import { mockTimeReport } from "@/lib/mock-data/time-tracker"
import { motion } from "framer-motion"
import { getTimeOfDay } from "@/lib/utils/time"

export default function TimeTrackerPage() {
  const [mounted, setMounted] = useState(false)
  const timeOfDay = getTimeOfDay()
  
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const gradients = {
    morning: "from-amber-500 to-orange-600",
    afternoon: "from-blue-500 to-purple-600",
    evening: "from-indigo-600 to-purple-700",
    night: "from-slate-800 to-slate-900"
  }

  return (
    <div className="space-y-8">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`relative overflow-hidden rounded-lg bg-gradient-to-r ${gradients[timeOfDay]} p-8 text-white`}
      >
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative z-10">
          <TimeTrackerHeader />
          <p className="mt-2 text-lg text-white/90">
            Time is Money. Track it Wisely!
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <TimeTrackerStats report={mockTimeReport} />
      </motion.div>

      <div className="grid gap-8 lg:grid-cols-[1fr,1fr]">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <TimeTrackerTimer />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <TimeTrackerEntries entries={mockTimeReport.entries} />
        </motion.div>
      </div>
    </div>
  )
}