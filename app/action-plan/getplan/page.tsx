"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sparkles } from "lucide-react"
import confetti from "canvas-confetti"
import { useRouter } from "next/navigation"
import Cookies from "js-cookie"
import { toast } from "sonner"

export default function ActionPlanPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleReveal = async () => {
    try {
      setIsLoading(true)
      setError("")
      
      // Trigger confetti animation
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      })

      // Call the plan advice API
      const token = Cookies.get("token")
      const response = await fetch(
        "http://localhost:3000/project-offline-ai/plandvice",
        {
          method: "POST",
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )

      if (!response.ok) throw new Error('Failed to generate action plan')

      // Navigate to action plan page
      router.push("/action-plan")
    } catch (error) {
      console.error("Error generating action plan:", error)
      setError("Failed to generate action plan. Please try again.")
      toast.error("Failed to generate action plan")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500/5 via-blue-500/5 to-pink-500/5">
      <div className="container max-w-4xl mx-auto py-12 px-4 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <h1 className="text-4xl font-bold tracking-tight">
            Your Business Adventure Starts Here ✨
          </h1>
          <p className="text-muted-foreground text-lg">
            We've crafted a magical plan just for you. Ready to begin?
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <Button
            size="lg"
            className="relative group"
            onClick={handleReveal}
            disabled={isLoading}
          >
            <motion.div
              className="absolute inset-0 rounded-md bg-gradient-to-r from-purple-500/50 to-pink-500/50 opacity-0 group-hover:opacity-100 transition-opacity"
              animate={{
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
            />
            <span className="relative flex items-center gap-2">
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  Generating Plan...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  Reveal Your Action Plan
                </>
              )}
            </span>
          </Button>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-500 text-sm"
            >
              {error}
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  )
}