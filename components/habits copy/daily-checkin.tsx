"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { X, Quote, CheckCircle, Calendar } from "lucide-react"
import { getEntrepreneurialQuote } from "@/lib/discipline"

interface DailyCheckinProps {
  onComplete?: () => void
}

export function DailyCheckin({ onComplete }: DailyCheckinProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [quote, setQuote] = useState({ quote: "", author: "" })

  useEffect(() => {
    // Vérifier si l'utilisateur s'est déjà connecté aujourd'hui
    const lastCheckin = localStorage.getItem("lastCheckin")
    const today = new Date().toISOString().split("T")[0]

    if (lastCheckin !== today) {
      // Attendre quelques secondes avant d'afficher le check-in
      const timer = setTimeout(() => {
        setIsOpen(true)
        setQuote(getEntrepreneurialQuote())
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [])

  const handleComplete = () => {
    // Enregistrer la date du check-in
    const today = new Date().toISOString().split("T")[0]
    localStorage.setItem("lastCheckin", today)

    // Fermer le modal
    setIsOpen(false)

    // Appeler le callback si fourni
    if (onComplete) {
      onComplete()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="w-full max-w-md"
          >
            <Card className="border-t-4 border-t-indigo-500">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center">
                    <Calendar className="mr-2 h-5 w-5 text-indigo-500" />
                    Daily Entrepreneurial Check-in
                  </CardTitle>
                  <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-8 w-8">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-4">
                  <div className="flex items-start">
                    <Quote className="h-5 w-5 text-indigo-500 mr-2 mt-1 flex-shrink-0" />
                    <div>
                      <p className="italic text-gray-700 dark:text-gray-300">{quote.quote}</p>
                      <p className="text-right text-sm text-gray-500 mt-2">— {quote.author}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Welcome to your daily entrepreneurial check-in! Take a moment to reflect on your goals and habits
                    for today.
                  </p>

                  <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-lg">
                    <h3 className="font-medium text-indigo-700 dark:text-indigo-300 mb-1">Today's Focus</h3>
                    <p className="text-sm text-indigo-600 dark:text-indigo-400">
                      Remember that consistency is the key to building successful entrepreneurial habits. What's your
                      main focus today?
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  Remind me later
                </Button>
                <Button onClick={handleComplete} className="bg-indigo-600 hover:bg-indigo-700">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Start my day
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
