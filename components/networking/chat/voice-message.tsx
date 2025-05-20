"use client"

import { useState, useRef, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Play, Pause, MoreVertical, Download } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"

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
  attachment: {
    id: string
    url: string
    type: string
    messageId: string
    duration?: number
  }[]
  call: any[]
  readReceipts: any[]
  deletions: any[]
  isPinned?: boolean
  reactions?: any[]
}

interface VoiceMessageProps {
  message: Message
  isMe: boolean
  onDelete?: (messageId: string, forEveryone: boolean) => void
  onReply?: (messageId: string) => void
  onForward?: (messageId: string) => void
}

export default function VoiceMessage({ message, isMe, onDelete, onReply, onForward }: VoiceMessageProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const waveformCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const router = useRouter()

  useEffect(() => {
    if (!message.attachment || message.attachment.length === 0) return

    const audio = new Audio(message.attachment[0].url)
    audioRef.current = audio

    audio.addEventListener("loadedmetadata", () => {
      setDuration(audio.duration)
    })

    audio.addEventListener("timeupdate", () => {
      setCurrentTime(audio.currentTime)
    })

    audio.addEventListener("ended", () => {
      setIsPlaying(false)
      setCurrentTime(0)
    })

    // Generate a fake waveform
    const canvas = waveformCanvasRef.current
    if (canvas) {
      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        // Set colors based on isMe
        ctx.fillStyle = isMe ? "rgba(255, 255, 255, 0.5)" : "rgba(0, 0, 0, 0.2)"

        // Generate random bars for waveform
        const barCount = 40
        const barWidth = canvas.width / barCount
        const barMargin = 1

        for (let i = 0; i < barCount; i++) {
          const barHeight = Math.random() * (canvas.height - 10) + 5
          ctx.fillRect(i * (barWidth + barMargin), (canvas.height - barHeight) / 2, barWidth, barHeight)
        }
      }
    }

    return () => {
      audio.pause()
      audio.src = ""
    }
  }, [message.attachment])

  const togglePlayPause = () => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }

    setIsPlaying(!isPlaying)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  const navigateToProfile = (userId: string) => {
    router.push(`/habits/networking/profile/${userId}`)
  }

  return (
    <div className={cn("group flex items-start gap-2 mb-4 max-w-[85%]", isMe ? "ml-auto" : "mr-auto")}>
      {!isMe && (
        <Avatar
          className="h-8 w-8 cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all"
          onClick={() => navigateToProfile(message.sender.id)}
        >
          <AvatarImage
            src={message.sender.profile_photo || "/placeholder.svg?height=32&width=32"}
            alt={message.sender.fullname}
          />
          <AvatarFallback>{message.sender.fullname.charAt(0)}</AvatarFallback>
        </Avatar>
      )}

      <div className={cn("flex flex-col", isMe ? "items-end" : "items-start")}>
        <div
          className={cn(
            "flex items-center gap-2 px-4 py-3 rounded-2xl shadow-sm hover:shadow-md transition-shadow",
            isMe
              ? "bg-gradient-to-br from-primary to-primary/90 text-primary-foreground rounded-tr-none"
              : "bg-muted text-foreground rounded-tl-none",
          )}
        >
          <Button
            variant={isMe ? "secondary" : "default"}
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={togglePlayPause}
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>

          <div className="flex flex-col gap-1 min-w-[150px]">
            <canvas ref={waveformCanvasRef} width="150" height="30" className="rounded" />
            <div className="flex justify-between text-xs">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-7 w-7 rounded-full opacity-0 group-hover:opacity-100 transition-opacity",
                  isMe ? "text-primary-foreground" : "text-foreground",
                )}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align={isMe ? "end" : "start"}>
              <DropdownMenuItem className="cursor-pointer">
                <Download className="h-4 w-4 mr-2" />
                Télécharger
              </DropdownMenuItem>
              {onReply && (
                <DropdownMenuItem onClick={() => onReply(message.id)} className="cursor-pointer">
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
                    className="lucide lucide-reply mr-2"
                  >
                    <polyline points="9 17 4 12 9 7" />
                    <path d="M20 18v-2a4 4 0 0 0-4-4H4" />
                  </svg>
                  Répondre
                </DropdownMenuItem>
              )}
              {onForward && (
                <DropdownMenuItem onClick={() => onForward(message.id)} className="cursor-pointer">
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
                    className="lucide lucide-forward mr-2"
                  >
                    <polyline points="15 17 20 12 15 7" />
                    <path d="M4 18v-2a4 4 0 0 1 4-4h12" />
                  </svg>
                  Transférer
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem onClick={() => onDelete(message.id, false)} className="cursor-pointer text-red-600">
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
                    className="lucide lucide-trash-2 mr-2"
                  >
                    <path d="M3 6h18" />
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                    <line x1="10" x2="10" y1="11" y2="17" />
                    <line x1="14" x2="14" y1="11" y2="17" />
                  </svg>
                  Supprimer
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {!isMe && (
          <span
            className="text-xs font-medium cursor-pointer hover:underline mt-1"
            onClick={() => navigateToProfile(message.sender.id)}
          >
            {message.sender.fullname}
          </span>
        )}

        <div className={cn("text-xs text-muted-foreground mt-1", isMe ? "text-right" : "text-left")}>
          {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
        </div>
      </div>
    </div>
  )
}
