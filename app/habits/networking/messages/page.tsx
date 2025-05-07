"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import  ChatContainer from "@/components/networking/chat/chat-container"
import ChatList from "@/components/networking/chat/chat-list"
import { Skeleton } from "@/components/ui/skeleton"
import { useMobile } from "@/hooks/use-mobile"
import { motion } from "framer-motion"

interface Chat {
  id: string
  name: string | null
  isGroup: boolean
  lastMessage: {
    content: string | null
    type: string
    createdAt: string
    sender: {
      id: string
      fullname: string
      profile_photo: string | null
    }
  } | null
  users: {
    userId: string
    user: {
      id: string
      fullname: string
      profile_photo: string | null
    }
  }[]
  unreadCount: number
}

export default function MessagesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const chatId = searchParams.get("chatId")
  const [chats, setChats] = useState<Chat[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedChatId, setSelectedChatId] = useState<string | null>(chatId)
  const isMobile = useMobile()

  useEffect(() => {
    // Update selectedChatId when chatId in URL changes
    setSelectedChatId(chatId)
  }, [chatId])

  useEffect(() => {
    const fetchChats = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem("access_token")
        if (!token) {
          setError("Authentication required")
          setLoading(false)
          return
        }

        console.log("Fetching chats...")
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/chats`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!response.ok) {
          throw new Error(`Failed to fetch chats: ${response.status}`)
        }

        const data = await response.json()
        console.log(`Fetched ${data.length} chats`)
        setChats(data)

        // If no chat is selected and we have chats, select the first one
        if (!selectedChatId && data.length > 0 && !isMobile) {
          setSelectedChatId(data[0].id)
          router.replace(`/habits/networking/messages?chatId=${data[0].id}`, { scroll: false })
        }
      } catch (err) {
        console.error("Error fetching chats:", err)
        setError(err instanceof Error ? err.message : "Failed to load chats")
      } finally {
        setLoading(false)
      }
    }

    fetchChats()

    // Set up polling for new chats
    const interval = setInterval(fetchChats, 30000) // Poll every 30 seconds

    return () => clearInterval(interval)
  }, [router, selectedChatId, isMobile])

  const handleChatSelect = (chatId: string) => {
    setSelectedChatId(chatId)

    // On mobile, navigate to the chat page
    if (isMobile) {
      router.push(`/habits/networking/messages/${chatId}`)
    } else {
      // On desktop, update the URL without navigation
      router.replace(`/habits/networking/messages?chatId=${chatId}`, { scroll: false })
    }
  }

  const handleChatCreated = (newChatId: string) => {
    // Refresh the chat list
    const fetchChats = async () => {
      try {
        const token = localStorage.getItem("access_token")
        if (!token) return

        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/chats`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!response.ok) return

        const data = await response.json()
        setChats(data)

        // Select the new chat
        setSelectedChatId(newChatId)
        if (!isMobile) {
          router.replace(`/habits/networking/messages?chatId=${newChatId}`, { scroll: false })
        }
      } catch (err) {
        console.error("Error refreshing chats:", err)
      }
    }

    fetchChats()
  }

  return (
    <motion.div
      className="h-[calc(100vh-4rem)] flex bg-background"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Chat list - always visible on desktop, hidden on mobile when viewing a chat */}
      <div className={`${isMobile && selectedChatId ? "hidden" : "w-full md:w-1/3 lg:w-1/4"} border-r`}>
        {loading ? (
          <div className="p-4 space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : (
          <ChatList chats={chats} activeChatId={selectedChatId} onChatSelect={handleChatSelect} />
        )}
      </div>

      {/* Chat container - visible on desktop, or on mobile when a chat is selected */}
      <div className={`${isMobile && !selectedChatId ? "hidden" : "flex-1"}`}>
        {!isMobile && <ChatContainer chatId={selectedChatId || undefined} onChatCreated={handleChatCreated} />}
      </div>
    </motion.div>
  )
}
