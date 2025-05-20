"use client"

import { useState, useEffect, useCallback, useRef } from "react"

type WebSocketMessage = {
  type: string
  [key: string]: any
}

type ConnectionStatus = "connecting" | "connected" | "disconnected" | "reconnecting" | "error"

export function useChatWebSocket(chatId?: string) {
  const [connected, setConnected] = useState(false)
  const [lastMessage, setLastMessage] = useState<MessageEvent | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("disconnected")
  const socketRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectAttemptsRef = useRef(0)
  const maxReconnectAttempts = 5
  const reconnectDelay = 2000 // 2 seconds

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

  const connect = useCallback(() => {
    if (!chatId) return

    try {
      setConnectionStatus("connecting")

      const token = getAccessToken()
      const wsUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL?.replace("http", "ws") || "ws://localhost:3001"}/chat?token=${token}&chatId=${chatId}`

      socketRef.current = new WebSocket(wsUrl)

      socketRef.current.onopen = () => {
        setConnected(true)
        setConnectionStatus("connected")
        reconnectAttemptsRef.current = 0
        console.log("WebSocket connected")
      }

      socketRef.current.onmessage = (event) => {
        setLastMessage(event)
      }

      socketRef.current.onclose = (event) => {
        setConnected(false)
        setConnectionStatus("disconnected")
        console.log("WebSocket disconnected", event.code, event.reason)

        // Attempt to reconnect unless the socket was closed intentionally
        if (event.code !== 1000) {
          attemptReconnect()
        }
      }

      socketRef.current.onerror = (error) => {
        console.error("WebSocket error:", error)
        setConnectionStatus("error")
        setConnected(false)
      }
    } catch (error) {
      console.error("Error establishing WebSocket connection:", error)
      setConnectionStatus("error")
      setConnected(false)
    }
  }, [chatId])

  const attemptReconnect = useCallback(() => {
    if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
      console.log("Max reconnect attempts reached")
      setConnectionStatus("error")
      return
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }

    setConnectionStatus("reconnecting")
    reconnectAttemptsRef.current += 1

    reconnectTimeoutRef.current = setTimeout(() => {
      console.log(`Attempting to reconnect (${reconnectAttemptsRef.current}/${maxReconnectAttempts})...`)
      connect()
    }, reconnectDelay * reconnectAttemptsRef.current)
  }, [connect])

  const disconnect = useCallback(() => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.close(1000, "Closed by client")
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }

    setConnected(false)
    setConnectionStatus("disconnected")
  }, [])

  const reconnect = useCallback(() => {
    disconnect()
    reconnectAttemptsRef.current = 0
    connect()
  }, [connect, disconnect])

  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(message))
      return true
    }
    return false
  }, [])

  // Connect on mount, disconnect on unmount
  useEffect(() => {
    connect()

    return () => {
      disconnect()
    }
  }, [connect, disconnect])

  // Reconnect when chatId changes
  useEffect(() => {
    if (chatId) {
      reconnect()
    }
  }, [chatId, reconnect])

  // Ping to keep connection alive
  useEffect(() => {
    if (!connected) return

    const pingInterval = setInterval(() => {
      sendMessage({ type: "PING" })
    }, 30000) // 30 seconds

    return () => {
      clearInterval(pingInterval)
    }
  }, [connected, sendMessage])

  return {
    connected,
    lastMessage,
    sendMessage,
    connectionStatus,
    reconnect,
    disconnect,
  }
}
