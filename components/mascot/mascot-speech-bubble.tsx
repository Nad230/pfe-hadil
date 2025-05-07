"use client"

import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

interface MascotSpeechBubbleProps {
  message?: string
  isVisible?: boolean
  className?: string
}

export function MascotSpeechBubble({ 
  message, 
  isVisible = true,
  className 
}: MascotSpeechBubbleProps) {
  return (
    <AnimatePresence>
      {isVisible && message && (
        <motion.div
          className={cn(
            "absolute bottom-full right-0 mb-4 max-w-[240px]",
            "bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg",
            "before:content-[''] before:absolute before:bottom-[-8px] before:right-6",
            "before:border-l-[8px] before:border-l-transparent",
            "before:border-t-[8px] before:border-t-white dark:before:border-t-gray-800",
            "before:border-r-[8px] before:border-r-transparent",
            className
          )}
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 10 }}
          transition={{
            duration: 0.2,
            ease: "easeOut"
          }}
        >
          <p className="text-sm">{message}</p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}