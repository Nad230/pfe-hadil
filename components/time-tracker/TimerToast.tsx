// components/TimerToast.tsx (updated)
"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { formatDuration } from "@/lib/utils/time"
import { StopCircle } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { useTimerStore } from "../../lib/stores/useTimerStore"

export default function TimerToast() {
  const { isRunning, duration, stopTimer, updateDuration } = useTimerStore()

  // Update duration every second
  useEffect(() => {
    if (!isRunning) return
    
    const interval = setInterval(() => {
      updateDuration()
    }, 1000)

    return () => clearInterval(interval)
  }, [isRunning, updateDuration])

  return (
    <AnimatePresence>
      {isRunning && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-4 right-4 z-50 bg-background border p-4 rounded-xl shadow-lg flex items-center gap-4"
        >
          <div>
            <p className="text-sm text-muted-foreground">Timer running</p>
            <p className="text-xl font-mono">{formatDuration(duration)}</p>
          </div>
          <Button size="sm" variant="destructive" onClick={stopTimer}>
            <StopCircle className="h-4 w-4 mr-1" /> Stop
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}