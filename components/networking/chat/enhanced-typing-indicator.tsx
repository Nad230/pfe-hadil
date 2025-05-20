"use client"

import { useEffect, useState } from "react"

interface EnhancedTypingIndicatorProps {
  users: { userId: string; name: string }[]
}

export function EnhancedTypingIndicator({ users }: EnhancedTypingIndicatorProps) {
  const [displayText, setDisplayText] = useState("")

  useEffect(() => {
    if (users.length === 0) {
      setDisplayText("")
    } else if (users.length === 1) {
      setDisplayText(`${users[0].name} est en train d'écrire...`)
    } else if (users.length === 2) {
      setDisplayText(`${users[0].name} et ${users[1].name} sont en train d'écrire...`)
    } else {
      setDisplayText(`${users.length} personnes sont en train d'écrire...`)
    }
  }, [users])

  if (users.length === 0) return null

  return (
    <div className="flex items-center gap-1 text-primary animate-pulse">
      <span>{displayText}</span>
    </div>
  )
}
