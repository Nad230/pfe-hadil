"use client"

import type React from "react"
import { useState } from "react"
import { format } from "date-fns"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Check, X, ThumbsUp, Heart, Laugh, Angry, FrownIcon as Sad } from "lucide-react"
import { MessageActions } from "./message-actions"
import { motion } from "framer-motion"

export type ReactionType = "LIKE" | "LOVE" | "LAUGH" | "SAD" | "ANGRY"

interface ChatMessageProps {
  message: {
    id: string
    content: string | null
    createdAt: string
    status: string
    sender: {
      id: string
      fullname: string
      profile_photo: string | null
    }
    replyTo?: {
      id: string
      content: string | null
      sender: {
        id: string
        fullname: string
      }
    } | null
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
  }
  isMe: boolean
  onDelete?: (messageId: string, forEveryone: boolean) => void
  onResend?: (messageId: string) => void
  onReply?: (messageId: string) => void
  onCopy?: (content: string | null) => void
  onForward?: (messageId: string) => void
  onPin?: (messageId: string, isPinned: boolean) => void
  onEdit?: (messageId: string, newContent: string) => void
  onReact?: (messageId: string, type: ReactionType) => void
  onRemoveReaction?: (reactionId: string) => void
  renderStatus?: () => React.ReactNode
}

export default function ChatMessage({
  message,
  isMe,
  onDelete,
  onResend,
  onReply,
  onCopy,
  onForward,
  onPin,
  onEdit,
  onReact,
  onRemoveReaction,
  renderStatus,
}: ChatMessageProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedContent, setEditedContent] = useState(message.content || "")
  const [showReactions, setShowReactions] = useState(false)

  const handleEdit = () => {
    if (onEdit && editedContent.trim() !== "") {
      onEdit(message.id, editedContent)
      setIsEditing(false)
    }
  }

  const handleReact = (type: ReactionType) => {
    if (onReact) {
      onReact(message.id, type)
      setShowReactions(false)
    }
  }

  const handleRemoveReaction = (reactionId: string) => {
    if (onRemoveReaction) {
      onRemoveReaction(reactionId)
    }
  }

  const getReactionIcon = (type: ReactionType) => {
    switch (type) {
      case "LIKE":
        return <ThumbsUp className="h-4 w-4 text-blue-500" />
      case "LOVE":
        return <Heart className="h-4 w-4 text-red-500" />
      case "LAUGH":
        return <Laugh className="h-4 w-4 text-yellow-500" />
      case "SAD":
        return <Sad className="h-4 w-4 text-purple-500" />
      case "ANGRY":
        return <Angry className="h-4 w-4 text-orange-500" />
      default:
        return <ThumbsUp className="h-4 w-4" />
    }
  }

  // Group reactions by type
  const reactionsByType = message.reactions?.reduce(
    (acc, reaction) => {
      if (!acc[reaction.type]) {
        acc[reaction.type] = []
      }
      acc[reaction.type].push(reaction)
      return acc
    },
    {} as Record<ReactionType, typeof message.reactions>,
  )

  return (
    <div className={`flex ${isMe ? "justify-end" : "justify-start"} mb-4 group relative`}>
      <div className={`flex max-w-[80%] ${isMe ? "flex-row-reverse" : "flex-row"}`}>
        <Avatar className={`h-8 w-8 ${isMe ? "ml-2" : "mr-2"}`}>
          <AvatarImage src={message.sender.profile_photo || "/placeholder.svg?height=32&width=32"} />
          <AvatarFallback className="bg-gradient-to-br from-blue-500/60 to-purple-500/30 text-white">
            {message.sender.fullname.charAt(0)}
          </AvatarFallback>
        </Avatar>

        <div
          className={`flex flex-col ${
            isMe
              ? "items-end bg-gradient-to-r from-blue-500 to-blue-600 text-white"
              : "items-start bg-gradient-to-r from-gray-100 to-gray-200"
          } rounded-lg p-3 shadow-sm`}
        >
          {!isMe && <div className="text-xs font-medium mb-1">{message.sender.fullname}</div>}

          {message.replyTo && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className={`text-xs p-2 rounded mb-2 w-full ${
                isMe
                  ? "bg-blue-400/30 text-blue-50 border-l-2 border-blue-300"
                  : "bg-white text-gray-700 border-l-2 border-blue-400"
              }`}
            >
              <div className="font-medium flex items-center gap-1">
                <div className={`w-1 h-3 rounded-full ${isMe ? "bg-blue-200" : "bg-blue-500"} mr-1`}></div>
                {message.replyTo.sender.fullname}
              </div>
              <div className="truncate mt-1">{message.replyTo.content || "Contenu média"}</div>
            </motion.div>
          )}

          {isEditing ? (
            <div className="space-y-2 w-full">
              <Textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="min-h-[60px] text-sm bg-white text-gray-900"
                autoFocus
              />
              <div className="flex justify-end space-x-2">
                <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)} className="h-7 px-2">
                  <X className="h-4 w-4 mr-1" />
                  Annuler
                </Button>
                <Button variant="default" size="sm" onClick={handleEdit} className="h-7 px-2">
                  <Check className="h-4 w-4 mr-1" />
                  Enregistrer
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="whitespace-pre-wrap break-words">{message.content}</div>
              <div className={`text-xs mt-1 ${isMe ? "text-blue-100" : "text-gray-500"}`}>
                {format(new Date(message.createdAt), "HH:mm")}
                {message.status === "EDITED" && <span className="ml-1">(modifié)</span>}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Reactions display */}
      {message.reactions && message.reactions.length > 0 && (
        <div
          className={`absolute ${isMe ? "right-0" : "left-0"} -bottom-3 flex bg-white border rounded-full px-1 py-0.5 shadow-sm`}
        >
          {Object.entries(reactionsByType || {}).map(([type, reactions]) => (
            <div key={type} className="flex items-center mr-1 last:mr-0">
              {getReactionIcon(type as ReactionType)}
              <span className="text-xs ml-0.5">{reactions?.length}</span>
            </div>
          ))}
        </div>
      )}

      {/* Reaction picker */}
      {showReactions && (
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full bg-white border rounded-full p-1 shadow-md flex space-x-1 z-10">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full hover:bg-blue-50"
            onClick={() => handleReact("LIKE")}
          >
            <ThumbsUp className="h-4 w-4 text-blue-500" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full hover:bg-red-50"
            onClick={() => handleReact("LOVE")}
          >
            <Heart className="h-4 w-4 text-red-500" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full hover:bg-yellow-50"
            onClick={() => handleReact("LAUGH")}
          >
            <Laugh className="h-4 w-4 text-yellow-500" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full hover:bg-purple-50"
            onClick={() => handleReact("SAD")}
          >
            <Sad className="h-4 w-4 text-purple-500" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full hover:bg-orange-50"
            onClick={() => handleReact("ANGRY")}
          >
            <Angry className="h-4 w-4 text-orange-500" />
          </Button>
        </div>
      )}

      {isMe && renderStatus && (
        <div className="absolute bottom-0 right-0 translate-y-5 opacity-0 group-hover:opacity-100 transition-opacity">
          {renderStatus()}
        </div>
      )}

      <MessageActions
        message={message}
        isMe={isMe}
        onDelete={onDelete}
        onResend={onResend}
        onReply={onReply}
        onCopy={onCopy}
        onForward={onForward}
        onPin={onPin}
        onEdit={() => setIsEditing(true)}
        onReact={() => setShowReactions(!showReactions)}
        onRemoveReaction={handleRemoveReaction}
      />
    </div>
  )
}
