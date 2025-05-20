import { motion } from 'framer-motion'

interface PointerAnimationProps {
  targetRect: DOMRect
}

export function PointerAnimation({ targetRect }: PointerAnimationProps) {
  return (
    <motion.div
      className="fixed z-[51] pointer-events-none"
      initial={{ 
        x: targetRect.left - 50,
        y: targetRect.top + targetRect.height + 50,
        opacity: 0 
      }}
      animate={{
        x: targetRect.left + targetRect.width / 2,
        y: targetRect.top + targetRect.height / 2,
        opacity: 1
      }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1, ease: "easeInOut" }}
    >
      <motion.div
        className="w-8 h-8 bg-primary rounded-full"
        initial={{ scale: 1 }}
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 1, repeat: Infinity }}
      />
    </motion.div>
  )
}