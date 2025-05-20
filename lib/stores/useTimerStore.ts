import { create } from 'zustand'

interface TimerState {
  isRunning: boolean
  isPaused: boolean
  startTime: number | null
  pausedAt: number | null
  pausedDuration: number | null
  timeEntryId: string | null
  
  startTimer: (id: string) => void
  pauseTimer: () => void
  resumeTimer: () => void
  stopTimer: () => void
  resetTimer: () => void
  setTimeEntryId: (id: string) => void
}

export const useTimerStore = create<TimerState>((set, get) => ({
  isRunning: false,
  isPaused: false,
  startTime: null,
  pausedAt: null,
  pausedDuration: 0,
  timeEntryId: null,
  
  startTimer: (id: string) => set({
    isRunning: true,
    isPaused: false,
    startTime: Date.now(),
    pausedDuration: 0,
    timeEntryId: id
  }),
  
  pauseTimer: () => {
    const { startTime, pausedDuration } = get()
    if (!startTime) return
    
    // Calculate accumulated duration when pausing
    const elapsedSoFar = Math.floor((Date.now() - startTime) / 1000)
    const totalPausedDuration = (pausedDuration || 0) + elapsedSoFar
    
    set({
      isPaused: true,
      pausedAt: Date.now(),
      pausedDuration: totalPausedDuration
    })
  },
  
  resumeTimer: () => set(state => ({
    isPaused: false,
    startTime: Date.now(),
    pausedAt: null
    // Keep the pausedDuration as is - it represents accumulated time
  })),
  
  stopTimer: () => set({
    isRunning: false,
    isPaused: false,
    startTime: null,
    pausedAt: null,
    pausedDuration: 0,
    timeEntryId: null
  }),
  
  resetTimer: () => set({
    isRunning: false,
    isPaused: false,
    startTime: null,
    pausedAt: null,
    pausedDuration: 0,
    timeEntryId: null
  }),
  
  setTimeEntryId: (id: string) => set({ timeEntryId: id })
}))