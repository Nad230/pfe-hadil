"use client"

import { useState } from "react"
import { Check, CheckCheck, MoreVertical, Trash2 } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { formatDistanceToNow } from "date-fns"

interface Attachment {
  id: string
  url: string
  type: "Image" | "Video" | "Audio" | "Document"
  fileName?: string
  fileSize?: number
  width?: number
  height?: number
  duration?: number
  messageId: string
}

interface Message {
  id: string
  content: string | null
  type: "TEXT" | "IMAGE" | "VIDEO" | "AUDIO" | "FILE" | "LINK" | "CALL"
  status: "SENDING" | "DELIVERED" | "SENT" | "SEEN" | "FAILED" | "EDITED"
  senderId: string
  chatId: string
  createdAt: string
  updatedAt: string
  sender: {
    id: string
    fullname: string
    profile_photo: string | null
  }
  attachment: Attachment[]
}

interface ImageMessageProps {
  message: Message
  isMe: boolean
  onDelete?: (messageId: string, forEveryone: boolean) => void
}

export default function ImageMessage({ message, isMe, onDelete }: ImageMessageProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showFullImage, setShowFullImage] = useState(false)
  const attachment = message.attachment[0]

  const handleDelete = (forEveryone: boolean) => {
    if (onDelete) {
      onDelete(message.id, forEveryone)
      setShowDeleteDialog(false)
    }
  }

  const getStatusIcon = () => {
    if (message.status === "SENDING") return null
    if (message.status === "FAILED") return <span className="text-red-500 text-xs">Failed</span>
    if (message.status === "SENT" || message.status === "DELIVERED") return <Check size={14} />
    if (message.status === "SEEN") return <CheckCheck size={14} />
    return null
  }

  if (!attachment) return null

  const imageUrl = attachment.url.startsWith("/")
    ? `${process.env.NEXT_PUBLIC_BACKEND_URL}${attachment.url}`
    : attachment.url

  return (
    <div className={`flex ${isMe ? "justify-end" : "justify-start"} group`}>
      <div className={`flex items-end gap-2 max-w-[75%] ${isMe ? "flex-row-reverse" : ""}`}>
        {!isMe && (
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={message.sender.profile_photo || "/placeholder.svg?height=32&width=32"}
              alt={message.sender.fullname}
            />
            <AvatarFallback>{message.sender.fullname.charAt(0)}</AvatarFallback>
          </Avatar>
        )}

        <div className="flex flex-col">
          <div className={`flex items-center gap-1 mb-1 ${isMe ? "justify-end" : ""}`}>
            {!isMe && <span className="text-xs font-medium">{message.sender.fullname}</span>}
          </div>

          <div className="flex items-end gap-2">
            <div className={`rounded-lg p-2 ${isMe ? "bg-blue-500" : "bg-gray-200"} relative group`}>
              <img
                src={imageUrl || "/placeholder.svg"}
                alt="Image message"
                className="rounded max-w-full max-h-[300px] object-contain cursor-pointer"
                onClick={() => setShowFullImage(true)}
              />
              <div
                className={`flex justify-end items-center gap-1 mt-1 text-xs ${
                  isMe ? "text-blue-100" : "text-gray-500"
                }`}
              >
                <span>{formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}</span>
                {isMe && getStatusIcon()}
              </div>

              {isMe && (
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 rounded-full bg-black/30 hover:bg-black/50"
                      >
                        <MoreVertical className="h-3 w-3 text-white" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setShowDeleteDialog(true)}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Full Image Dialog */}
      <Dialog open={showFullImage} onOpenChange={setShowFullImage}>
        <DialogContent className="sm:max-w-4xl p-0 overflow-hidden">
          <div className="relative">
            <img
              src={imageUrl || "/placeholder.svg"}
              alt="Full size image"
              className="w-full h-auto max-h-[80vh] object-contain"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 rounded-full bg-black/30 hover:bg-black/50"
              onClick={() => setShowFullImage(false)}
            >
              <span className="sr-only">Close</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-white"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Message</DialogTitle>
            <DialogDescription>How would you like to delete this message?</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Button onClick={() => handleDelete(false)} variant="outline">
              Delete for me only
            </Button>
            <Button onClick={() => handleDelete(true)} variant="destructive">
              Delete for everyone
            </Button>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
