"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface MascotContainerProps {
  children: React.ReactNode
  className?: string
  isFloating?: boolean
}

export function MascotContainer({ 
  children, 
  className,
  isFloating = true 
}: MascotContainerProps) {
  return (
    <motion.div
      className={cn(
        "fixed bottom-4 right-4 z-50",
        className
      )}
      initial={{ opacity: 0, scale: 0.5, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{
        duration: 0.3,
        ease: [0, 0.71, 0.2, 1.01]
      }}
    >
      <motion.div
        animate={isFloating ? {
          y: [0, -10, 0],
        } : {}}
        transition={isFloating ? {
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        } : {}}
      >
        {children}
      </motion.div>
    </motion.div>
  )
}