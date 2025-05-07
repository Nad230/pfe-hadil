// hooks/useTimerControls.ts
import { useTimerStore } from "../lib/stores/useTimerStore"

export const useTimerControls = () => {
  const { startTimer, stopTimer } = useTimerStore()

  return {
    startTimer,
    stopTimer
  }
}