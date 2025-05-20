"use client"

import { useEffect, useState } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface TypingIndicatorProps {
  users: { userId: string; name: string }[]
}

export default function TypingIndicator({ users }: TypingIndicatorProps) {
  const [dots, setDots] = useState(".")

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => {
        if (prev === "...") return "."
        if (prev === "..") return "..."
        if (prev === ".") return ".."
        return "."
      })
    }, 500)

    return () => clearInterval(interval)
  }, [])

  if (users.length === 0) return null

  let message = ""
  if (users.length === 1) {
    message = `${users[0].name} est en train d'écrire`
  } else if (users.length === 2) {
    message = `${users[0].name} et ${users[1].name} sont en train d'écrire`
  } else {
    message = `${users.length} personnes sont en train d'écrire`
  }

  return (
    <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30 max-w-xs animate-pulse mb-4">
      <div className="flex -space-x-2">
        {users.slice(0, 3).map((user, index) => (
          <Avatar key={user.userId} className="h-6 w-6 border-2 border-background">
            <AvatarFallback className="text-xs">{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
        ))}
      </div>
      <div className="text-xs text-muted-foreground">
        {message}
        {dots}
      </div>
    </div>
  )
}
