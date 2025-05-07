"use client"

import { useState } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { Sparkles, Music, ChevronLeft, ChevronRight, Loader2, Clock } from "lucide-react"
import Confetti from 'react-confetti'
import Cookies from "js-cookie";

interface CreateProjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type Step = 'name' | 'vibe' | 'purpose' | 'vision' | 'firstMove' | 'theme' | 'frequency' | 'spirit'

const vibes = [
  { value: 'chill', label: 'Chill', emoji: '🌴', color: 'bg-blue-100 dark:bg-blue-900' },
  { value: 'hustle', label: 'Hustle Mode', emoji: '🚀', color: 'bg-purple-100 dark:bg-purple-900' },
  { value: 'passion', label: 'Passion Project', emoji: '❤️', color: 'bg-red-100 dark:bg-red-900' },
  { value: 'money', label: 'Money Maker', emoji: '💰', color: 'bg-green-100 dark:bg-green-900' }
]

const purposes = [
  { value: 'fun', label: 'For Fun', emoji: '🎮', color: 'bg-pink-100 dark:bg-pink-900' },
  { value: 'money', label: 'For Money', emoji: '💸', color: 'bg-green-100 dark:bg-green-900' },
  { value: 'learn', label: 'To Learn', emoji: '📚', color: 'bg-blue-100 dark:bg-blue-900' },
  { value: 'challenge', label: 'Challenge Myself', emoji: '🏋️‍♂️', color: 'bg-purple-100 dark:bg-purple-900' },
  { value: 'must', label: 'Because I Must!', emoji: '⚡', color: 'bg-yellow-100 dark:bg-yellow-900' }
]

const goals = [
  { value: 'freedom', label: 'Financial Freedom', emoji: '🗽', color: 'bg-green-100 dark:bg-green-900' },
  { value: 'skills', label: 'New Skills', emoji: '🎯', color: 'bg-blue-100 dark:bg-blue-900' },
  { value: 'community', label: 'Build Community', emoji: '🤝', color: 'bg-purple-100 dark:bg-purple-900' },
  { value: 'impact', label: 'Make an Impact', emoji: '🌍', color: 'bg-orange-100 dark:bg-orange-900' }
]

const frequencies = [
  { value: 'daily', label: 'Daily Grind', emoji: '📅', color: 'bg-blue-100 dark:bg-blue-900' },
  { value: 'weekly', label: 'Weekly Check-in', emoji: '🗓️', color: 'bg-purple-100 dark:bg-purple-900' },
  { value: 'flexible', label: 'When I Feel It', emoji: '🌊', color: 'bg-teal-100 dark:bg-teal-900' }
]

const spirits = [
  { value: 'fox', label: 'Fox (Clever & Fast)', emoji: '🦊', color: 'bg-orange-100 dark:bg-orange-900' },
  { value: 'turtle', label: 'Turtle (Slow & Steady)', emoji: '🐢', color: 'bg-green-100 dark:bg-green-900' },
  { value: 'owl', label: 'Owl (Wise & Strategic)', emoji: '🦉', color: 'bg-purple-100 dark:bg-purple-900' },
  { value: 'wolf', label: 'Wolf (Bold & Determined)', emoji: '🐺', color: 'bg-blue-100 dark:bg-blue-900' }
]

const steps: Step[] = ['name', 'vibe', 'purpose', 'vision', 'firstMove', 'theme', 'frequency', 'spirit']

