"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PlusCircle, Search, Users, Bell, Clock, CheckCheck, Check } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Skeleton } from "@/components/ui/skeleton"

interface ChatUser {
  id: string
  fullname: string
  profile_photo: string | null
}

interface Chat {
  id: string
  name: string | null
  isGroup: boolean
  lastMessage: {
    content: string | null
    type: string
    createdAt: string
    status?: "SENDING" | "DELIVERED" | "SENT" | "SEEN" | "FAILED" | "EDITED"
    sender: ChatUser
  } | null
  users: {
    userId: string
    user: ChatUser
  }[]
  unreadCount: number
}

interface ChatListProps {
  chats: Chat[]
  activeChatId?: string | null
  onChatSelect?: (chatId: string) => void
  showHeader?: boolean
  title?: string
  loading?: boolean
}

export default function ChatList({
  chats,
  onChatSelect,
  activeChatId,
  showHeader = true,
  title = "Messages",
  loading = false,
}: ChatListProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [animateChats, setAnimateChats] = useState(false)

  useEffect(() => {
    // Trigger animation after component mounts
    setAnimateChats(true)
  }, [])

  const handleChatClick = (chatId: string) => {
    localStorage.setItem("selectedChatId", chatId)

    if (onChatSelect) {
      onChatSelect(chatId)
    } else {
      router.push(`/habits/networking/messages/${chatId}`)
    }
  }

  const handleNewChat = () => {
    router.push("/habits/networking/messages/new")
  }

  const getCurrentUserId = () => {
    if (typeof window !== "undefined") {
      try {
        const userStr = localStorage.getItem("user")
        if (userStr) {
          const user = JSON.parse(userStr)
          if (user?.id) return user.id
        }
        return localStorage.getItem("user_id")
      } catch (e) {
        console.error("Error parsing user from localStorage:", e)
      }
    }
    return null
  }

  const getChatName = (chat: Chat) => {
    if (chat.isGroup) return chat.name || "Group Chat"

    const currentUserId = getCurrentUserId()
    const otherUser = chat.users.find((u) => u.userId !== currentUserId)
    return otherUser?.user.fullname || "Chat"
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

    if (diffInDays === 0) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    } else if (diffInDays === 1) {
      return "Yesterday"
    } else if (diffInDays < 7) {
      return date.toLocaleDateString([], { weekday: "short" })
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" })
    }
  }

  const getMessagePreview = (chat: Chat) => {
    if (!chat.lastMessage) return "No messages yet"

    const messageType = chat.lastMessage.type
    if (messageType === "TEXT") {
      return chat.lastMessage.content || "Empty message"
    } else if (messageType === "IMAGE") {
      return "📷 Photo"
    } else if (messageType === "VIDEO") {
      return "🎥 Video"
    } else if (messageType === "AUDIO") {
      return "🎵 Audio message"
    } else if (messageType === "FILE") {
      return "📎 File"
    } else if (messageType === "CALL") {
      return "📞 Call"
    }

    return messageType.charAt(0) + messageType.slice(1).toLowerCase()
  }

  // Filter chats based on search query
  const filteredChats = chats.filter((chat) => {
    const chatName = getChatName(chat)
    return chatName.toLowerCase().includes(searchQuery.toLowerCase())
  })

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 },
  }

  // Render message status icon
  const renderMessageStatus = (status?: string) => {
    if (!status) return null

    switch (status) {
      case "SENDING":
        return <Clock size={14} className="text-gray-400" />
      case "SENT":
        return <Check size={14} className="text-gray-400" />
      case "DELIVERED":
        return <CheckCheck size={14} className="text-gray-400" />
      case "SEEN":
        return <CheckCheck size={14} className="text-emerald-500" />
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col h-full">
        {showHeader && (
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
            <div className="flex justify-between items-center mb-4">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-9 w-20" />
            </div>
            <Skeleton className="h-10 w-full" />
          </div>
        )}
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {Array(5)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-5 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
                <Skeleton className="h-4 w-10" />
              </div>
            ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {showHeader && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl font-bold">{title}</h1>
            <Button
              onClick={handleNewChat}
              size="sm"
              className="flex items-center gap-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary shadow-sm"
            >
              <PlusCircle size={16} />
              <span>New</span>
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              className="pl-10 pr-9 bg-muted/30 focus:bg-background transition-colors"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        <AnimatePresence>
          {filteredChats.length > 0 ? (
            <motion.div
              className="space-y-1 p-2"
              variants={container}
              initial="hidden"
              animate={animateChats ? "show" : "hidden"}
            >
              {filteredChats.map((chat) => {
                const chatName = getChatName(chat)
                const messagePreview = getMessagePreview(chat)
                const lastMessageSender =
                  chat.lastMessage && chat.isGroup ? `${chat.lastMessage.sender.fullname}: ` : ""
                const timestamp = chat.lastMessage ? formatTimestamp(chat.lastMessage.createdAt) : ""
                const currentUserId = getCurrentUserId()
                const otherUser = chat.users.find((u) => u.userId !== currentUserId)?.user
                const isLastMessageFromMe = chat.lastMessage?.sender.id === currentUserId

                return (
                  <motion.div
                    key={chat.id}
                    variants={item}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => handleChatClick(chat.id)}
                    className={`block cursor-pointer p-3 rounded-lg transition-all duration-200 ${
                      activeChatId === chat.id
                        ? "bg-primary/10 dark:bg-primary/20 border-l-4 border-primary"
                        : "hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar
                          className={`h-12 w-12 ${chat.unreadCount > 0 ? "ring-2 ring-primary ring-offset-2" : ""}`}
                        >
                          <AvatarImage
                            src={
                              chat.isGroup
                                ? "/placeholder.svg?height=48&width=48"
                                : otherUser?.profile_photo || "/placeholder.svg?height=48&width=48"
                            }
                            alt={chatName}
                          />
                          <AvatarFallback className="bg-gradient-to-br from-primary/60 to-primary/30 text-white">
                            {chat.isGroup ? <Users size={20} /> : chatName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        {chat.unreadCount > 0 && (
                          <Badge className="absolute -top-1 -right-1 px-1.5 py-0.5 min-w-[20px] h-5 flex items-center justify-center bg-primary">
                            {chat.unreadCount}
                          </Badge>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <h3 className="font-medium truncate">{chatName}</h3>
                          <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">{timestamp}</span>
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <p className="text-sm text-muted-foreground truncate max-w-[80%]">
                            {lastMessageSender}
                            {messagePreview}
                          </p>
                          <div className="flex items-center gap-1 ml-1">
                            {isLastMessageFromMe && chat.lastMessage?.status && (
                              <span className="text-xs text-muted-foreground">
                                {renderMessageStatus(chat.lastMessage.status)}
                              </span>
                            )}
                            {chat.lastMessage?.type === "AUDIO" && (
                              <span className="text-xs text-muted-foreground">
                                <Bell size={12} />
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center h-full p-4 text-center"
            >
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-medium mb-1">No conversations found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {searchQuery ? `No results for "${searchQuery}"` : "Start a new conversation"}
              </p>
              <Button onClick={handleNewChat} variant="outline" size="sm">
                <PlusCircle size={16} className="mr-2" />
                New conversation
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
