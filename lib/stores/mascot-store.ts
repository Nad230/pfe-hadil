// lib/stores/mascot-store.ts
import { MascotMood } from '@/components/mascot/animations'
import { create } from 'zustand'

type MascotState = {
  mood: MascotMood
  message: string
  isVisible: boolean
  setMood: (mood: MascotMood, message?: string) => void
  clearMessage: () => void
  setIsVisible: (visible: boolean) => void
}

export const useMascotStore = create<MascotState>((set) => ({
  mood: 'idle',
  message: '',
  isVisible: false,
  setMood: (mood, message = '') => set({ mood, message }),
  clearMessage: () => set({ message: '' }),
  setIsVisible: (visible) => set({ isVisible: visible }),
}))
