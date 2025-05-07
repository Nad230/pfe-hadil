// stores/useTimerStore.ts
import { create } from 'zustand'

interface TimerState {
  isRunning: boolean
  duration: number
  startTime: number | null
  startTimer: () => void
  stopTimer: () => void
  updateDuration: () => void
}

export const useTimerStore = create<TimerState>((set) => ({
  isRunning: false,
  duration: 0,
  startTime: null,
  startTimer: () => set({ 
    isRunning: true,
    startTime: Date.now(),
    duration: 0
  }),
  stopTimer: () => set({ 
    isRunning: false,
    startTime: null,
    duration: 0
  }),
  updateDuration: () => set((state) => ({
    duration: state.startTime ? Math.floor((Date.now() - state.startTime) / 1000) : 0
  }))
}))