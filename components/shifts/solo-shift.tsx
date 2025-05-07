"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Play, Pause, StopCircle } from "lucide-react"
import { formatDuration } from "@/lib/utils/time"
import { toast } from "sonner"
import { useShiftStore } from "../stores/useShiftStore" // ⬅️ this is the store you made
import Cookies from "js-cookie"
import { ArrowUpRight } from "lucide-react"

export function SoloShift() {
  const isTracking = useShiftStore((state) => state.isTracking)
  const startShift = useShiftStore((state) => state.startShift)
  const stopShift = useShiftStore((state) => state.stopShift)
  const getElapsed = useShiftStore((state) => state.getElapsed)

  const [duration, setDuration] = useState(0)
  const [note, setNote] = useState("")
  const [timeEntryId, setTimeEntryId] = useState<string | null>(null) // <-- Add time entry ID state



  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isTracking) {
      interval = setInterval(() => {
        setDuration(Math.floor(getElapsed() / 1000))
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isTracking, getElapsed])

  const handleStart = async () => {
    try {
      const response = await fetch("http://localhost:3000/time-entry/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
        body: JSON.stringify({ notes: note }),
      })

      if (!response.ok) throw new Error("Failed to start time entry")
      
      const data = await response.json()
      setTimeEntryId(data.id) // Store the time entry ID
      startShift()
      toast.success("Shift started! Time to be productive! ⚡")
    } catch (error) {
      console.error(error)
      toast.error("Failed to start shift")
    }
  }

  const handlePause = () => {
    toast.info("Shift paused (but not stopped)")
    stopShift()
  }

  const handleStop = async () => {
    if (!timeEntryId) return

    try {
      const response = await fetch(
        `http://localhost:3000/time-entry/${timeEntryId}/stop`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json", // Add content type
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
          credentials: "include",
        }
      )

      if (!response.ok) throw new Error("Failed to stop time entry")

      const hours = duration / 3600
      toast.success(
        `Great job! You've worked ${hours.toFixed(1)} hours. Time for a break! ☕`,
        { 
          duration: 5000,
          action: note && {
            label: "View Note",
            onClick: () => alert(note), // Quick preview
          }
        }
      )
      
      stopShift()
      setDuration(0)
      setNote("")
      setTimeEntryId(null)
    } catch (error) {
      console.error(error)
      toast.error("Failed to stop shift")
    }
  }

  const handleAppendNote = async () => {
    if (!timeEntryId || !note.trim()) return
  
    try {
      const response = await fetch(`http://localhost:3000/time-entry/${timeEntryId}/add-note`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
        body: JSON.stringify({ note }),
      })
  
      if (!response.ok) throw new Error("Failed to send note")
  
      toast.success("Note added!")
      setNote("") // Clear the input after sending
    } catch (error) {
      console.error(error)
      toast.error("Could not send note")
    }
  }
  


  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isTracking) {
      interval = setInterval(() => {
        setDuration(Math.floor(getElapsed() / 1000))
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isTracking, getElapsed])



 

  return (
    <div className="space-y-8">
      <div className="flex flex-col items-center justify-center gap-4">
        <motion.div
          animate={{
            scale: isTracking ? [1, 1.02, 1] : 1,
            transition: {
              repeat: isTracking ? Infinity : 0,
              duration: 2
            }
          }}
          className="relative w-48 h-48 rounded-full bg-primary/5 flex items-center justify-center"
        >
          <div className="text-4xl font-mono">
            {formatDuration(duration)}
          </div>
          {isTracking && (
            <motion.div
              className="absolute inset-0 rounded-full bg-primary/10"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [1, 0, 1]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          )}
        </motion.div>

        <AnimatePresence mode="wait">
          {!isTracking && duration === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <Button size="lg" className="gap-2" onClick={handleStart}>
                <Play className="h-5 w-5" />
                Start Shift
              </Button>
            </motion.div>
          )}

          {isTracking && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center gap-2"
            >
              <Button size="lg" variant="outline" onClick={handlePause}>
                <Pause className="h-5 w-5" />
              </Button>
              <Button size="lg" variant="destructive" onClick={handleStop}>
                <StopCircle className="h-5 w-5" />
              </Button>
            </motion.div>
          )}

          {!isTracking && duration > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center gap-2"
            >
              <Button size="lg" onClick={handleStart}>
                <Play className="h-5 w-5" />
              </Button>
              <Button size="lg" variant="destructive" onClick={handleStop}>
                <StopCircle className="h-5 w-5" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="space-y-4 flex items-center gap-2">
  <Input
    placeholder="Add a note about what you're working on (optional)"
    value={note}
    onChange={(e) => setNote(e.target.value)}
    disabled={!isTracking && duration === 0}
  />

  {isTracking && timeEntryId && (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleAppendNote}
      title="Send Note"
      className="text-primary hover:text-primary/80"
    >
      <ArrowUpRight className="w-5 h-5" />
    </Button>
  )}
</div>

    </div>
  )
}
