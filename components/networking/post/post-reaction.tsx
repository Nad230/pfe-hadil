"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Heart } from "lucide-react"

interface PostReactionPickerProps {
  postId: string
  userReaction?: string
  likeCount: number
  onReact: (type: string) => void
}

export function PostReactionPicker({ postId, userReaction, likeCount, onReact }: PostReactionPickerProps) {
  const [isOpen, setIsOpen] = useState(false)

  const reactions = [
    { type: "like", emoji: "👍", label: "Like" },
    { type: "love", emoji: "❤️", label: "Love" },
    { type: "haha", emoji: "😂", label: "Haha" },
    { type: "wow", emoji: "😮", label: "Wow" },
    { type: "sad", emoji: "😢", label: "Sad" },
    { type: "angry", emoji: "😡", label: "Angry" },
  ]

  const currentReaction = userReaction ? reactions.find((r) => r.type === userReaction) : reactions[0]

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`flex items-center gap-1 ${userReaction ? "text-primary" : ""}`}
          onClick={() => (userReaction ? onReact(userReaction) : setIsOpen(true))}
        >
          {userReaction ? (
            <>
              {reactions.find((r) => r.type === userReaction)?.emoji || <Heart className="h-5 w-5" />}
              <span>{likeCount}</span>
            </>
          ) : (
            <>
              <Heart className="h-5 w-5" />
              <span>{likeCount}</span>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2" align="start">
        <div className="flex gap-1">
          {reactions.map((reaction) => (
            <button
              key={reaction.type}
              className="flex flex-col items-center p-2 hover:bg-muted rounded-md transition-transform hover:scale-110"
              onClick={() => {
                onReact(reaction.type)
                setIsOpen(false)
              }}
              title={reaction.label}
            >
              <span className="text-xl">{reaction.emoji}</span>
              <span className="text-xs mt-1">{reaction.label}</span>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}

