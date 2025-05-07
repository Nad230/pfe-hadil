"use client"

import { useState, useEffect } from "react"
import { useSocket } from "@/contexts/socket-context"
import { useSupabaseRealtime } from "@/contexts/supabase-realtime-context"

interface TypingUser {
  userId: string
  name: string
}

export function useTyping(chatId: string) {
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([])
  const { socket } = useSocket()
  const { subscribeToChat } = useSupabaseRealtime()

  // Send typing status
  const sendTypingStatus = (isTyping: boolean) => {
    if (!socket || !chatId) return

    socket.emit("typing", { chatId, isTyping })
  }

  useEffect(() => {
    if (!chatId) return

    const unsubscribe = subscribeToChat(chatId, (payload) => {
      if (payload.event === "typing") {
        const { userId, name, isTyping } = payload.payload

        setTypingUsers((prev) => {
          if (isTyping) {
            // Add user if not already typing
            if (!prev.some((user) => user.userId === userId)) {
              return [...prev, { userId, name }]
            }
            return prev
          } else {
            // Remove user from typing list
            return prev.filter((user) => user.userId !== userId)
          }
        })
      }
    })

    // Clear typing users when unmounting
    return () => {
      unsubscribe()
      setTypingUsers([])
    }
  }, [chatId, subscribeToChat])

  return { typingUsers, sendTypingStatus }
}
