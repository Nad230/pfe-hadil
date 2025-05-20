"use client"

import type React from "react"

import { useEffect, useState, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  Info,
  ChevronLeft,
  MoreVertical,
  Phone,
  Video,
  MessageSquare,
  UserX,
  Trash,
  Search,
  ImageIcon,
  FileText,
  Music,
  Film,
  Settings,
  Pin,
  UserPlus,
  Loader2,
  X,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { useMobile } from "@/hooks/use-mobile"
import ChatInput from "./chat-input"
import ChatMessage, { type ReactionType } from "./chat-message"
import ImageMessage from "./image-message"
import FileMessage from "./file-message"
import VideoMessage from "./video-message"
import VoiceMessage from "./voice-message"
import CallMessage from "./call-message"
import TypingIndicator from "./typing-indicator"
import MessageStatusIndicator from "./message-status-indicator"
import ChatInfoPanel from "./chat-info-panel"
import { MessageTransition } from "../animated/message-transition"
import { useChatAnimations } from "../animated/use-chat-animations"
import AddParticipantsDialog from "./add-participants-dialog"

interface User {
  id: string
  fullname: string
  profile_photo?: string | null
  email?: string
  phone?: string
}

interface ChatParticipant {
  userId: string
  chatId: string
  joinedAt: string
  user: User
}

interface Chat {
  id: string
  name: string | null
  isGroup: boolean
  adminId: string | null
  createdAt: string
  updatedAt: string
  users: ChatParticipant[]
}

interface Message {
  id: string
  content: string | null
  type: "TEXT" | "IMAGE" | "VIDEO" | "AUDIO" | "FILE" | "LINK" | "CALL"
  status: "SENDING" | "DELIVERED" | "SENT" | "SEEN" | "FAILED" | "EDITED"
  senderId: string
  chatId: string
  parentId: string | null
  deletedForEveryone: boolean
  createdAt: string
  updatedAt: string
  sender: {
    id: string
    fullname: string
    profile_photo: string | null
  }
  attachment: any[]
  call: any[]
  readReceipts: any[]
  deletions: any[]
  isPinned?: boolean
  reactions?: {
    id: string
    type: ReactionType
    userId: string
    user: {
      id: string
      fullname: string
      profile_photo: string | null
    }
  }[]
  replyTo?: Message | null
}

interface ChatContainerProps {
  chatId?: string
  onBack?: () => void
  error?: string | null
  showBackButton?: boolean
  onChatCreated?: (newChatId: string) => void
}

export default function ChatContainer({
  chatId,
  onBack,
  error: propError,
  showBackButton = false,
  onChatCreated,
}: ChatContainerProps) {
  const router = useRouter()
  const [chatData, setChatData] = useState<Chat | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(propError || null)
  const [chatName, setChatName] = useState("Chat")
  const [isGroup, setIsGroup] = useState(false)
  const [adminId, setAdminId] = useState<string | null>(null)
  const [participants, setParticipants] = useState<ChatParticipant[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [activeTab, setActiveTab] = useState("chat")
  const [filteredMessages, setFilteredMessages] = useState<Message[]>([])
  const [mediaFilter, setMediaFilter] = useState<"all" | "TEXT" | "IMAGE" | "VIDEO" | "AUDIO" | "FILE">("all")
  const [replyingTo, setReplyingTo] = useState<Message | null>(null)
  const [pinnedMessagesExpanded, setPinnedMessagesExpanded] = useState(true)
  const [showChatInfo, setShowChatInfo] = useState(false)
  const [typingUsers, setTypingUsers] = useState<{ userId: string; name: string }[]>([])
  const [pendingMessages, setPendingMessages] = useState<Record<string, boolean>>({})
  const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<Message[]>([])
  const [showDateDivider, setShowDateDivider] = useState(true)
  const [immersiveMode, setImmersiveMode] = useState(false)
  const [showAddParticipants, setShowAddParticipants] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messageListRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const isMobile = useMobile()
  const { toast } = useToast()
  const messagePollingRef = useRef<NodeJS.Timeout | null>(null)
  const fetchingRef = useRef(false)
  const { animateMessage, animateReaction } = useChatAnimations()

  const getCurrentUserId = () => {
    if (typeof window !== "undefined") {
      try {
        const userStr = localStorage.getItem("user")
        if (userStr) {
          const user = JSON.parse(userStr)
          if (user?.id) return user.id
        }
        return localStorage.getItem("user_id") || "current-user" // Fallback ID
      } catch (e) {
        console.error("Error getting user ID:", e)
        return "current-user" // Fallback ID
      }
    }
    return "current-user" // Fallback ID
  }

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

  const currentUserId = getCurrentUserId()

  const updateChatData = useCallback(
    (data: Chat) => {
      setChatData(data)
      if (data.isGroup) {
        setChatName(data.name || "Group Chat")
        setIsGroup(true)
        setAdminId(data.adminId)
      } else {
        const otherUser = data.users?.find((u) => u.userId !== currentUserId)
        setChatName(otherUser?.user.fullname || "Chat")
        setIsGroup(false)
      }
      setParticipants(data.users || [])
    },
    [currentUserId],
  )

  const filterMessagesByType = (type: "all" | "TEXT" | "IMAGE" | "VIDEO" | "AUDIO" | "FILE") => {
    setMediaFilter(type)
    setFilteredMessages(type === "all" ? messages : messages.filter((msg) => msg.type === type))
  }

  const fetchChatData = useCallback(async () => {
    if (!chatId) return

    setLoading(true)

    try {
      const token = getAccessToken()
      if (!token) {
        setLoading(false)
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/chats/${chatId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) {
        console.error(`Failed to load chat: ${response.status}`)
        setLoading(false)
        return
      }

      const data = await response.json()
      updateChatData(data)
    } catch (err) {
      console.error("Error fetching chat:", err)
    } finally {
      setLoading(false)
    }
  }, [chatId, updateChatData])

  const fetchMessages = useCallback(async () => {
    if (!chatId || fetchingRef.current) return

    try {
      fetchingRef.current = true
      setLoadingMessages(true)

      const token = getAccessToken()
      if (!token) {
        fetchingRef.current = false
        setLoadingMessages(false)
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/messages/chat/${chatId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) {
        if (response.status === 500 || response.status === 404) {
          console.error(`Server error during message fetch: ${response.status}`)
          fetchingRef.current = false
          setLoadingMessages(false)
          return
        }
        throw new Error(`Failed to load messages: ${response.status}`)
      }

      const data = await response.json()

      if (Array.isArray(data)) {
        const sortedMessages = [...data].sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        )

        // Merge with optimistic updates
        const mergedMessages = sortedMessages.map((serverMsg) => {
          // If we have a pending message with the same ID, keep its status
          const pendingMsg = messages.find((m) => m.id === serverMsg.id && pendingMessages[m.id])

          if (pendingMsg) {
            return {
              ...serverMsg,
              status: pendingMsg.status,
            }
          }

          return serverMsg
        })

        // Add any temporary messages that aren't in the server response
        const tempMessages = messages.filter(
          (m) => m.id.startsWith("temp-") && !sortedMessages.some((sm) => sm.id === m.id),
        )

        const finalMessages = [...mergedMessages, ...tempMessages]

        setMessages(finalMessages)
        setFilteredMessages(finalMessages)
        setHasInitiallyLoaded(true)

        // Mark messages as read in the background
        try {
          const unseenMessages = sortedMessages.filter(
            (msg: Message) =>
              msg.senderId !== currentUserId &&
              (!msg.readReceipts || !msg.readReceipts.some((r) => r.userId === currentUserId && r.readAt)),
          )

          if (unseenMessages.length > 0) {
            Promise.allSettled(
              unseenMessages.map((msg) =>
                fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/messages/read/${msg.id}`, {
                  method: "POST",
                  headers: { Authorization: `Bearer ${token}` },
                }).catch((err) => console.error("Error marking message as read:", err)),
              ),
            )
          }
        } catch (readError) {
          console.error("Error processing read receipts:", readError)
        }
      }
    } catch (err) {
      console.error("Error fetching messages:", err)
    } finally {
      fetchingRef.current = false
      setLoadingMessages(false)

      // Scroll to bottom after initial load
      if (!hasInitiallyLoaded) {
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
        }, 10)
      }
    }
  }, [chatId, currentUserId, messages, hasInitiallyLoaded, pendingMessages])

  const handleReactToMessage = async (messageId: string, type: ReactionType) => {
    try {
      const token = getAccessToken()
      if (!token) return

      // Find the message
      const message = messages.find((msg) => msg.id === messageId)
      if (!message) return

      // Get current user's reaction if any
      const currentUserReaction = message.reactions?.find((r) => r.userId === currentUserId)

      // Optimistic update with animation
      setMessages((prevMessages) =>
        prevMessages.map((msg) => {
          if (msg.id === messageId) {
            const updatedReactions = msg.reactions ? [...msg.reactions] : []

            // Case 1: User already reacted with the SAME type → REMOVE
            if (currentUserReaction?.type === type) {
              return {
                ...msg,
                reactions: updatedReactions.filter((r) => r.userId !== currentUserId),
              }
            }

            // Case 2: User already reacted but DIFFERENT type → UPDATE
            if (currentUserReaction) {
              return {
                ...msg,
                reactions: updatedReactions.map((r) => (r.userId === currentUserId ? { ...r, type } : r)),
              }
            }

            // Case 3: No existing reaction → ADD
            const newReaction = {
              id: `temp-${Date.now()}`,
              type,
              userId: currentUserId,
              user: {
                id: currentUserId,
                fullname: "You",
                profile_photo: null,
              },
            }

            // Trigger animation
            animateReaction(messageId, type)

            return {
              ...msg,
              reactions: [...updatedReactions, newReaction],
            }
          }
          return msg
        }),
      )

      // Make API call
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/reactions/message/${messageId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ type }),
      })

      if (!response.ok) {
        throw new Error("Failed to update reaction")
      }

      // Update with server response if needed
      const data = await response.json()
      if (data.reaction) {
        setMessages((prevMessages) =>
          prevMessages.map((msg) => {
            if (msg.id === messageId) {
              return {
                ...msg,
                reactions: msg.reactions?.map((r) => (r.userId === currentUserId ? data.reaction : r)) || [
                  data.reaction,
                ],
              }
            }
            return msg
          }),
        )
      }
    } catch (err) {
      console.error("Error reacting to message:", err)
      // Revert on error
      fetchMessages()
    }
  }

  const handleRemoveReaction = async (reactionId: string) => {
    try {
      const token = getAccessToken()
      if (!token) return

      // Optimistic update
      setMessages((prevMessages) =>
        prevMessages.map((msg) => {
          if (msg.reactions?.some((r) => r.id === reactionId)) {
            return {
              ...msg,
              reactions: msg.reactions.filter((r) => r.id !== reactionId),
            }
          }
          return msg
        }),
      )

      // Make API call in the background
      fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/reactions/${reactionId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).catch((err) => {
        console.error("Error removing reaction:", err)
      })
    } catch (err) {
      console.error("Error removing reaction:", err)
    }
  }

  const sendTypingStatus = (isTyping: boolean) => {
    if (!chatId) return

    const token = getAccessToken()
    if (!token) return

    try {
      fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/messages/typing`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          chatId,
          isTyping,
        }),
      }).catch((err) => {
        console.error("Error sending typing status:", err)
      })
    } catch (error) {
      console.error("Error in typing status:", error)
    }
  }

  const toggleSearch = () => {
    setIsSearching(!isSearching)
    if (!isSearching) {
      setTimeout(() => {
        searchInputRef.current?.focus()
      }, 100)
    } else {
      setSearchQuery("")
    }
  }

  const filterMessagesByContent = (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    const normalizedQuery = query.toLowerCase().trim()
    const results = messages.filter(
      (msg) =>
        msg.content?.toLowerCase().includes(normalizedQuery) ||
        msg.sender.fullname.toLowerCase().includes(normalizedQuery),
    )

    setSearchResults(results)

    // Scroll to first result if any
    if (results.length > 0) {
      const firstResultId = results[0].id
      const element = document.querySelector(`[data-message-id="${firstResultId}"]`)
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" })
      }
    }
  }

  // Initialize chat data and messages
  useEffect(() => {
    if (chatId) {
      // Fetch chat data
      fetchChatData()

      // Fetch messages
      fetchMessages()

      // Set up polling for new messages
      const pollInterval = setInterval(() => {
        fetchMessages()
      }, 5000)

      messagePollingRef.current = pollInterval

      return () => {
        if (messagePollingRef.current) {
          clearInterval(messagePollingRef.current)
        }
      }
    }
  }, [chatId, fetchChatData, fetchMessages])

  // Listen for custom event to open add participants dialog
  useEffect(() => {
    const handleOpenAddParticipants = () => {
      setShowAddParticipants(true)
    }

    document.addEventListener("open-add-participants", handleOpenAddParticipants)

    return () => {
      document.removeEventListener("open-add-participants", handleOpenAddParticipants)
    }
  }, [])

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0 && !isSearching) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, activeTab, isSearching])

  // Handle search
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setSearchResults([])
      return
    }

    const query = searchQuery.toLowerCase()
    const results = messages.filter(
      (msg) => msg.content?.toLowerCase().includes(query) || msg.sender.fullname.toLowerCase().includes(query),
    )

    setSearchResults(results)
  }, [searchQuery, messages])

  const handleSendMessage = async (content: string, type: "TEXT" | "IMAGE" | "VIDEO" | "AUDIO" | "FILE") => {
    if (!chatId || (!content && type === "TEXT")) return

    const tempId = `temp-${Date.now()}`
    const tempMessage: Message = {
      id: tempId,
      content: type === "TEXT" ? content : null,
      type,
      status: "SENDING",
      senderId: currentUserId || "",
      chatId,
      parentId: replyingTo ? replyingTo.id : null,
      deletedForEveryone: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sender: {
        id: currentUserId || "",
        fullname: "You",
        profile_photo: null,
      },
      attachment: [],
      call: [],
      readReceipts: [],
      deletions: [],
      replyTo: replyingTo,
      reactions: [],
    }

    if (type !== "TEXT" && content) {
      let attachmentType: "Image" | "Video" | "Audio" | "Document" = "Document"
      if (type === "IMAGE") attachmentType = "Image"
      else if (type === "VIDEO") attachmentType = "Video"
      else if (type === "AUDIO") attachmentType = "Audio"

      tempMessage.attachment = [
        {
          id: `temp-attachment-${Date.now()}`,
          url: content,
          type: attachmentType,
          messageId: tempId,
        },
      ]
    }

    // Add message to UI immediately (optimistic update)
    setMessages((prev) => [...prev, tempMessage])
    setPendingMessages((prev) => ({ ...prev, [tempId]: true }))
    setReplyingTo(null)

    // Animate the new message
    animateMessage(tempId)

    // Scroll to bottom immediately
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, 10)

    try {
      const token = getAccessToken()
      if (!token) throw new Error("Authentication required")

      if (type === "TEXT") {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/messages`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            chatId,
            content,
            type,
            parentId: replyingTo ? replyingTo.id : null,
          }),
        })

        if (!response.ok) {
          throw new Error(`Failed to send message: ${response.status}`)
        }

        const newMessage = await response.json()

        // Update message with server response
        setMessages((prev) => prev.map((msg) => (msg.id === tempId ? { ...newMessage, status: "SENT" } : msg)))

        // Remove from pending messages
        setPendingMessages((prev) => {
          const updated = { ...prev }
          delete updated[tempId]
          return updated
        })
      } else {
        const formData = new FormData()
        formData.append("chatId", chatId)
        formData.append("type", type)
        if (replyingTo) {
          formData.append("parentId", replyingTo.id)
        }

        if (content.startsWith("data:") || content.startsWith("blob:")) {
          const response = await fetch(content)
          const blob = await response.blob()
          const fileName = `file-${Date.now()}.${type.toLowerCase()}`
          const file = new File([blob], fileName, { type: blob.type })
          formData.append("file", file)
        } else {
          formData.append("file", content)
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/messages`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        })

        if (!response.ok) {
          throw new Error(`Failed to send file: ${response.status}`)
        }

        const newMessage = await response.json()

        // Update message with server response
        setMessages((prev) => prev.map((msg) => (msg.id === tempId ? { ...newMessage, status: "SENT" } : msg)))

        // Remove from pending messages
        setPendingMessages((prev) => {
          const updated = { ...prev }
          delete updated[tempId]
          return updated
        })
      }
    } catch (err) {
      console.error("Error sending message:", err)
      setMessages((prev) => prev.map((msg) => (msg.id === tempId ? { ...msg, status: "FAILED" } : msg)))
    }
  }

  const handleResendMessage = async (messageId: string) => {
    const failedMessage = messages.find((msg) => msg.id === messageId)
    if (!failedMessage) return

    // Create a new temporary message
    const tempId = `temp-${Date.now()}`
    const tempMessage: Message = {
      ...failedMessage,
      id: tempId,
      status: "SENDING",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // Remove the failed message and add the new one
    setMessages((prev) => [...prev.filter((msg) => msg.id !== messageId), tempMessage])
    setPendingMessages((prev) => ({ ...prev, [tempId]: true }))

    // Animate the new message
    animateMessage(tempId)

    try {
      const token = getAccessToken()
      if (!token) throw new Error("Authentication required")

      if (failedMessage.type === "TEXT") {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/messages`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            chatId,
            content: failedMessage.content,
            type: failedMessage.type,
            parentId: failedMessage.parentId,
          }),
        })

        if (!response.ok) {
          throw new Error(`Failed to resend message: ${response.status}`)
        }

        const newMessage = await response.json()
        setMessages((prev) => prev.map((msg) => (msg.id === tempId ? { ...newMessage, status: "SENT" } : msg)))

        // Remove from pending messages
        setPendingMessages((prev) => {
          const updated = { ...prev }
          delete updated[tempId]
          return updated
        })
      } else if (failedMessage.attachment.length > 0) {
        // For media messages, we need to re-upload the file
        const formData = new FormData()
        formData.append("chatId", chatId as string)
        formData.append("type", failedMessage.type)

        if (failedMessage.parentId) {
          formData.append("parentId", failedMessage.parentId)
        }

        const attachmentUrl = failedMessage.attachment[0].url

        if (attachmentUrl.startsWith("data:") || attachmentUrl.startsWith("blob:")) {
          const response = await fetch(attachmentUrl)
          const blob = await response.blob()
          const fileName = `file-${Date.now()}.${failedMessage.type.toLowerCase()}`
          const file = new File([blob], fileName, { type: blob.type })
          formData.append("file", file)
        } else {
          // Try to fetch the file from the server
          try {
            const fileResponse = await fetch(attachmentUrl)
            const blob = await fileResponse.blob()
            const fileName = `file-${Date.now()}.${failedMessage.type.toLowerCase()}`
            const file = new File([blob], fileName, { type: blob.type })
            formData.append("file", file)
          } catch (fileError) {
            console.error("Failed to fetch file for resend:", fileError)
            throw new Error("Could not retrieve the file to resend")
          }
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/messages`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        })

        if (!response.ok) {
          throw new Error(`Failed to resend file: ${response.status}`)
        }

        const newMessage = await response.json()
        setMessages((prev) => prev.map((msg) => (msg.id === tempId ? { ...newMessage, status: "SENT" } : msg)))

        // Remove from pending messages
        setPendingMessages((prev) => {
          const updated = { ...prev }
          delete updated[tempId]
          return updated
        })
      }
    } catch (err) {
      console.error("Error resending message:", err)
      setMessages((prev) => prev.map((msg) => (msg.id === tempId ? { ...msg, status: "FAILED" } : msg)))
    }
  }

  const handleDeleteMessage = async (messageId: string, forEveryone: boolean) => {
    try {
      const token = getAccessToken()
      if (!token) return

      // Optimistic update
      if (forEveryone) {
        setMessages((prev) =>
          prev.map((msg) => (msg.id === messageId ? { ...msg, deletedForEveryone: true, content: null } : msg)),
        )
      } else {
        setMessages((prev) => prev.filter((msg) => msg.id !== messageId))
      }

      // Make API call in the background
      fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/messages/${messageId}?forEveryone=${forEveryone}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      }).catch((err) => {
        console.error("Error deleting message:", err)
        // Revert optimistic update on error
        fetchMessages()
      })
    } catch (err) {
      console.error("Error deleting message:", err)
      // Revert optimistic update on error
      fetchMessages()
    }
  }

  const handleEditMessage = async (messageId: string, newContent: string) => {
    try {
      const token = getAccessToken()
      if (!token) return

      // Optimistic update
      setMessages((prev) =>
        prev.map((msg) => (msg.id === messageId ? { ...msg, content: newContent, status: "EDITED" } : msg)),
      )

      // Make API call in the background
      fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/messages/${messageId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: newContent }),
      }).catch((err) => {
        console.error("Error editing message:", err)
        // Revert optimistic update on error
        fetchMessages()
      })
    } catch (err) {
      console.error("Error editing message:", err)
      // Revert optimistic update on error
      fetchMessages()
    }
  }

  const handleCopyMessage = (content: string | null) => {
    if (!content) return

    navigator.clipboard
      .writeText(content)
      .then(() => {
        toast({
          title: "Copié",
          description: "Message copié dans le presse-papiers",
          duration: 2000,
        })
      })
      .catch((err) => {
        console.error("Failed to copy message:", err)
      })
  }

  const handleReplyToMessage = async (messageId: string) => {
    const messageToReply = messages.find((msg) => msg.id === messageId)
    if (!messageToReply) return

    setReplyingTo(messageToReply)
  }

  const handlePinMessage = async (messageId: string, isPinned: boolean) => {
    try {
      const token = getAccessToken()
      if (!token) return

      // Optimistic update
      setMessages((prev) => prev.map((msg) => (msg.id === messageId ? { ...msg, isPinned } : msg)))

      // Make API call in the background
      fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/messages/${messageId}/pin`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isPinned }),
      }).catch((err) => {
        console.error(`Error ${isPinned ? "pinning" : "unpinning"} message:`, err)
        // Revert optimistic update on error
        setMessages((prev) => prev.map((msg) => (msg.id === messageId ? { ...msg, isPinned: !isPinned } : msg)))
      })
    } catch (err) {
      console.error(`Error ${isPinned ? "pinning" : "unpinning"} message:`, err)
      // Revert optimistic update on error
      setMessages((prev) => prev.map((msg) => (msg.id === messageId ? { ...msg, isPinned: !isPinned } : msg)))
    }
  }

  const handleAddParticipants = async (userIds: string[]) => {
    if (!chatId || !isGroup || !isAdmin) return

    try {
      const token = getAccessToken()
      if (!token) return

      setShowAddParticipants(false)

      // Optimistic update
      const newParticipants = userIds.map((userId) => ({
        userId,
        chatId,
        joinedAt: new Date().toISOString(),
        user: {
          id: userId,
          fullname: "Loading...",
          profile_photo: null,
          email: undefined,
          phone: undefined,
        },
      }))

      setParticipants((prev) => [...prev, ...newParticipants])

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/chats/${chatId}/participants`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userIds }),
      })

      if (!response.ok) {
        throw new Error("Failed to add participants")
      }

      // Refresh chat data to get updated participants
      fetchChatData()

      toast({
        title: "Participants added",
        description: `${userIds.length} new participant(s) added to the chat`,
        duration: 3000,
      })
    } catch (err) {
      console.error("Error adding participants:", err)
      toast({
        title: "Error",
        description: "Failed to add participants",
        variant: "destructive",
        duration: 3000,
      })
      // Revert optimistic update
      fetchChatData()
    }
  }

  const handleRemoveParticipant = async (userId: string) => {
    if (!chatId || !isGroup || !isAdmin) return

    try {
      const token = getAccessToken()
      if (!token) return

      // Optimistic update
      setParticipants((prev) => prev.filter((p) => p.userId !== userId))

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/chats/${chatId}/participants/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to remove participant")
      }

      toast({
        title: "Participant removed",
        description: "Participant has been removed from the chat",
        duration: 3000,
      })
    } catch (err) {
      console.error("Error removing participant:", err)
      toast({
        title: "Error",
        description: "Failed to remove participant",
        variant: "destructive",
        duration: 3000,
      })
      // Revert optimistic update
      fetchChatData()
    }
  }

  const handleDeleteChat = async () => {
    if (!chatId) return

    try {
      setIsDeleting(true)
      const token = getAccessToken()
      if (!token) return

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/chats/${chatId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to delete chat")
      }

      toast({
        title: "Chat deleted",
        description: "The conversation has been deleted",
        duration: 3000,
      })

      // Navigate back to messages list
      router.push("/networking/messages")
    } catch (err) {
      console.error("Error deleting chat:", err)
      toast({
        title: "Error",
        description: "Failed to delete chat",
        variant: "destructive",
        duration: 3000,
      })
    } finally {
      setIsDeleting(false)
    }
  }

  // Group messages by date for better organization
  const groupMessagesByDate = (messagesToGroup: Message[]) => {
    const groups: { [key: string]: Message[] } = {}

    messagesToGroup.forEach((message) => {
      const date = new Date(message.createdAt).toLocaleDateString()
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(message)
    })

    return groups
  }

  // Render message
  const renderMessage = (message: Message) => {
    const isMe = message.senderId === currentUserId

    if (message.deletedForEveryone) {
      return (
        <div key={message.id} className="flex justify-center my-2">
          <span className="text-xs text-muted-foreground italic bg-muted/30 px-3 py-1 rounded-full">
            Ce message a été supprimé
          </span>
        </div>
      )
    }

    const messageProps = {
      message,
      isMe,
      onDelete: handleDeleteMessage,
      onResend: message.status === "FAILED" ? handleResendMessage : undefined,
      onReply: handleReplyToMessage,
      onCopy: handleCopyMessage,
      onForward: (messageId: string) => {
        // Implement forward logic
      },
      onPin: handlePinMessage,
      onEdit: handleEditMessage,
      onReact: handleReactToMessage,
      onRemoveReaction: handleRemoveReaction,
      renderStatus: () => <MessageStatusIndicator status={message.status} />,
    }

    // Wrap with MessageTransition for animations
    const renderWithAnimation = (content: React.ReactNode) => (
      <MessageTransition key={message.id} id={message.id} className="group relative">
        {content}
      </MessageTransition>
    )

    switch (message.type) {
      case "TEXT":
        return renderWithAnimation(<ChatMessage {...messageProps} />)
      case "IMAGE":
        return renderWithAnimation(<ImageMessage {...messageProps} />)
      case "FILE":
        return renderWithAnimation(<FileMessage {...messageProps} />)
      case "VIDEO":
        return renderWithAnimation(<VideoMessage {...messageProps} />)
      case "AUDIO":
        return renderWithAnimation(<VoiceMessage {...messageProps} />)
      case "CALL":
        return renderWithAnimation(<CallMessage message={message} isMe={isMe} />)
      default:
        return null
    }
  }

  const isAdmin = adminId === currentUserId
  const pinnedMessages = messages.filter((msg) => msg.isPinned)
  const imageMessages = messages.filter((msg) => msg.type === "IMAGE")
  const videoMessages = messages.filter((msg) => msg.type === "VIDEO")
  const audioMessages = messages.filter((msg) => msg.type === "AUDIO")
  const fileMessages = messages.filter((msg) => msg.type === "FILE")
  const linkMessages = messages.filter((msg) => msg.type === "LINK")

  const navigateToProfile = (userId: string) => {
    router.push(`/networking/profile/${userId}`)
  }

  if (!chatId) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-3 border-b bg-gradient-to-r from-primary/10 to-primary/5">
          <h2 className="text-xl font-semibold">Messages</h2>
          <Button variant="outline" className="bg-white/80 hover:bg-white">
            <MessageSquare className="h-4 w-4 mr-2" />
            Nouvelle conversation
          </Button>
        </div>
        <div className="flex items-center justify-center h-full bg-gradient-to-b from-background to-muted/20">
          <div className="text-center p-8 max-w-md">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <MessageSquare className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Bienvenue dans Messages</h3>
            <p className="text-muted-foreground mb-6">Connectez-vous avec vos amis et collègues en temps réel</p>
            <Button variant="default" size="lg" className="shadow-md hover:shadow-lg transition-all">
              <MessageSquare className="h-5 w-5 mr-2" />
              Démarrer une nouvelle conversation
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`flex flex-col h-full ${immersiveMode ? "bg-gradient-to-b from-primary/5 to-background" : ""}`}>
      <div className="flex items-center justify-between p-3 border-b bg-gradient-to-r from-primary/10 to-primary/5">
        <div className="flex items-center">
          {showBackButton && (
            <Button variant="ghost" size="icon" onClick={onBack} className="mr-2">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          )}
          <Avatar
            className="mr-2 cursor-pointer border-2 border-primary/20 hover:border-primary/40 transition-all"
            onClick={() => navigateToProfile(chatData?.users?.find((u) => u.userId !== currentUserId)?.userId || "")}
          >
            <AvatarImage
              src={
                chatData?.users?.find((u) => u.userId !== currentUserId)?.user.profile_photo ||
                "/placeholder.svg?height=40&width=40" ||
                "/placeholder.svg" ||
                "/placeholder.svg"
              }
              alt={chatName}
            />
            <AvatarFallback>{chatName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <div className="flex items-center">
              <h2
                className="text-lg font-semibold cursor-pointer hover:underline"
                onClick={() =>
                  navigateToProfile(chatData?.users?.find((u) => u.userId !== currentUserId)?.userId || "")
                }
              >
                {chatName}
              </h2>
            </div>
            {isGroup && <span className="text-xs text-muted-foreground">{participants.length} participants</span>}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {isSearching ? (
            <div className="flex items-center bg-background rounded-md border px-2 mr-2">
              <Search className="h-4 w-4 text-muted-foreground mr-2" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Rechercher dans la conversation..."
                className="h-9 w-48 md:w-64 bg-transparent border-none focus:outline-none text-sm"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  filterMessagesByContent(e.target.value)
                }}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    toggleSearch()
                  }
                }}
              />
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={toggleSearch}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button variant="ghost" size="icon" onClick={toggleSearch}>
              <Search className="h-5 w-5" />
            </Button>
          )}
          <Button variant="ghost" size="icon">
            <Phone className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <Video className="h-5 w-5" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setShowChatInfo(true)}>
                <Info className="h-4 w-4 mr-2" />
                Infos sur la conversation
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setImmersiveMode(!immersiveMode)}>
                <Settings className="h-4 w-4 mr-2" />
                {immersiveMode ? "Mode normal" : "Mode immersif"}
              </DropdownMenuItem>
              {isGroup && isAdmin && (
                <DropdownMenuItem onClick={() => setShowAddParticipants(true)}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Ajouter des participants
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              {isGroup && (
                <DropdownMenuItem>
                  <UserX className="h-4 w-4 mr-2" />
                  Quitter le groupe
                </DropdownMenuItem>
              )}
              <DropdownMenuItem className="text-red-600" onClick={handleDeleteChat} disabled={isDeleting}>
                {isDeleting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Suppression...
                  </>
                ) : (
                  <>
                    <Trash className="h-4 w-4 mr-2" />
                    Supprimer la conversation
                  </>
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {error ? (
        <Alert variant="destructive">
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : (
        <div className="flex-1 overflow-hidden">
          <Tabs defaultValue="chat" className="flex flex-col h-full">
            <TabsList className="bg-background border-b">
              <TabsTrigger value="chat" onClick={() => setActiveTab("chat")}>
                Conversation
              </TabsTrigger>
              <TabsTrigger value="media" onClick={() => setActiveTab("media")}>
                Médias
              </TabsTrigger>
              <TabsTrigger value="pinned" onClick={() => setActiveTab("pinned")}>
                Épinglés
              </TabsTrigger>
            </TabsList>
            <TabsContent value="chat" className="flex flex-col h-full">
              <ScrollArea ref={messageListRef} className="flex-1 p-4 bg-gradient-to-b from-background to-muted/10">
                {pinnedMessages.length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-semibold flex items-center">
                        <Pin className="h-4 w-4 mr-1 text-primary" />
                        Messages épinglés
                      </h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setPinnedMessagesExpanded(!pinnedMessagesExpanded)}
                      >
                        {pinnedMessagesExpanded ? "Réduire" : "Développer"}
                      </Button>
                    </div>
                    {pinnedMessagesExpanded && (
                      <div className="space-y-2">
                        {pinnedMessages.map((message) => (
                          <div
                            key={message.id}
                            className="bg-muted/50 p-3 rounded-md border border-muted shadow-sm hover:shadow-md transition-all"
                          >
                            {renderMessage(message)}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {isSearching ? (
                  // Show search results
                  searchResults.length > 0 ? (
                    <div className="space-y-4">
                      <div className="sticky top-0 bg-background/80 backdrop-blur-sm p-2 rounded-md mb-4 z-10">
                        <p className="text-sm text-center">
                          {searchResults.length} résultat(s) trouvé(s) pour "{searchQuery}"
                        </p>
                      </div>
                      {searchResults.map((message) => (
                        <div
                          key={message.id}
                          className="bg-yellow-50 p-2 rounded-md border border-yellow-200 shadow-sm"
                        >
                          {renderMessage(message)}
                        </div>
                      ))}
                    </div>
                  ) : searchQuery ? (
                    <div className="flex flex-col items-center justify-center py-8">
                      <Search className="h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">Aucun résultat trouvé pour "{searchQuery}"</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8">
                      <Search className="h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">Tapez pour rechercher dans la conversation</p>
                    </div>
                  )
                ) : // Show normal messages grouped by date
                showDateDivider ? (
                  Object.entries(groupMessagesByDate(messages)).map(([date, dateMessages]) => (
                    <div key={date} className="mb-6">
                      <div className="flex items-center justify-center mb-4">
                        <div className="bg-muted/50 px-3 py-1 rounded-full text-xs text-muted-foreground">
                          {new Date(date).toLocaleDateString("fr-FR", {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </div>
                      </div>
                      {dateMessages.map((message) => renderMessage(message))}
                    </div>
                  ))
                ) : (
                  // Show messages without date dividers
                  messages.map((message) => renderMessage(message))
                )}

                {typingUsers.length > 0 && <TypingIndicator users={typingUsers} />}

                <div ref={messagesEndRef} />
              </ScrollArea>
              <div className="p-4 border-t bg-background">
                <ChatInput
                  chatId={chatId}
                  onSendMessage={handleSendMessage}
                  onTyping={sendTypingStatus}
                  replyingTo={replyingTo}
                  onCancelReply={() => setReplyingTo(null)}
                  isOffline={false}
                />
              </div>
            </TabsContent>
            <TabsContent value="media" className="flex flex-col h-full">
              <div className="p-4">
                <div className="flex items-center space-x-4 mb-4 overflow-x-auto pb-2">
                  <Button
                    variant={mediaFilter === "all" ? "default" : "outline"}
                    onClick={() => filterMessagesByType("all")}
                    className="flex-shrink-0"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Tous
                  </Button>
                  <Button
                    variant={mediaFilter === "IMAGE" ? "default" : "outline"}
                    onClick={() => filterMessagesByType("IMAGE")}
                    className="flex-shrink-0"
                  >
                    <ImageIcon className="h-4 w-4 mr-2" />
                    Images
                  </Button>
                  <Button
                    variant={mediaFilter === "VIDEO" ? "default" : "outline"}
                    onClick={() => filterMessagesByType("VIDEO")}
                    className="flex-shrink-0"
                  >
                    <Film className="h-4 w-4 mr-2" />
                    Vidéos
                  </Button>
                  <Button
                    variant={mediaFilter === "AUDIO" ? "default" : "outline"}
                    onClick={() => filterMessagesByType("AUDIO")}
                    className="flex-shrink-0"
                  >
                    <Music className="h-4 w-4 mr-2" />
                    Audio
                  </Button>
                  <Button
                    variant={mediaFilter === "FILE" ? "default" : "outline"}
                    onClick={() => filterMessagesByType("FILE")}
                    className="flex-shrink-0"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Fichiers
                  </Button>
                </div>
                <ScrollArea className="h-[calc(100vh-220px)]">
                  {mediaFilter === "IMAGE" || mediaFilter === "all" ? (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-3 flex items-center">
                        <ImageIcon className="h-5 w-5 mr-2 text-primary" />
                        Images
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {imageMessages.map((message) => (
                          <div
                            key={message.id}
                            className="aspect-square rounded-md overflow-hidden border hover:shadow-md transition-all"
                          >
                            <img
                              src={message.attachment[0]?.url || "/placeholder.svg?height=200&width=200"}
                              alt="Image"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                      {imageMessages.length === 0 && (
                        <p className="text-muted-foreground text-center py-4">Aucune image</p>
                      )}
                    </div>
                  ) : null}

                  {mediaFilter === "VIDEO" || mediaFilter === "all" ? (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-3 flex items-center">
                        <Film className="h-5 w-5 mr-2 text-primary" />
                        Vidéos
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {videoMessages.map((message) => (
                          <div
                            key={message.id}
                            className="rounded-md overflow-hidden border hover:shadow-md transition-all"
                          >
                            <VideoMessage message={message} isMe={message.senderId === currentUserId} />
                          </div>
                        ))}
                      </div>
                      {videoMessages.length === 0 && (
                        <p className="text-muted-foreground text-center py-4">Aucune vidéo</p>
                      )}
                    </div>
                  ) : null}

                  {mediaFilter === "AUDIO" || mediaFilter === "all" ? (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-3 flex items-center">
                        <Music className="h-5 w-5 mr-2 text-primary" />
                        Audio
                      </h3>
                      <div className="space-y-3">
                        {audioMessages.map((message) => (
                          <div
                            key={message.id}
                            className="rounded-md overflow-hidden border hover:shadow-md transition-all p-3"
                          >
                            <VoiceMessage message={message} isMe={message.senderId === currentUserId} />
                          </div>
                        ))}
                      </div>
                      {audioMessages.length === 0 && (
                        <p className="text-muted-foreground text-center py-4">Aucun audio</p>
                      )}
                    </div>
                  ) : null}

                  {mediaFilter === "FILE" || mediaFilter === "all" ? (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-3 flex items-center">
                        <FileText className="h-5 w-5 mr-2 text-primary" />
                        Fichiers
                      </h3>
                      <div className="space-y-3">
                        {fileMessages.map((message) => (
                          <div
                            key={message.id}
                            className="rounded-md overflow-hidden border hover:shadow-md transition-all p-3"
                          >
                            <FileMessage message={message} isMe={message.senderId === currentUserId} />
                          </div>
                        ))}
                      </div>
                      {fileMessages.length === 0 && (
                        <p className="text-muted-foreground text-center py-4">Aucun fichier</p>
                      )}
                    </div>
                  ) : null}
                </ScrollArea>
              </div>
            </TabsContent>
            <TabsContent value="pinned" className="flex flex-col h-full">
              <ScrollArea className="flex-1 p-4">
                {pinnedMessages.length > 0 ? (
                  <div className="space-y-4">
                    {pinnedMessages.map((message) => (
                      <div
                        key={message.id}
                        className="bg-muted/50 p-3 rounded-md border border-muted mb-2 hover:shadow-md transition-all"
                      >
                        {renderMessage(message)}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full">
                    <Pin className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Aucun message épinglé</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Épinglez des messages importants pour les retrouver facilement
                    </p>
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      )}

      {/* Chat Info Dialog */}
      <ChatInfoPanel
        open={showChatInfo}
        onOpenChange={setShowChatInfo}
        chat={chatData}
        participants={participants}
        currentUserId={currentUserId}
        isAdmin={isAdmin}
        imageMessages={imageMessages}
        videoMessages={videoMessages}
        fileMessages={fileMessages}
        onRemoveParticipant={handleRemoveParticipant}
        onNavigateToProfile={navigateToProfile}
      />

      {/* Add Participants Dialog */}
      <AddParticipantsDialog
        open={showAddParticipants}
        onOpenChange={setShowAddParticipants}
        onAddParticipants={handleAddParticipants}
        existingParticipantIds={participants.map((p) => p.userId)}
      />
    </div>
  )
}