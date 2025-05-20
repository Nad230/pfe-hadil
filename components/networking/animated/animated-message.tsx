"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useAudio } from "@/lib/utils/audio-context"
import { useTheme } from "@/lib/utils/theme-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Sparkles, ZapIcon, Music, MessageSquare, MoreVertical } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

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

interface AnimatedMessageProps {
  message: Message
  onReact: (messageId: string, type: string) => void
  onReply: (messageId: string) => void
  onBoost: (messageId: string) => void
  onDelete?: (messageId: string, forEveryone?: boolean) => void
}

export default function AnimatedMessage({ message, onReact, onReply, onBoost, onDelete }: AnimatedMessageProps) {
  const { playSound } = useAudio()
  const { themeColor, themeSecondary } = useTheme()
  const [showActions, setShowActions] = useState(false)
  const [hasAnimated, setHasAnimated] = useState(false)
  const messageRef = useRef<HTMLDivElement>(null)

  // Play sound when boosted message appears
  useEffect(() => {
    if (message.isBoosted && !hasAnimated) {
      playSound("special-secret")
      setHasAnimated(true)
    }
  }, [message.isBoosted, hasAnimated, playSound])

  // Handle message boost animation
  const handleBoost = () => {
    onBoost(message.id)
    playSound("special-secret")
  }

  return (
    <motion.div
      ref={messageRef}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
      className={cn("group relative mb-4 max-w-[80%]", message.isMe ? "ml-auto" : "mr-auto")}
      onHoverStart={() => setShowActions(true)}
      onHoverEnd={() => setShowActions(false)}
    >
      {/* Reply reference */}
      {message.replyTo && (
        <div
          className={cn("mb-1 rounded-lg p-2 text-sm", message.isMe ? "bg-primary/10 ml-auto" : "bg-accent/30 mr-auto")}
        >
          <div className="font-medium text-xs">{message.replyTo.senderName}</div>
          <div className="opacity-80 truncate">{message.replyTo.content}</div>
        </div>
      )}

      <div className="flex items-end gap-2">
        {!message.isMe && (
          <Avatar className="h-8 w-8">
            <AvatarImage src={message.senderAvatar || "/placeholder.svg?height=32&width=32"} alt={message.senderName} />
            <AvatarFallback>{message.senderName[0]}</AvatarFallback>
          </Avatar>
        )}

        <div
          className={cn(
            "relative rounded-2xl px-4 py-2 shadow-md",
            message.isMe
              ? "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-br-none"
              : "bg-accent/30 rounded-bl-none",
          )}
        >
          {/* Boosted message effect */}
          <AnimatePresence>
            {message.isBoosted && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 to-pink-500/20 animate-pulse" />
                <div className="absolute top-0 left-0 w-full h-full">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{
                        x: Math.random() * 100 - 50,
                        y: Math.random() * 100 - 50,
                        opacity: 0,
                      }}
                      animate={{
                        x: Math.random() * 100 - 50,
                        y: Math.random() * 100 - 50,
                        opacity: [0, 1, 0],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Number.POSITIVE_INFINITY,
                        delay: Math.random() * 2,
                      }}
                      className="absolute w-1 h-1 bg-yellow-300 rounded-full"
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Music indicator */}
          {message.hasMusic && (
            <div className="absolute -top-3 -right-1 bg-background rounded-full p-1 shadow-md">
              <Music size={14} className="text-primary animate-pulse" />
            </div>
          )}

          {/* Message content */}
          <div className="relative z-10">
            {!message.isMe && <div className="font-medium text-xs mb-1">{message.senderName}</div>}
            <div className="whitespace-pre-wrap break-words">{message.content}</div>
          </div>

          {/* Message status */}
          <div className="text-[10px] mt-1 text-right opacity-70">
            {formatDistanceToNow(message.timestamp, { addSuffix: true })}
            {message.isMe && (
              <span className="ml-1">
                {message.status === "sending" && "• Sending..."}
                {message.status === "sent" && "• Sent"}
                {message.status === "delivered" && "• Delivered"}
                {message.status === "seen" && "• Seen"}
                {message.status === "failed" && "• Failed"}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Message actions */}
      <AnimatePresence>
        {(showActions || message.reactions?.some((r) => r.count > 0)) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className={cn(
              "absolute -bottom-4 flex items-center gap-1 bg-background/80 backdrop-blur-md p-1 rounded-full shadow-lg z-10",
              message.isMe ? "right-2" : "left-10",
            )}
          >
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded-full"
              onClick={() => onReact(message.id, "❤️")}
            >
              <span className="text-sm">❤️</span>
            </Button>

            <Button size="icon" variant="ghost" className="h-6 w-6 rounded-full" onClick={() => onReply(message.id)}>
              <MessageSquare size={14} />
            </Button>

            <Button size="icon" variant="ghost" className="h-6 w-6 rounded-full" onClick={handleBoost}>
              <ZapIcon size={14} className={message.isBoosted ? "text-yellow-500" : ""} />
            </Button>

            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6 rounded-full"
              onClick={() => playSound("ambient-calm")}
            >
              <Sparkles size={14} />
            </Button>

            {onDelete && message.isMe && (
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6 rounded-full text-red-500 hover:text-red-600"
                onClick={() => onDelete(message.id, true)}
              >
                <MoreVertical size={14} />
              </Button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
