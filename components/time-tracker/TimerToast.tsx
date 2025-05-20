"use client"

import { Button } from "@/components/ui/button"
import { StopCircle, Pause, Play } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { useTimerStore } from "@/lib/stores/useTimerStore"
import { formatDuration } from "@/lib/utils/time"
import { useEffect, useState } from "react"
import { useTimerControls } from "@/hooks/useTimerControls"

export default function TimerToast() {
  const { isRunning, isPaused, startTime, pausedDuration } = useTimerStore()
  const { stopTimer, pauseTimer, resumeTimer } = useTimerControls()
  const [currentDuration, setCurrentDuration] = useState(0)

  // Use the global timer state from useTimerStore
  useEffect(() => {
    let interval: NodeJS.Timeout
    
    if (isRunning && startTime && !isPaused) {
      // Initialize with the correct duration
      setCurrentDuration(Math.floor((Date.now() - startTime) / 1000) + (pausedDuration || 0))
      
      // Update every second
      interval = setInterval(() => {
        setCurrentDuration(Math.floor((Date.now() - startTime) / 1000) + (pausedDuration || 0))
      }, 1000)
    } else if (isPaused && pausedDuration) {
      // When paused, show the frozen duration
      setCurrentDuration(pausedDuration)
    }
    
    return () => clearInterval(interval)
  }, [isRunning, startTime, isPaused, pausedDuration])

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
            <p className="text-sm text-muted-foreground">
              {isPaused ? "Timer paused" : "Timer running"}
            </p>
            <p className="text-xl font-mono">{formatDuration(currentDuration)}</p>
          </div>
          
          <div className="flex gap-2">
            {isPaused ? (
              <Button size="sm" onClick={resumeTimer}>
                <Play className="h-4 w-4 mr-1" />
                Resume
              </Button>
            ) : (
              <Button size="sm" variant="outline" onClick={pauseTimer}>
                <Pause className="h-4 w-4 mr-1" />
                Pause
              </Button>
            )}
            
            <Button size="sm" variant="destructive" onClick={stopTimer}>
              <StopCircle className="h-4 w-4 mr-1" />
              Stop
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}