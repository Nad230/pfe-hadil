"use client"
import { Phone, PhoneOff, Video, VideoOff } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { format } from "date-fns"

interface CallMessageProps {
  message: any
  isMe: boolean
}

export default function CallMessage({ message, isMe }: CallMessageProps) {
  const getCallIcon = () => {
    const callType = message.call?.type || "VOICE"
    const callStatus = message.call?.status || "MISSED"

    if (callType.includes("VIDEO")) {
      return callStatus === "COMPLETED" ? (
        <Video className="h-4 w-4 text-green-500" />
      ) : (
        <VideoOff className="h-4 w-4 text-red-500" />
      )
    } else {
      return callStatus === "COMPLETED" ? (
        <Phone className="h-4 w-4 text-green-500" />
      ) : (
        <PhoneOff className="h-4 w-4 text-red-500" />
      )
    }
  }

  const getCallText = () => {
    const callType = message.call?.type || "VOICE"
    const callStatus = message.call?.status || "MISSED"
    const duration = message.call?.duration || 0

    const isVideo = callType.includes("VIDEO")
    const isGroup = callType.includes("GROUP")

    let text = ""

    if (isMe) {
      text += isGroup ? "Appel de groupe " : "Appel "
      text += isVideo ? "vidéo " : "vocal "
      text += callStatus === "COMPLETED" ? "effectué" : "manqué"
    } else {
      text += isGroup ? "Appel de groupe " : "Appel "
      text += isVideo ? "vidéo " : "vocal "
      text += callStatus === "COMPLETED" ? "reçu" : "manqué"
    }

    if (callStatus === "COMPLETED" && duration > 0) {
      const minutes = Math.floor(duration / 60)
      const seconds = duration % 60
      text += ` (${minutes}:${seconds.toString().padStart(2, "0")})`
    }

    return text
  }

  return (
    <div className={`flex ${isMe ? "justify-end" : "justify-start"} mb-4`}>
      <div className={`flex max-w-[80%] ${isMe ? "flex-row-reverse" : "flex-row"}`}>
        <Avatar className={`h-8 w-8 ${isMe ? "ml-2" : "mr-2"}`}>
          <AvatarImage src={message.sender.profile_photo || "/placeholder.svg?height=32&width=32"} />
          <AvatarFallback>{message.sender.fullname.charAt(0)}</AvatarFallback>
        </Avatar>

        <div className={`rounded-lg p-3 ${isMe ? "bg-primary/10 text-primary" : "bg-muted"} flex items-center gap-2`}>
          <div className="p-2 rounded-full bg-background">{getCallIcon()}</div>
          <div className="flex flex-col">
            <div className="text-sm">{getCallText()}</div>
            <div className="text-xs opacity-70">{format(new Date(message.createdAt), "HH:mm")}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
