"use client"
import { Button } from "@/components/ui/button"
import { Moon, Sun } from "lucide-react"

interface ChatModeToggleProps {
  immersiveMode: boolean
  onChange: (value: boolean) => void
}

export default function ChatModeToggle({ immersiveMode, onChange }: ChatModeToggleProps) {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-lg border">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className={`rounded-full h-8 w-8 ${!immersiveMode ? "bg-primary/10 text-primary" : ""}`}
          onClick={() => onChange(false)}
        >
          <Sun className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={`rounded-full h-8 w-8 ${immersiveMode ? "bg-primary/10 text-primary" : ""}`}
          onClick={() => onChange(true)}
        >
          <Moon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
