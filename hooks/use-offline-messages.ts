"use client"

import { useState, useEffect, useCallback } from "react"

interface QueuedMessage {
  id: string
  content: string
  type: string
  parentId?: string | null
  chatId: string
  timestamp?: number
}

export function useOfflineMessages(chatId: string) {
  const [queuedMessages, setQueuedMessages] = useState<QueuedMessage[]>([])

  // Load queued messages from localStorage on mount
  useEffect(() => {
    if (!chatId) return

    try {
      const storedMessages = localStorage.getItem(`offline_messages_${chatId}`)
      if (storedMessages) {
        const parsedMessages = JSON.parse(storedMessages)
        setQueuedMessages(parsedMessages)
      }
    } catch (error) {
      console.error("Error loading offline messages:", error)
    }
  }, [chatId])

  // Save queued messages to localStorage whenever they change
  useEffect(() => {
    if (!chatId || queuedMessages.length === 0) return

    try {
      localStorage.setItem(`offline_messages_${chatId}`, JSON.stringify(queuedMessages))
    } catch (error) {
      console.error("Error saving offline messages:", error)
    }
  }, [chatId, queuedMessages])

  const addToQueue = useCallback((message: QueuedMessage) => {
    setQueuedMessages((prev) => [
      ...prev,
      {
        ...message,
        timestamp: Date.now(),
      },
    ])
  }, [])

  const removeFromQueue = useCallback((messageId: string) => {
    setQueuedMessages((prev) => prev.filter((msg) => msg.id !== messageId))
  }, [])

  const syncQueuedMessages = useCallback(async () => {
    if (queuedMessages.length === 0) return

    const getAccessToken = () => {
      if (typeof window !== "undefined") {
        return (
          localStorage.getItem("access_token") ||
          localStorage.getItem("token") ||
          localStorage.getItem("authToken") ||
          "dummy-token"
        )
      }
      return "dummy-token" // Fallback token
    }

    const token = getAccessToken()
    if (!token) return

    // Process messages in order (oldest first)
    const sortedMessages = [...queuedMessages].sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0))

    for (const message of sortedMessages) {
      try {
        if (message.type === "TEXT") {
          const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/messages`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              chatId: message.chatId,
              content: message.content,
              type: message.type,
              parentId: message.parentId,
            }),
          })

          if (response.ok) {
            removeFromQueue(message.id)
          }
        } else {
          // For media messages, we would need the actual file data
          // This is more complex and might require storing blobs in IndexedDB
          console.log("Media message sync not implemented yet:", message)
        }
      } catch (error) {
        console.error("Error syncing offline message:", error)
      }
    }
  }, [queuedMessages, removeFromQueue])

  return {
    queuedMessages,
    addToQueue,
    removeFromQueue,
    syncQueuedMessages,
  }
}
