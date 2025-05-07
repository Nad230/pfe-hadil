"use client"

import { useState, useEffect } from "react"
import Lottie from "lottie-react"
import { motion, AnimatePresence } from "framer-motion"
import { animations, MascotMood } from "./animations"

interface MascotProps {
  mood?: MascotMood
  message?: string
  className?: string
}

export function Mascot({ 
  mood = "idle",
  message,
  className = ""
}: MascotProps) {
  const [currentMood, setCurrentMood] = useState<MascotMood>(mood)
  const [isMessageVisible, setIsMessageVisible] = useState(false)

  useEffect(() => {
    setCurrentMood(mood)
    if (message) {
      setIsMessageVisible(true)
      const timer = setTimeout(() => setIsMessageVisible(false), 5000)
      return () => clearTimeout(timer)
    }
  }, [mood, message])

  return (
    <div className={`relative ${className}`}>
      <div className="w-32 h-32">
        <Lottie
          animationData={animations[currentMood]}
          loop={true}
          autoplay={true}
          className="w-full h-full"
          rendererSettings={{
            preserveAspectRatio: "xMidYMid slice"
          }}
        />
      </div>

      <AnimatePresence>
        {isMessageVisible && message && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.9 }}
            className="absolute -top-16 left-1/2 -translate-x-1/2 bg-white dark:bg-gray-800 rounded-lg px-4 py-2 shadow-lg"
          >
            <div className="relative">
              <p className="text-sm whitespace-nowrap">{message}</p>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-white dark:bg-gray-800 rotate-45" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}