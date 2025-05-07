"use client"

import { motion } from 'framer-motion'
import { MascotMood } from '@/lib/stores/mascot-store'

interface MascotMessageProps {
  message: string
  mood: MascotMood
}

export function MascotMessage({ message, mood }: MascotMessageProps) {
  const moodStyles = {
    idle: 'bg-gray-100 text-gray-900',
    happy: 'bg-green-100 text-green-900',
    error: 'bg-red-100 text-red-900',
    teaching: 'bg-blue-100 text-blue-900',
    sleeping: 'bg-purple-100 text-purple-900',
    celebrating: 'bg-yellow-100 text-yellow-900',
  }

  return (
    <motion.div
      className={`absolute -top-16 right-0 p-3 rounded-lg shadow-lg ${moodStyles[mood]} max-w-[200px]`}
      initial={{ opacity: 0, y: 20, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.8 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
    >
      <div className="text-sm font-medium">{message}</div>
      <div 
        className={`absolute -bottom-2 right-4 w-4 h-4 transform rotate-45 ${moodStyles[mood]}`}
      />
    </motion.div>
  )
}