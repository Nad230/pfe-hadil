"use client"

import { useCallback } from "react"

export function useChatAnimations() {
  const animateMessage = useCallback((messageId: string) => {
    // Find the message element by data attribute
    setTimeout(() => {
      const element = document.querySelector(`[data-message-id="${messageId}"]`)
      if (!element) return

      // Add a highlight animation
      element.classList.add("animate-pulse-once")

      // Remove the animation class after it completes
      setTimeout(() => {
        element.classList.remove("animate-pulse-once")
      }, 1000)
    }, 100)
  }, [])

  const animateReaction = useCallback((messageId: string, reactionType: string) => {
    // Find the message element
    setTimeout(() => {
      const element = document.querySelector(`[data-message-id="${messageId}"]`)
      if (!element) return

      // Create a temporary reaction animation element
      const reactionElement = document.createElement("div")
      reactionElement.className = "absolute z-10 animate-float-up"

      // Set the emoji based on reaction type
      let emoji = "👍"
      switch (reactionType) {
        case "LIKE":
          emoji = "👍"
          break
        case "LOVE":
          emoji = "❤️"
          break
        case "LAUGH":
          emoji = "😂"
          break
        case "SAD":
          emoji = "😢"
          break
        case "ANGRY":
          emoji = "😡"
          break
      }

      reactionElement.textContent = emoji
      reactionElement.style.fontSize = "24px"

      // Position the element
      const rect = element.getBoundingClientRect()
      reactionElement.style.position = "absolute"
      reactionElement.style.left = `${rect.left + rect.width / 2}px`
      reactionElement.style.top = `${rect.top}px`

      // Add to DOM
      document.body.appendChild(reactionElement)

      // Remove after animation completes
      setTimeout(() => {
        document.body.removeChild(reactionElement)
      }, 1000)
    }, 100)
  }, [])

  return { animateMessage, animateReaction }
}
