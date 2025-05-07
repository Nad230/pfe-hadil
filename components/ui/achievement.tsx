"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Trophy } from "lucide-react"

interface AchievementProps {
  show: boolean
  title: string
  description: string
  onClose: () => void
}

export function Achievement({ show, title, description, onClose }: AchievementProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 50 }}
          className="fixed bottom-8 right-8 z-50"
          onAnimationComplete={() => {
            setTimeout(onClose, 5000) // Auto close after 5 seconds
          }}
        >
          <div className="bg-gradient-to-r from-amber-500/90 to-yellow-500/90 backdrop-blur-sm p-6 rounded-lg shadow-2xl flex items-center gap-4 text-white min-w-[320px] relative overflow-hidden">
            {/* Background glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-yellow-400 opacity-20 animate-pulse" />
            
            {/* Trophy icon with animation */}
            <motion.div
              initial={{ rotate: -15 }}
              animate={{ rotate: 15 }}
              transition={{
                repeat: Infinity,
                repeatType: "reverse",
                duration: 1,
                ease: "easeInOut"
              }}
              className="relative"
            >
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2,
                  ease: "easeInOut"
                }}
              >
                <Trophy className="w-12 h-12 text-yellow-100" />
              </motion.div>
              
              {/* Sparkles */}
              <motion.div
                className="absolute -inset-1"
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0.8, 1.2, 0.8],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2,
                  ease: "easeInOut"
                }}
              >
                <div className="absolute top-0 left-1/2 w-1 h-1 bg-yellow-200 rounded-full" />
                <div className="absolute bottom-0 left-1/2 w-1 h-1 bg-yellow-200 rounded-full" />
                <div className="absolute top-1/2 left-0 w-1 h-1 bg-yellow-200 rounded-full" />
                <div className="absolute top-1/2 right-0 w-1 h-1 bg-yellow-200 rounded-full" />
              </motion.div>
            </motion.div>

            <div className="relative">
              <motion.h3
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="font-bold text-lg"
              >
                {title}
              </motion.h3>
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-sm text-yellow-100"
              >
                {description}
              </motion.p>
            </div>

            {/* Progress bar */}
            <motion.div
              className="absolute bottom-0 left-0 h-1 bg-yellow-200/30"
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: 5, ease: "linear" }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}