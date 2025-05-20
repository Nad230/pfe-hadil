"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"
import { Crown } from "lucide-react"
import confetti from "canvas-confetti"

interface EndOfDayStats {
  hoursWorked: string
  totalSales: number
  totalExpenses: number
  netProfit: number
  bestSeller: {
    name: string
    quantity: number
  }
  performance: {
    percentage: number
    trend: "up" | "down"
  }
}

interface EndOfDayReportProps {
  stats: EndOfDayStats
  userName: string
}

export function EndOfDayReport({ stats, userName }: EndOfDayReportProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isWriting, setIsWriting] = useState(false)

  const handleOpen = () => {
    setIsOpen(true)
    setTimeout(() => {
      setIsWriting(true)
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      })
    }, 1000)
  }

  const scrollVariants = {
    closed: {
      height: 0,
      opacity: 0,
    },
    open: {
      height: "auto",
      opacity: 1,
      transition: {
        duration: 1,
        ease: [0.4, 0, 0.2, 1],
      }
    }
  }

  const textVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5,
      }
    }
  }

  const textContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 1
      }
    }
  }

  return (
    <div className="relative">
      {!isOpen ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <Button
            size="lg"
            onClick={handleOpen}
            className="bg-gradient-to-r from-amber-500 to-purple-600 text-white hover:from-amber-600 hover:to-purple-700"
          >
            <Crown className="mr-2 h-5 w-5" />
            End My Workday
          </Button>
        </motion.div>
      ) : (
        <AnimatePresence>
          <motion.div
            className="relative max-w-2xl mx-auto"
            initial="closed"
            animate="open"
            exit="closed"
          >
            <motion.div
              variants={scrollVariants}
              className="relative bg-[url('https://images.unsplash.com/photo-1524364892822-dda3df70e991?w=800&q=80')] bg-cover bg-center rounded-lg overflow-hidden"
            >
              {/* Decorative edges */}
              <div className="absolute top-0 left-0 w-full h-12 bg-gradient-to-b from-amber-800/20 to-transparent" />
              <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-amber-800/20 to-transparent" />
              
              <div className="p-8 min-h-[600px] bg-amber-50/95 dark:bg-amber-950/95">
                <motion.div
                  variants={textContainer}
                  initial="hidden"
                  animate={isWriting ? "visible" : "hidden"}
                  className="space-y-8 font-serif"
                >
                  {/* Header */}
                  <motion.div variants={textVariants} className="text-center space-y-4">
                    <h2 className="text-3xl font-bold text-amber-900 dark:text-amber-100">
                      📜 Royal Decree 📜
                    </h2>
                    <p className="text-lg text-amber-800 dark:text-amber-200">
                      On this fine day of {new Date().toLocaleDateString()}
                    </p>
                  </motion.div>

                  {/* Greeting */}
                  <motion.div variants={textVariants} className="text-center italic text-amber-800 dark:text-amber-200">
                    To our esteemed proprietor, {userName}
                  </motion.div>

                  {/* Stats */}
                  <motion.div variants={textVariants} className="space-y-4 text-amber-900 dark:text-amber-100">
                    <p className="leading-relaxed">
                      Let it be known that on this day, you have served the realm for{" "}
                      <span className="font-bold">{stats.hoursWorked}</span>, during which time:
                    </p>
                    
                    <ul className="space-y-2 pl-6 list-disc">
                      <li>
                        Your establishment amassed <span className="font-bold">{formatCurrency(stats.totalSales)}</span> in royal treasury
                      </li>
                      <li>
                        The kingdom's expenses totaled <span className="font-bold">{formatCurrency(stats.totalExpenses)}</span>
                      </li>
                      <li>
                        Leaving a noble profit of <span className="font-bold">{formatCurrency(stats.netProfit)}</span>
                      </li>
                      <li>
                        Your finest offering, the <span className="font-bold">{stats.bestSeller.name}</span>, was requested{" "}
                        <span className="font-bold">{stats.bestSeller.quantity}</span> times by your loyal patrons
                      </li>
                    </ul>
                  </motion.div>

                  {/* Royal Assessment */}
                  <motion.div variants={textVariants} className="space-y-4">
                    <h3 className="text-xl font-bold text-center text-amber-900 dark:text-amber-100">
                      🏰 Royal Assessment 🏰
                    </h3>
                    <p className="text-amber-800 dark:text-amber-200 italic text-center">
                      "Hark! Your establishment's performance shows a{" "}
                      <span className="font-bold">
                        {stats.performance.percentage}% {stats.performance.trend === "up" ? "rise" : "fall"}
                      </span>{" "}
                      compared to yesterdays endeavors. {stats.performance.trend === "up" ? "Most impressive!" : "Fear not, tomorrow brings new opportunities!"}
                    </p>
                  </motion.div>

                  {/* Seal */}
                  <motion.div variants={textVariants} className="flex justify-center pt-4">
                    <div className="w-24 h-24 rounded-full bg-red-800 flex items-center justify-center text-white text-3xl border-4 border-amber-900 shadow-lg">
                      👑
                    </div>
                  </motion.div>

                  {/* Actions */}
                  <motion.div variants={textVariants} className="flex justify-center gap-4 pt-4">
                    <Button variant="outline" onClick={() => setIsOpen(false)}>
                      Roll Up Scroll
                    </Button>
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  )
}