"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

export type ReactionType = "Like" | "Love" | "Haha" | "Wow" | "Sad" | "Angry"

interface Reaction {
  id: string
  type: ReactionType
  userId: string
  user: {
    id: string
    fullname: string
    profile_photo: string | null
  }
}

interface MessageReactionProps {
  reactions: Reaction[]
  onReact?: (type: ReactionType) => void
  onRemoveReaction?: (reactionId: string) => void
}

export default function MessageReaction({ reactions, onReact, onRemoveReaction }: MessageReactionProps) {
  const [showTooltip, setShowTooltip] = useState(false)

  // Group reactions by type
  const groupedReactions = reactions.reduce<Record<ReactionType, Reaction[]>>(
    (acc, reaction) => {
      if (!acc[reaction.type]) {
        acc[reaction.type] = []
      }
      acc[reaction.type].push(reaction)
      return acc
    },
    {} as Record<ReactionType, Reaction[]>,
  )

  const getEmojiForType = (type: ReactionType) => {
    switch (type) {
      case "Like":
        return "👍"
      case "Love":
        return "❤️"
      case "Haha":
        return "😂"
      case "Wow":
        return "😮"
      case "Sad":
        return "😢"
      case "Angry":
        return "😡"
      default:
        return "👍"
    }
  }

  return (
    <div className="flex flex-wrap gap-1">
      {Object.entries(groupedReactions).map(([type, typeReactions]) => (
        <div
          key={type}
          className={cn(
            "flex items-center rounded-full bg-muted/80 px-2 py-0.5 text-xs",
            "hover:bg-muted cursor-pointer transition-colors",
          )}
          onClick={() => {
            // If user already reacted with this type, remove the reaction
            const userReaction = typeReactions.find((r) => r.user.fullname === "You")
            if (userReaction && onRemoveReaction) {
              onRemoveReaction(userReaction.id)
            } else if (onReact) {
              // Otherwise add the reaction
              onReact(type as ReactionType)
            }
          }}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          <span className="mr-1">{getEmojiForType(type as ReactionType)}</span>
          <span>{typeReactions.length}</span>

          {showTooltip && (
            <div className="absolute bottom-full left-0 mb-1 rounded-md bg-background p-1 text-xs shadow-md">
              {typeReactions.map((reaction) => (
                <div key={reaction.id} className="whitespace-nowrap">
                  {reaction.user.fullname}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
