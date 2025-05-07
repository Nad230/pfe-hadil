"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { useOnboarding } from "../onboarding-context"
import { useRouter } from "next/navigation"
import confetti from "canvas-confetti"
import { useEffect } from "react"

interface CelebrationStepProps {
  isLastStep: boolean
}

export function CelebrationStep({ isLastStep }: CelebrationStepProps) {
  const router = useRouter()
  const { data } = useOnboarding()

  useEffect(() => {
    if (isLastStep) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      })
    }
  }, [isLastStep])

  return (
    <Card>
      <CardContent className="pt-6 space-y-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, type: "spring" }}
          className="w-24 h-24 mx-auto bg-primary/10 rounded-full flex items-center justify-center"
        >
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 10, -10, 0]
            }}
            transition={{ 
              duration: 1,
              repeat: Infinity,
              repeatDelay: 1
            }}
            className="text-4xl"
          >
            🚀
          </motion.div>
        </motion.div>

        <div className="text-center space-y-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold tracking-tight"
          >
            Awesome, {data.name}! You're ready to take your business to the next level
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground"
          >
            Let's jump into your dashboard. I'll be here to help along the way!
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex justify-center"
        >
          <Button 
            size="lg"
            className="group"
            onClick={() => router.push("/dashboard")}
          >
            Start My Journey
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </motion.div>
      </CardContent>
    </Card>
  )
}