export function CreateProjectDialog({ open, onOpenChange }: CreateProjectDialogProps) {
  const [step, setStep] = useState<Step>('name')
  const [showConfetti, setShowConfetti] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    vibe: '',
    purpose: '',
    vision: '',
    firstMove: '',
    theme: '',
    frequency: '',
    spirit: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const currentStepIndex = steps.indexOf(step)
  const progress = ((currentStepIndex + 1) / steps.length) * 100

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setStep(steps[currentStepIndex + 1])
    } else {
      handleSubmit()
    }
  }

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setStep(steps[currentStepIndex - 1])
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const token = Cookies.get("token");

      const response = await fetch("http://localhost:3000/academic/project", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,

        },
        body: JSON.stringify(formData),
      })
  
      if (!response.ok) {
        throw new Error("Failed to create project")
      }
  
      setShowConfetti(true)
      await new Promise(resolve => setTimeout(resolve, 1500))
  
      onOpenChange(false)
      setFormData({
        name: '',
        vibe: '',
        purpose: '',
        vision: '',
        firstMove: '',
        theme: '',
        frequency: '',
        spirit: ''
      })
      setStep('name')
    } catch (error) {
      console.error("Error submitting project:", error)
      alert("There was an error submitting your project. Please try again.")
    } finally {
      setIsSubmitting(false)
      setTimeout(() => setShowConfetti(false), 1000)
    }
  }
  

  const renderStep = () => {
    const commonClasses = "w-full transition-all duration-300"

    switch (step) {
      case 'name':
        return (
          <div className={commonClasses}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-purple-500" />
                <h2 className="text-2xl font-bold">What's your next masterpiece called?</h2>
              </div>
              <p className="text-muted-foreground">Give your project a name that inspires you.</p>
              <Input
                value={formData.name}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder="e.g., Dream Canvas, Project Phoenix"
                className="text-lg p-6 rounded-xl shadow-sm"
                autoFocus
              />
            </motion.div>
          </div>
        )

      case 'vibe':
        return (
          <div className={commonClasses}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <h2 className="text-2xl font-bold">What's the vibe of this project?</h2>
              <p className="text-muted-foreground">Choose the energy that matches your vision.</p>
              <div className="grid grid-cols-2 gap-4">
                {vibes.map((vibe) => (
                  <motion.div
                    key={vibe.value}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div
                      className={cn(
                        "flex flex-col items-center p-6 rounded-xl cursor-pointer transition-all text-center",
                        formData.vibe === vibe.value
                          ? "bg-primary/10 border-2 border-primary shadow-lg"
                          : cn("hover:bg-muted/80 border-2 border-transparent", vibe.color)
                      )}
                      onClick={() => updateField('vibe', vibe.value)}
                    >
                      <span className="text-4xl mb-2">{vibe.emoji}</span>
                      <span className="font-medium">{vibe.label}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        )

      case 'purpose':
        return (
          <div className={commonClasses}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <h2 className="text-2xl font-bold">Why are you doing this?</h2>
              <p className="text-muted-foreground">What's driving you to create this project?</p>
              <div className="grid gap-4">
                {purposes.map((purpose) => (
                  <motion.div
                    key={purpose.value}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div
                      className={cn(
                        "flex items-center p-6 rounded-xl cursor-pointer transition-all",
                        formData.purpose === purpose.value
                          ? "bg-primary/10 border-2 border-primary shadow-lg"
                          : cn("hover:bg-muted/80 border-2 border-transparent", purpose.color)
                      )}
                      onClick={() => updateField('purpose', purpose.value)}
                    >
                      <span className="text-4xl mr-4">{purpose.emoji}</span>
                      <span className="font-medium">{purpose.label}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        )

      case 'vision':
        return (
          <div className={commonClasses}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <h2 className="text-2xl font-bold">Where do you want this project to take you?</h2>
              <p className="text-muted-foreground">Choose your ultimate goal or dream outcome.</p>
              <div className="grid grid-cols-2 gap-4">
                {goals.map((goal) => (
                  <motion.div
                    key={goal.value}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div
                      className={cn(
                        "flex flex-col items-center p-6 rounded-xl cursor-pointer transition-all text-center",
                        formData.vision === goal.value
                          ? "bg-primary/10 border-2 border-primary shadow-lg"
                          : cn("hover:bg-muted/80 border-2 border-transparent", goal.color)
                      )}
                      onClick={() => updateField('vision', goal.value)}
                    >
                      <span className="text-4xl mb-2">{goal.emoji}</span>
                      <span className="font-medium">{goal.label}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        )

      case 'firstMove':
        return (
          <div className={commonClasses}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <h2 className="text-2xl font-bold">What's your first bold move?</h2>
              <p className="text-muted-foreground">Write down the first action you'll take to get started.</p>
              <Textarea
                value={formData.firstMove}
                onChange={(e) => updateField('firstMove', e.target.value)}
                placeholder="e.g., Create project roadmap, Research competitors..."
                className="min-h-[150px] p-4 rounded-xl text-lg"
              />
            </motion.div>
          </div>
        )

      case 'theme':
        return (
          <div className={commonClasses}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2">
                <Music className="h-6 w-6 text-purple-500" />
                <h2 className="text-2xl font-bold">If this project had a theme song...</h2>
              </div>
              <p className="text-muted-foreground">What music captures the spirit of your project?</p>
              <Input
                value={formData.theme}
                onChange={(e) => updateField('theme', e.target.value)}
                placeholder="e.g., Eye of the Tiger, Started from the Bottom..."
                className="text-lg p-6 rounded-xl shadow-sm"
              />
            </motion.div>
          </div>
        )

      case 'frequency':
        return (
          <div className={commonClasses}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <h2 className="text-2xl font-bold">How often do you want to check in?</h2>
              <p className="text-muted-foreground">Choose your ideal rhythm for this project.</p>
              <div className="grid gap-4">
                {frequencies.map((freq) => (
                  <motion.div
                    key={freq.value}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div
                      className={cn(
                        "flex items-center p-6 rounded-xl cursor-pointer transition-all",
                        formData.frequency === freq.value
                          ? "bg-primary/10 border-2 border-primary shadow-lg"
                          : cn("hover:bg-muted/80 border-2 border-transparent", freq.color)
                      )}
                      onClick={() => updateField('frequency', freq.value)}
                    >
                      <span className="text-4xl mr-4">{freq.emoji}</span>
                      <span className="font-medium">{freq.label}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        )

      case 'spirit':
        return (
          <div className={commonClasses}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <h2 className="text-2xl font-bold">Pick your project's spirit animal</h2>
              <p className="text-muted-foreground">Which creature best represents your project's style?</p>
              <div className="grid grid-cols-2 gap-4">
                {spirits.map((spirit) => (
                  <motion.div
                    key={spirit.value}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div
                      className={cn(
                        "flex flex-col items-center p-6 rounded-xl cursor-pointer transition-all text-center",
                        formData.spirit === spirit.value
                          ? "bg-primary/10 border-2 border-primary shadow-lg"
                          : cn("hover:bg-muted/80 border-2 border-transparent", spirit.color)
                      )}
                      onClick={() => updateField('spirit', spirit.value)}
                    >
                      <span className="text-4xl mb-2">{spirit.emoji}</span>
                      <span className="font-medium">{spirit.label}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        )
    }
  }

  return (
    <>
      {showConfetti && <Confetti />}
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px] p-0">
          <div className="p-6 space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-sm">
                  <Clock className="h-4 w-4 text-primary" />
                  <span>Step {currentStepIndex + 1} of {steps.length}</span>
                </div>
                <Progress value={progress} className="w-[100px]" />
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {renderStep()}
              </motion.div>
            </AnimatePresence>

            <div className="flex items-center justify-between pt-4">
              <Button
                variant="ghost"
                onClick={handleBack}
                disabled={currentStepIndex === 0}
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back
              </Button>

              <Button
                onClick={handleNext}
                disabled={
                  (step === 'name' && !formData.name) ||
                  isSubmitting
                }
                className="min-w-[100px]"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : step === 'spirit' ? (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Launch Project
                  </>
                ) : (
                  <>
                    Continue
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}