// stores/useShiftStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ShiftState {
  isTracking: boolean
  startTime: number | null
  startShift: () => void
  stopShift: () => void
  getElapsed: () => number
}

export const useShiftStore = create<ShiftState>()(
  persist(
    (set, get) => ({
      isTracking: false,
      startTime: null,
      startShift: () => {
        set({ isTracking: true, startTime: Date.now() })
      },
      stopShift: () => {
        set({ isTracking: false, startTime: null })
      },
      getElapsed: () => {
        const { isTracking, startTime } = get()
        return isTracking && startTime ? Date.now() - startTime : 0
      },
    }),
    {
      name: 'shift-storage', // storage key in localStorage
    }
  )
)
