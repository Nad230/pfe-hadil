"use client"

import { useState } from "react"
import { Check, CheckCheck, MoreVertical, Trash2, FileText, Download } from "lucide-react"
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

interface FileMessageProps {
  message: Message
  isMe: boolean
  onDelete?: (messageId: string, forEveryone: boolean) => void
}

export default function FileMessage({ message, isMe, onDelete }: FileMessageProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
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

  const fileUrl = attachment.url.startsWith("/")
    ? `${process.env.NEXT_PUBLIC_BACKEND_URL}${attachment.url}`
    : attachment.url

  const formatFileSize = (sizeInBytes?: number) => {
    if (!sizeInBytes) return "Unknown size"

    if (sizeInBytes < 1024) return `${sizeInBytes} B`
    if (sizeInBytes < 1024 * 1024) return `${(sizeInBytes / 1024).toFixed(1)} KB`
    return `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`
  }

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
            <div className={`rounded-lg p-3 ${isMe ? "bg-blue-500 text-white" : "bg-gray-200"} relative group`}>
              <div className="flex items-center gap-3">
                <div className={`bg-white rounded-full p-2 ${isMe ? "text-blue-500" : "text-gray-500"}`}>
                  <FileText size={24} />
                </div>
                <div className="flex-grow">
                  <p className="font-medium truncate max-w-[200px]">{attachment.fileName || "File"}</p>
                  <p className="text-xs opacity-80">{formatFileSize(attachment.fileSize)}</p>
                </div>
                <a
                  href={fileUrl}
                  download={attachment.fileName}
                  className={`p-1 rounded-full ${isMe ? "text-white hover:bg-blue-600" : "text-gray-600 hover:bg-gray-300"}`}
                >
                  <Download size={18} />
                </a>
              </div>
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
                      <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full">
                        <MoreVertical className="h-3 w-3" />
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
