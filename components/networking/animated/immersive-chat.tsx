"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useAudio } from "@/lib/utils/audio-context"
import { useTheme } from "@/lib/utils/theme-context"
import AnimatedBackground from "./animated-background"
import AnimatedMessage from "./animated-message"
import AudioControls from "./audio-controls"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Smile, Send, Paperclip, Mic, ImageIcon, Music, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

interface Message {
  id: string
  content: string
  senderId: string
  senderName: string
  senderAvatar?: string
  timestamp: Date
  isMe: boolean
  status: "sending" | "sent" | "delivered" | "seen" | "failed"
  reactions?: { type: string; count: number; reacted: boolean }[]
  isBoosted?: boolean
  hasMusic?: boolean
  replyTo?: {
    id: string
    content: string
    senderName: string
  }
}

interface ImmersiveChatProps {
  chatId: string
  chatName: string
  chatAvatar?: string
  initialMessages?: Message[]
  currentUserId: string
  currentUserName: string
  currentUserAvatar?: string
}

export default function ImmersiveChat({
  chatId,
  chatName,
  chatAvatar,
  initialMessages = [],
  currentUserId,
  currentUserName,
  currentUserAvatar,
}: ImmersiveChatProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [inputValue, setInputValue] = useState("")
  const [replyingTo, setReplyingTo] = useState<Message | null>(null)
  const [isTyping, setIsTyping] = useState(false)
  const [specialMode, setSpecialMode] = useState<"music" | "sparkles" | null>(null)
  const [clickCount, setClickCount] = useState(0)
  const [discoveredEasterEgg, setDiscoveredEasterEgg] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const { playSound, unlockSound } = useAudio()
  const { themeName, unlockTheme } = useTheme()

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Easter egg: clicking the chat name multiple times
  useEffect(() => {
    if (clickCount >= 7 && !discoveredEasterEgg) {
      playSound("special-secret")
      unlockSound("special-secret")
      unlockTheme("secret-rainbow")
      setDiscoveredEasterEgg(true)

      // Show a special message
      const easterEggMessage: Message = {
        id: `easter-egg-${Date.now()}`,
        content: "🎉 You've discovered a secret theme! Check your theme collection.",
        senderId: "system",
        senderName: "System",
        timestamp: new Date(),
        isMe: false,
        status: "seen",
        isBoosted: true,
      }

      setMessages((prev) => [...prev, easterEggMessage])
    }

    const timer = setTimeout(() => {
      if (clickCount > 0) {
        setClickCount(0)
      }
    }, 3000)

    return () => clearTimeout(timer)
  }, [clickCount, discoveredEasterEgg, playSound, unlockSound, unlockTheme])

  const handleSendMessage = () => {
    if (!inputValue.trim()) return

    playSound("message-sent")

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      content: inputValue,
      senderId: currentUserId,
      senderName: currentUserName,
      senderAvatar: currentUserAvatar,
      timestamp: new Date(),
      isMe: true,
      status: "sending",
      hasMusic: specialMode === "music",
      isBoosted: specialMode === "sparkles",
      replyTo: replyingTo
        ? {
            id: replyingTo.id,
            content: replyingTo.content,
            senderName: replyingTo.senderName,
          }
        : undefined,
    }

    setMessages((prev) => [...prev, newMessage])
    setInputValue("")
    setReplyingTo(null)
    setSpecialMode(null)

    // Simulate message status updates
    setTimeout(() => {
      setMessages((prev) => prev.map((msg) => (msg.id === newMessage.id ? { ...msg, status: "sent" } : msg)))

      setTimeout(() => {
        setMessages((prev) => prev.map((msg) => (msg.id === newMessage.id ? { ...msg, status: "delivered" } : msg)))

        setTimeout(() => {
          setMessages((prev) => prev.map((msg) => (msg.id === newMessage.id ? { ...msg, status: "seen" } : msg)))
        }, 2000)
      }, 1000)
    }, 500)

    // Simulate reply after a delay
    if (messages.length % 3 === 0) {
      setTimeout(() => {
        const replyMessage: Message = {
          id: `msg-${Date.now()}`,
          content: getRandomReply(),
          senderId: "other",
          senderName: chatName,
          senderAvatar: chatAvatar,
          timestamp: new Date(),
          isMe: false,
          status: "seen",
        }

        setIsTyping(true)

        setTimeout(() => {
          setIsTyping(false)
          setMessages((prev) => [...prev, replyMessage])
          playSound("message-received")
        }, 2000)
      }, 2000)
    }
  }

  const getRandomReply = () => {
    const replies = [
      "That's interesting! Tell me more.",
      "I see what you mean. What do you think about this?",
      "Hmm, I hadn't thought of it that way before.",
      "That's a great point! 😊",
      "I'm not sure I agree, but I respect your perspective.",
      "Wow, that's amazing!",
      "I've been thinking about that too recently.",
      "Have you considered looking at it from another angle?",
      "That reminds me of something I read recently...",
      "I love your enthusiasm about this topic!",
    ]

    return replies[Math.floor(Math.random() * replies.length)]
  }

  const handleReact = (messageId: string, type: string) => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id === messageId) {
          const existingReactions = msg.reactions || []
          const existingReaction = existingReactions.find((r) => r.type === type)

          let updatedReactions

          if (existingReaction) {
            // Toggle reaction off if it was already reacted by current user
            if (existingReaction.reacted) {
              updatedReactions = existingReactions
                .map((r) => (r.type === type ? { ...r, count: r.count - 1, reacted: false } : r))
                .filter((r) => r.count > 0)
            } else {
              // Toggle reaction on
              updatedReactions = existingReactions.map((r) =>
                r.type === type ? { ...r, count: r.count + 1, reacted: true } : r,
              )
            }
          } else {
            // Add new reaction
            updatedReactions = [...existingReactions, { type, count: 1, reacted: true }]
          }

          return { ...msg, reactions: updatedReactions }
        }
        return msg
      }),
    )
  }

  const handleReply = (messageId: string) => {
    const message = messages.find((msg) => msg.id === messageId)
    if (message) {
      setReplyingTo(message)
      inputRef.current?.focus()
    }
  }

  const handleBoost = (messageId: string) => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id === messageId) {
          return { ...msg, isBoosted: !msg.isBoosted }
        }
        return msg
      }),
    )
  }

  const handleDelete = (messageId: string) => {
    setMessages((prev) => prev.filter((msg) => msg.id !== messageId))
  }

  return (
    <AnimatedBackground>
      <div className="flex flex-col h-screen">
        {/* Chat header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 border-b bg-background/80 backdrop-blur-md flex items-center justify-between"
        >
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setClickCount((prev) => prev + 1)}>
            <Avatar>
              <AvatarImage src={chatAvatar || "/placeholder.svg?height=40&width=40"} alt={chatName} />
              <AvatarFallback>{chatName[0]}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-semibold">{chatName}</h2>
              <p className="text-xs text-muted-foreground">{isTyping ? "typing..." : "online"}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Mic className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <ImageIcon className="h-5 w-5" />
            </Button>
          </div>
        </motion.div>

        {/* Chat messages */}
        <ScrollArea className="flex-1 p-4">
          <AnimatePresence>
            {messages.map((message) => (
              <AnimatedMessage
                key={message.id}
                message={message}
                onReact={handleReact}
                onReply={handleReply}
                onBoost={handleBoost}
                onDelete={handleDelete}
              />
            ))}
          </AnimatePresence>

          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 ml-10 mb-4"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={chatAvatar || "/placeholder.svg?height=32&width=32"} alt={chatName} />
                <AvatarFallback>{chatName[0]}</AvatarFallback>
              </Avatar>
              <div className="bg-accent/30 rounded-full px-4 py-2">
                <div className="flex gap-1">
                  <span
                    className="w-2 h-2 bg-foreground/70 rounded-full animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  />
                  <span
                    className="w-2 h-2 bg-foreground/70 rounded-full animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  />
                  <span
                    className="w-2 h-2 bg-foreground/70 rounded-full animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  />
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </ScrollArea>

        {/* Reply indicator */}
        <AnimatePresence>
          {replyingTo && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="px-4 py-2 bg-accent/20 border-t flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <div className="w-1 h-8 bg-primary rounded-full" />
                <div>
                  <div className="text-xs font-medium">Replying to {replyingTo.senderName}</div>
                  <div className="text-xs text-muted-foreground truncate max-w-[200px]">{replyingTo.content}</div>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setReplyingTo(null)}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-x"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Special mode indicator */}
        <AnimatePresence>
          {specialMode && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className={cn(
                "px-4 py-2 border-t flex items-center justify-between",
                specialMode === "music" ? "bg-blue-500/20" : "bg-yellow-500/20",
              )}
            >
              <div className="flex items-center gap-2">
                {specialMode === "music" ? (
                  <Music className="h-4 w-4 text-blue-500" />
                ) : (
                  <Sparkles className="h-4 w-4 text-yellow-500" />
                )}
                <div className="text-xs font-medium">
                  {specialMode === "music" ? "Music mode enabled" : "Sparkle mode enabled"}
                </div>
              </div>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setSpecialMode(null)}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-x"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chat input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 border-t bg-background/80 backdrop-blur-md"
        >
          <div className="flex items-end gap-2">
            <div className="flex-1 relative">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type a message..."
                className="pr-20"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage()
                  }
                }}
              />
              <div className="absolute right-2 bottom-1/2 transform translate-y-1/2 flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn("h-7 w-7 rounded-full", specialMode === "music" && "text-blue-500 bg-blue-100")}
                  onClick={() => setSpecialMode(specialMode === "music" ? null : "music")}
                >
                  <Music className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn("h-7 w-7 rounded-full", specialMode === "sparkles" && "text-yellow-500 bg-yellow-100")}
                  onClick={() => setSpecialMode(specialMode === "sparkles" ? null : "sparkles")}
                >
                  <Sparkles className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="rounded-full" onClick={() => playSound("reaction-heart")}>
              <Smile className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Paperclip className="h-5 w-5" />
            </Button>
            <Button
              variant="default"
              size="icon"
              className="rounded-full"
              onClick={handleSendMessage}
              disabled={!inputValue.trim()}
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </motion.div>
      </div>

      <AudioControls />
    </AnimatedBackground>
  )
}
