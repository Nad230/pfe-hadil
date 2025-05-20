"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { TypeAnimation } from "react-type-animation"

interface WelcomeStepProps {
  onNext: () => void
  isFirstStep: boolean
}

export function WelcomeStep({ onNext, isFirstStep }: WelcomeStepProps) {
  return (
    <Card className="relative overflow-hidden">
      <CardContent className="pt-6 space-y-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, type: "spring" }}
          className="w-24 h-24 mx-auto bg-primary/10 rounded-full flex items-center justify-center"
        >
          <motion.div
            animate={{ rotate: [0, 14, -8, 0] }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-4xl"
          >
            👋
          </motion.div>
        </motion.div>

        <div className="text-center space-y-4">
          <TypeAnimation
            sequence={[
              "Hey there! Welcome to IndieTracker.",
              1000,
              "Before we get you rolling, tell me a bit about you — in any language you like 😎",
            ]}
            wrapper="h2"
            speed={50}
            className="text-2xl font-bold tracking-tight"
            cursor={false}
          />
          <p className="text-muted-foreground">
            Let's set up your workspace in just a few steps.
          </p>
        </div>

        <div className="flex justify-center">
          <Button onClick={onNext} size="lg" className="group">
            Get Started
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(circle at 50% 0%, rgba(var(--primary-rgb), 0.1) 0%, transparent 50%)",
          }}
        />
      </CardContent>
    </Card>
  )
}