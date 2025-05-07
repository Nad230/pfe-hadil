"use client"

import type React from "react"

import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void
  onClickOutside: () => void
  triggerRef: React.RefObject<HTMLElement>
  className?: string
}

export default function EmojiPicker({ onEmojiSelect, onClickOutside, triggerRef, className }: EmojiPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  // Common emoji reactions
  const commonEmojis = [
    { emoji: "👍", name: "Like" },
    { emoji: "❤️", name: "Love" },
    { emoji: "😂", name: "Haha" },
    { emoji: "😮", name: "Wow" },
    { emoji: "😢", name: "Sad" },
    { emoji: "😡", name: "Angry" },
  ]

  // More emoji categories
  const emojiCategories = [
    {
      name: "Smileys",
      emojis: ["😀", "😃", "😄", "😁", "😆", "😅", "🤣", "😂", "🙂", "🙃", "😉", "😊", "😇", "😍", "🥰", "😘"],
    },
    {
      name: "Gestures",
      emojis: ["👍", "👎", "👌", "✌️", "🤞", "🤟", "🤘", "🤙", "👈", "👉", "👆", "👇", "👋", "🤚", "🖐️", "✋"],
    },
    {
      name: "Animals",
      emojis: ["🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯", "🦁", "🐮", "🐷", "🐸", "🐵", "🐔"],
    },
    {
      name: "Food",
      emojis: ["🍎", "🍐", "🍊", "🍋", "🍌", "🍉", "🍇", "🍓", "🍈", "🍒", "🍑", "🥭", "🍍", "🥥", "🥝", "🍅"],
    },
  ]

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        onClickOutside()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [onClickOutside, triggerRef])

  return (
    <div ref={containerRef} className={cn("w-64 rounded-lg border bg-card p-2 shadow-lg", className)}>
      <div className="mb-2">
        <h4 className="mb-1 text-xs font-medium text-muted-foreground">Réactions courantes</h4>
        <div className="flex flex-wrap gap-1">
          {commonEmojis.map((item) => (
            <button
              key={item.name}
              className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted"
              onClick={() => onEmojiSelect(item.name)}
              title={item.name}
            >
              {item.emoji}
            </button>
          ))}
        </div>
      </div>

      <div className="max-h-48 overflow-y-auto">
        {emojiCategories.map((category) => (
          <div key={category.name} className="mb-2">
            <h4 className="mb-1 text-xs font-medium text-muted-foreground">{category.name}</h4>
            <div className="flex flex-wrap gap-1">
              {category.emojis.map((emoji, index) => (
                <button
                  key={`${category.name}-${index}`}
                  className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted"
                  onClick={() => onEmojiSelect(emoji)}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
