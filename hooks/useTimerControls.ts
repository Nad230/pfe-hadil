import { useEffect } from 'react'
import { useTimerStore } from '@/lib/stores/useTimerStore'
import Cookies from 'js-cookie'
import { toast } from "sonner"

export function useTimerControls() {
  const {
    isRunning,
    isPaused,
    startTime,
    pausedDuration,
    startTimer: startTimerStore,
    pauseTimer: pauseTimerStore,
    resumeTimer: resumeTimerStore,
    stopTimer: stopTimerStore,
    timeEntryId,
    setTimeEntryId,
    resetTimer
  } = useTimerStore()

  // Initialize timer from localStorage on page load
  useEffect(() => {
    const storedTimer = localStorage.getItem('activeTimer')
    if (storedTimer) {
      try {
        const { id, startTime, isPaused, pausedDuration } = JSON.parse(storedTimer)
        setTimeEntryId(id)
        
        if (isPaused) {
          // If it was paused, restore it in paused state with correct duration
          startTimerStore(id) // First start it
          pauseTimerStore()   // Then pause it to set the state correctly
        } else {
          // If it was running, start it with the saved startTime
          startTimerStore(id)
        }
        
        toast.info(isPaused ? "Timer restored in paused state" : "Timer restored and running")
      } catch (error) {
        console.error("Error restoring timer:", error)
        localStorage.removeItem('activeTimer')
      }
    }
  }, [])

  // Save timer state to localStorage whenever it changes
  useEffect(() => {
    if (isRunning) {
      localStorage.setItem('activeTimer', JSON.stringify({
        id: timeEntryId,
        startTime: startTime,
        isPaused: isPaused,
        pausedDuration: pausedDuration
      }));
    } else {
      localStorage.removeItem('activeTimer');
    }
  }, [isRunning, timeEntryId, startTime, isPaused, pausedDuration]);

  // Handle visibility change events
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isRunning && !isPaused) {
        // When returning to the page, verify the timer is running with correct time
        // No need to update anything as the timer uses Date.now() - startTime
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [isRunning, isPaused, startTime])

  // Handle beforeunload events
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isRunning) {
        e.preventDefault()
        e.returnValue = 'You have an active timer. Are you sure you want to leave?'
      }
    }
    
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isRunning])

  const startTimer = async (projectId: string, taskId: string, description: string) => {
    if (!projectId || !taskId) return
    
    try {
      const response = await fetch("http://localhost:3000/time-entry/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("token")}`
        },
        body: JSON.stringify({
          projectId,
          taskId,
          description: description.trim() || "No description"
        })
      })
      
      const data = await response.json()
      setTimeEntryId(data.id)
      startTimerStore(data.id)
      
      toast.success("Timer started!")
      return data.id
    } catch (error) {
      console.error("Error starting timer:", error)
      toast.error("Failed to start timer")
      return null
    }
  }

  const pauseTimer = async () => {
    if (!isRunning || !timeEntryId || isPaused) return
    
    try {
      await fetch(`http://localhost:3000/time-entry/${timeEntryId}/pause`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("token")}`
        }
      })
      
      pauseTimerStore()
      toast.info("Timer paused")
      return true
    } catch (error) {
      console.error("Error pausing timer:", error)
      toast.error("Failed to pause timer")
      return false
    }
  }

  const resumeTimer = async () => {
    if (!isRunning || !timeEntryId || !isPaused) return
    
    try {
      await fetch(`http://localhost:3000/time-entry/${timeEntryId}/resume`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("token")}`
        }
      })
      
      resumeTimerStore()
      toast.success("Timer resumed")
      return true
    } catch (error) {
      console.error("Error resuming timer:", error)
      toast.error("Failed to resume timer")
      return false
    }
  }

  const stopTimer = async () => {
    if (!timeEntryId) return
    
    try {
      await fetch(`http://localhost:3000/time-entry/${timeEntryId}/stop`, {
        method: "PATCH",
        headers: { 
          Authorization: `Bearer ${Cookies.get("token")}` 
        }
      })
      
      // Clear localStorage and reset timer state
      localStorage.removeItem('activeTimer')
      stopTimerStore()
      
      toast.success("Timer stopped and entry saved!")
      return true
    } catch (error) {
      console.error("Error stopping timer:", error)
      toast.error("Failed to stop timer")
      return false
    }
  }

  return {
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    isRunning,
    isPaused,
    timeEntryId
  }
}