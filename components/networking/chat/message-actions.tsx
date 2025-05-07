"use client"
import { Reply, Copy, Trash, RotateCcw, Forward, Pin, Edit, Smile } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

interface MessageActionsProps {
  message: any
  isMe: boolean
  onDelete?: (messageId: string, forEveryone: boolean) => void
  onResend?: (messageId: string) => void
  onReply?: (messageId: string) => void
  onCopy?: (content: string | null) => void
  onForward?: (messageId: string) => void
  onPin?: (messageId: string, isPinned: boolean) => void
  onEdit?: () => void
  onReact?: (messageId: string, type: string) => void
  onRemoveReaction?: (reactionId: string) => void
}

export function MessageActions({
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
}: MessageActionsProps) {
  const handleDelete = (forEveryone: boolean) => {
    if (onDelete) {
      onDelete(message.id, forEveryone)
    }
  }

  const handleResend = () => {
    if (onResend) {
      onResend(message.id)
    }
  }

  const handleReply = () => {
    if (onReply) {
      onReply(message.id)
    }
  }

  const handleCopy = () => {
    if (onCopy) {
      onCopy(message.content)
    }
  }

  const handleForward = () => {
    if (onForward) {
      onForward(message.id)
    }
  }

  const handlePin = () => {
    if (onPin) {
      onPin(message.id, !message.isPinned)
    }
  }

  // Find user's reaction if any
  const myReaction = message.reactions?.find((r: any) => r.userId === message.sender.id)

  return (
    <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full">
            <span className="sr-only">Actions</span>
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
              className="lucide lucide-more-horizontal"
            >
              <circle cx="12" cy="12" r="1" />
              <circle cx="19" cy="12" r="1" />
              <circle cx="5" cy="12" r="1" />
            </svg>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {message.status === "FAILED" && onResend && (
            <DropdownMenuItem onClick={handleResend}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Renvoyer
            </DropdownMenuItem>
          )}

          <DropdownMenuItem onClick={handleReply}>
            <Reply className="h-4 w-4 mr-2" />
            Répondre
          </DropdownMenuItem>

          {message.content && (
            <DropdownMenuItem onClick={handleCopy}>
              <Copy className="h-4 w-4 mr-2" />
              Copier
            </DropdownMenuItem>
          )}

          <DropdownMenuItem onClick={() => onReact && onReact(message.id, "LIKE")}>
            <Smile className="h-4 w-4 mr-2" />
            Réagir
          </DropdownMenuItem>

          <DropdownMenuItem onClick={handleForward}>
            <Forward className="h-4 w-4 mr-2" />
            Transférer
          </DropdownMenuItem>

          <DropdownMenuItem onClick={handlePin}>
            <Pin className="h-4 w-4 mr-2" />
            {message.isPinned ? "Désépingler" : "Épingler"}
          </DropdownMenuItem>

          {isMe && message.type === "TEXT" && (
            <DropdownMenuItem onClick={onEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Modifier
            </DropdownMenuItem>
          )}

          {myReaction && onRemoveReaction && (
            <DropdownMenuItem onClick={() => onRemoveReaction(myReaction.id)}>
              <Trash className="h-4 w-4 mr-2" />
              Supprimer ma réaction
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          {isMe ? (
            <>
              <DropdownMenuItem onClick={() => handleDelete(false)}>
                <Trash className="h-4 w-4 mr-2" />
                Supprimer pour moi
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDelete(true)} className="text-red-600">
                <Trash className="h-4 w-4 mr-2" />
                Supprimer pour tout le monde
              </DropdownMenuItem>
            </>
          ) : (
            <DropdownMenuItem onClick={() => handleDelete(false)}>
              <Trash className="h-4 w-4 mr-2" />
              Supprimer
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
