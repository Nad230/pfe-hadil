"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Bot } from "lucide-react"
import { useEffect, useState } from "react"
import { Howl } from "howler"

interface WelcomeScreenProps {
  onContinue: () => void
}

export function WelcomeScreen({ onContinue }: WelcomeScreenProps) {
  const [isTyping, setIsTyping] = useState(true)
  const welcomeText = "Hey there, future innovator 👋\nBefore we set things up, tell me who you are!"
  const [displayText, setDisplayText] = useState("")

  useEffect(() => {
    let currentText = ""
    let currentIndex = 0

    const sound = new Howl({
      src: ["/sounds/typing.mp3"],
      volume: 0.2,
      sprite: {
        type: [0, 100]
      }
    })

    const typeInterval = setInterval(() => {
      if (currentIndex < welcomeText.length) {
        currentText += welcomeText[currentIndex]
        setDisplayText(currentText)
        currentIndex++
        sound.play("type")
      } else {
        setIsTyping(false)
        clearInterval(typeInterval)
      }
    }, 50)

    return () => clearInterval(typeInterval)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="min-h-screen flex items-center justify-center p-4"
    >
      <div className="max-w-2xl w-full space-y-8">
        <motion.div
          animate={{
            scale: [1, 1.02, 1],
            transition: { duration: 2, repeat: Infinity }
          }}
          className="relative w-24 h-24 mx-auto"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-20 animate-pulse" />
          <div className="relative flex items-center justify-center w-full h-full bg-white dark:bg-gray-900 rounded-full shadow-xl">
            <Bot className="w-12 h-12 text-blue-500" />
          </div>
        </motion.div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 space-y-6">
          <div className="min-h-[100px] whitespace-pre-line text-xl">
            {displayText}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isTyping ? 0 : 1 }}
            transition={{ delay: 0.5 }}
          >
            <Button
              onClick={onContinue}
              className="w-full text-lg py-6"
              size="lg"
              disabled={isTyping}
            >
              Let's Begin
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}