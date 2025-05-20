"use client"

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { useOnboarding } from '@/lib/stores/onboarding'
import { usePathname, useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { PointerAnimation } from './pointer-animation'

export function OnboardingOverlay() {
  const pathname = usePathname()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [showPointer, setShowPointer] = useState(true)
  
  const {
    isActive,
    currentStep,
    currentPage,
    steps,
    nextStep,
    previousStep,
    skipTour,
  } = useOnboarding()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (isActive && currentPage !== pathname) {
      router.push(currentPage)
    }
  }, [isActive, currentPage, pathname, router])

  // Reset pointer animation on step change
  useEffect(() => {
    setShowPointer(true)
    const timer = setTimeout(() => setShowPointer(false), 2000)
    return () => clearTimeout(timer)
  }, [currentStep, currentPage])

  if (!mounted || !isActive) return null

  const currentPageSteps = steps[currentPage] || []
  const step = currentPageSteps[currentStep]
  
  if (!step) return null

  const targetElement = document.querySelector(step.element)
  if (!targetElement) return null

  const rect = targetElement.getBoundingClientRect()
  const padding = 8

  // Make only the target element clickable
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (!targetElement.contains(e.target as Node)) {
      e.preventDefault()
      e.stopPropagation()
    }
  }

  return (
    <>
      {/* Clickable overlay */}
      <div 
        className="fixed inset-0 bg-transparent z-50"
        onClick={handleOverlayClick}
      />
      
      {/* Visual overlay */}
      <div className="fixed inset-0 bg-black/50 z-50 pointer-events-none" />
      
      {/* Highlight cutout */}
      <motion.div
        className="fixed inset-0 pointer-events-none z-50"
        initial={false}
        animate={{
          clipPath: `polygon(
            0% 0%,
            0% 100%,
            ${rect.left - padding}px 100%,
            ${rect.left - padding}px ${rect.top - padding}px,
            ${rect.right + padding}px ${rect.top - padding}px,
            ${rect.right + padding}px ${rect.bottom + padding}px,
            ${rect.left - padding}px ${rect.bottom + padding}px,
            ${rect.left - padding}px 100%,
            100% 100%,
            100% 0%
          )`
        }}
        transition={{ duration: 0.3 }}
      >
        <div className="absolute inset-0 bg-black/50" />
      </motion.div>

      {/* Pointer Animation */}
      <AnimatePresence>
        {showPointer && <PointerAnimation targetRect={rect} />}
      </AnimatePresence>

      {/* Tooltip */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed z-50 bg-white rounded-lg shadow-lg p-6 max-w-md"
          style={{
            left: rect.left + rect.width / 2,
            top: step.position === 'bottom' ? rect.bottom + padding + 8 : rect.top - padding - 8,
            transform: 'translateX(-50%)'
          }}
        >
          <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
          <p className="text-muted-foreground mb-4">{step.description}</p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={previousStep}
                disabled={currentStep === 0 && currentPage === '/'}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={nextStep}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={skipTour}
            >
              <X className="h-4 w-4" />
              Skip Tour
            </Button>
          </div>

          {/* Step progress */}
          <div className="absolute bottom-0 left-0 w-full h-1 bg-muted overflow-hidden rounded-b-lg">
            <motion.div
              className="h-full bg-primary"
              initial={{ width: "0%" }}
              animate={{ width: `${((currentStep + 1) / currentPageSteps.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Completion Animation */}
      <AnimatePresence>
        {currentStep === currentPageSteps.length - 1 && currentPage === Object.keys(steps).slice(-1)[0] && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80"
          >
            <motion.div
              className="bg-white rounded-lg p-8 text-center max-w-md"
              initial={{ y: 50 }}
              animate={{ y: 0 }}
            >
              <h2 className="text-2xl font-bold mb-4">🎉 You're All Set!</h2>
              <p className="text-muted-foreground mb-6">
                You've completed the tour! Feel free to explore IndieTracker on your own now.
              </p>
              <Button onClick={skipTour}>Start Using IndieTracker</Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}