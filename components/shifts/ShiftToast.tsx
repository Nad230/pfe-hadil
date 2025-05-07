// components/shift/ShiftToast.tsx
"use client"

import { useEffect, useState } from "react"
import { useShiftStore } from "../stores/useShiftStore"
import { Button } from "@/components/ui/button"
import { formatDuration } from "@/lib/utils/time"
import { StopCircle } from "lucide-react"

export default function ShiftToast() {
  const { isTracking, startTime, stopShift } = useShiftStore()
  const [duration, setDuration] = useState(0)

  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isTracking && startTime) {
      interval = setInterval(() => {
        setDuration(Math.floor((Date.now() - startTime) / 1000))
      }, 1000)
    }

    return () => clearInterval(interval)
  }, [isTracking, startTime])

  if (!isTracking) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-background border p-4 rounded-xl shadow-lg flex items-center gap-4 animate-in slide-in-from-bottom fade-in">
      <div>
        <p className="text-sm text-muted-foreground">Shift running</p>
        <p className="text-xl font-mono">{formatDuration(duration)}</p>
      </div>
      <Button size="sm" variant="destructive" onClick={stopShift}>
        <StopCircle className="h-4 w-4 mr-1" /> Stop
      </Button>
    </div>
  )
}
