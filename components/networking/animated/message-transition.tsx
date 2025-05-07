"use client"

import type React from "react"
import { useEffect, useRef } from "react"
import { motion } from "framer-motion"

interface MessageTransitionProps {
  children: React.ReactNode
  id: string
  className?: string
}

export function MessageTransition({ children, id, className }: MessageTransitionProps) {
  const elementRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Add a data attribute to make the element targetable for animations
    if (elementRef.current) {
      elementRef.current.setAttribute("data-message-id", id)
    }
  }, [id])

  return (
    <motion.div
      ref={elementRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
