"use client"

import type React from "react"

import { useEffect, useRef } from "react"
import { useTheme } from "@/lib/utils/theme-context"
import { motion } from "framer-motion"

interface AnimatedBackgroundProps {
  children: React.ReactNode
}

export default function AnimatedBackground({ children }: AnimatedBackgroundProps) {
  const { themeName, themeColor, themeSecondary, themeAccent, timeOfDay, mood } = useTheme()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Animation for background elements
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    // Create particles based on theme
    const particles: {
      x: number
      y: number
      size: number
      speedX: number
      speedY: number
      color: string
      opacity: number
    }[] = []

    const particleCount = mood === "energetic" ? 100 : mood === "calm" ? 30 : 50

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 5 + 1,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
        color: [themeColor, themeSecondary, themeAccent][Math.floor(Math.random() * 3)],
        opacity: Math.random() * 0.5 + 0.1,
      })
    }

    // Animation loop
    let animationFrameId: number

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw particles
      particles.forEach((particle) => {
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fillStyle =
          particle.color +
          Math.floor(particle.opacity * 255)
            .toString(16)
            .padStart(2, "0")
        ctx.fill()

        // Update position
        particle.x += particle.speedX
        particle.y += particle.speedY

        // Wrap around edges
        if (particle.x < 0) particle.x = canvas.width
        if (particle.x > canvas.width) particle.x = 0
        if (particle.y < 0) particle.y = canvas.height
        if (particle.y > canvas.height) particle.y = 0
      })

      // Draw special effects based on time of day
      if (timeOfDay === "dawn" || timeOfDay === "evening") {
        // Draw sun/sunset gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
        if (timeOfDay === "dawn") {
          gradient.addColorStop(0, "rgba(255, 166, 0, 0.2)")
          gradient.addColorStop(1, "rgba(255, 255, 255, 0)")
        } else {
          gradient.addColorStop(0, "rgba(138, 43, 226, 0.2)")
          gradient.addColorStop(1, "rgba(255, 255, 255, 0)")
        }

        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      }

      if (timeOfDay === "night") {
        // Draw stars
        for (let i = 0; i < 50; i++) {
          const x = Math.random() * canvas.width
          const y = (Math.random() * canvas.height) / 2
          const size = Math.random() * 2

          ctx.beginPath()
          ctx.arc(x, y, size, 0, Math.PI * 2)
          ctx.fillStyle = "rgba(255, 255, 255, " + (Math.random() * 0.5 + 0.5) + ")"
          ctx.fill()
        }
      }

      animationFrameId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      cancelAnimationFrame(animationFrameId)
    }
  }, [themeColor, themeSecondary, themeAccent, timeOfDay, mood])

  return (
    <div className="relative w-full h-full overflow-hidden">
      <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full pointer-events-none z-0" />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full h-full"
      >
        {children}
      </motion.div>
    </div>
  )
}
