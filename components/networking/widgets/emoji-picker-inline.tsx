"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Smile } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void
}

// Groupes d'emojis
const emojiGroups = {
  smileys: [
    "😀",
    "😃",
    "😄",
    "😁",
    "😆",
    
    "😅",
    "😂",
    "🤣",
    "😊",
    "😇",
    "🙂",
    "🙃",
    "😉",
    "😌",
    "😍",
    "🥰",
    "😘",
    "😗",
    "😙",
    "😚",
    "😋",
    "😛",
    "😝",
    "😜",
    "🤪",
    "🤨",
    "🧐",
    "��",
    "😎",
    "🤩",
  ],
  gestures: [
    "👍",
    "👎",
    "👌",
    "✌️",
    "🤞",
    "🤟",
    "🤘",
    "🤙",
    "👈",
    "👉",
    "👆",
    "👇",
    "☝️",
    "👋",
    "🤚",
    "🖐️",
    "✋",
    "🖖",
    "👏",
    "🙌",
    "👐",
    "🤲",
    "🙏",
    "✍️",
    "💅",
    "🤳",
    "💪",
    "👂",
    "👃",
    "🧠",
  ],
  symbols: [
    "❤️",
    "🧡",
    "💛",
    "💚",
    "💙",
    "💜",
    "🖤",
    "❣️",
    "💕",
    "💞",
    "💓",
    "💗",
    "💖",
    "💘",
    "💝",
    "💟",
    "☮️",
    "✝️",
    "☪️",
    "🕉️",
    "☸️",
    "✡️",
    "🔯",
    "🕎",
    "☯️",
    "☦️",
    "🛐",
    "⛎",
    "♈",
    "♉",
  ],
  objects: [
    "🎉",
    "🎊",
    "🎈",
    "🎂",
    "🎁",
    "🎄",
    "🎀",
    "🎗️",
    "🎟️",
    "🎫",
    "🎖️",
    "🏆",
    "🏅",
    "🥇",
    "🥈",
    "🥉",
    "⚽",
    "⚾",
    "🏀",
    "🏐",
    "🏈",
    "🏉",
    "🎾",
    "🎱",
    "🎳",
    "🏏",
    "🏑",
    "🏒",
    "🥍",
    "🏓",
  ],
}

export function EmojiPickerInline({ onEmojiSelect }: EmojiPickerProps) {
  const [activeTab, setActiveTab] = useState("smileys")

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
          <Smile className="h-5 w-5" />
          <span className="sr-only">Emoji picker</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-3" align="end">
        <Tabs defaultValue="smileys" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 mb-2">
            <TabsTrigger value="smileys" title="Smileys & Emotions">
              😀
            </TabsTrigger>
            <TabsTrigger value="gestures" title="Gestures & Body Parts">
              👍
            </TabsTrigger>
            <TabsTrigger value="symbols" title="Symbols">
              ❤️
            </TabsTrigger>
            <TabsTrigger value="objects" title="Objects">
              🎁
            </TabsTrigger>
          </TabsList>

          {Object.entries(emojiGroups).map(([group, emojis]) => (
            <TabsContent key={group} value={group} className="mt-2">
              <div className="grid grid-cols-8 gap-1">
                {emojis.map((emoji) => (
                  <Button
                    key={emoji}
                    variant="ghost"
                    className="h-8 w-8 p-0 hover:bg-muted"
                    onClick={() => onEmojiSelect(emoji)}
                  >
                    {emoji}
                  </Button>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </PopoverContent>
    </Popover>
  )
}
