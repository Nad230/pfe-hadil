"use client"

import { useState, useCallback } from "react"
import { MascotMood } from "./animations"

interface UseMascotStateProps {
  defaultMood?: MascotMood
  messageTimeout?: number
}

export function useMascotState({ 
  defaultMood = "idle",
  messageTimeout = 3000 
}: UseMascotStateProps = {}) {
  const [mood, setMood] = useState<MascotMood>(defaultMood)
  const [message, setMessage] = useState<string>()
  
  const showMessage = useCallback((
    newMessage: string,
    newMood?: MascotMood,
    duration: number = messageTimeout
  ) => {
    setMessage(newMessage)
    if (newMood) setMood(newMood)
    
    const timer = setTimeout(() => {
      setMessage(undefined)
      setMood(defaultMood)
    }, duration)
    
    return () => clearTimeout(timer)
  }, [defaultMood, messageTimeout])

  const clearMessage = useCallback(() => {
    setMessage(undefined)
    setMood(defaultMood)
  }, [defaultMood])

  return {
    mood,
    setMood,
    message,
    showMessage,
    clearMessage
  }
}