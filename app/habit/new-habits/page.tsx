"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Check, ArrowRight, Sparkles, Loader2 } from "lucide-react"
import { ErrorMessage } from "@/components/ui/error-message"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { CreateHabitDto } from "@/lib/types/habits"
import type { Goal } from "@/lib/types/habits"

export default function NewHabitPage() {
  const router = useRouter()
  const [formStep, setFormStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [goals, setGoals] = useState<Goal[]>([])
  const [isLoadingGoals, setIsLoadingGoals] = useState(false)

  const [formData, setFormData] = useState<CreateHabitDto>({
    name: "",
    description: "",
    type: "GoodHabit",
    weeklyTarget: 3,
    status: "NotStarted",
    goalId: undefined,
  })

  // Check authentication on component mount
  useEffect(() => {
    const token = localStorage.getItem("token") || localStorage.getItem("access_token")
    if (token) {
      setIsAuthenticated(true)
      fetchGoals()
    } else {
      setError("Authentication required. Please log in to create habits.")
    }
  }, [])

  const fetchGoals = async () => {
    setIsLoadingGoals(true)
    try {
      const token = localStorage.getItem("token") || localStorage.getItem("access_token")
      if (!token) {
        throw new Error("Authentication token not found")
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/goals`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch goals: ${response.status}`)
      }

      const data = await response.json()
      setGoals(data)
    } catch (err) {
      console.error("Error fetching goals:", err)
      // Don't show error to user, just log it
    } finally {
      setIsLoadingGoals(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleTypeChange = (value: "GoodHabit" | "BadHabit") => {
    setFormData((prev) => ({ ...prev, type: value }))
  }

  const handleTargetChange = (value: number[]) => {
    setFormData((prev) => ({ ...prev, weeklyTarget: value[0] }))
  }

  const handleGoalChange = (value: string) => {
    setFormData((prev) => ({ ...prev, goalId: value === "none" ? undefined : value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      // Get token from localStorage (try both possible token names)
      const token = localStorage.getItem("token") || localStorage.getItem("access_token")
      if (!token) {
        throw new Error("Authentication token not found. Please log in again.")
      }

      console.log("Creating new habit:", formData)
      console.log("Backend URL:", process.env.NEXT_PUBLIC_BACKEND_URL)

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/habits`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      // Try to parse response even if it's an error
      const responseData = await response.json().catch(() => null)
      console.log("Response status:", response.status)
      console.log("Response data:", responseData)

      if (!response.ok) {
        // Extract error message from response if available
        const errorMessage = responseData?.message || `Failed to create habit: ${response.status}`
        throw new Error(errorMessage)
      }

      // Show success toast
      toast.success("Habit created successfully!", {
        description: `${formData.name} has been added to your habits.`,
        action: {
          label: "View",
          onClick: () => router.push("/habit"),
        },
      })

      // Redirect to habits page
      router.push("/habit")
      router.refresh()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create habit"
      setError(errorMessage)
      console.error("Error creating habit:", err)

      toast.error("Error creating habit", {
        description: errorMessage,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const nextStep = () => setFormStep((prev) => prev + 1)
  const prevStep = () => setFormStep((prev) => prev - 1)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-4xl font-bold text-center mb-2">Create New Entrepreneurial Habit</h1>
          <p className="text-center text-gray-600 dark:text-gray-300 mb-8">
            Define a new habit to track and improve your entrepreneurial journey
          </p>

          {error && <ErrorMessage message={error} onRetry={() => setError(null)} />}

          <div className="max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              {[0, 1, 2, 3].map((step) => (
                <div key={step} className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      formStep >= step
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {formStep > step ? <Check className="w-5 h-5" /> : <span>{step + 1}</span>}
                  </div>
                  <span className="text-sm mt-2">
                    {step === 0 ? "Details" : step === 1 ? "Type" : step === 2 ? "Target" : "Goal"}
                  </span>
                </div>
              ))}
            </div>

            <Card className="border-none shadow-lg">
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit}>
                  {formStep === 0 && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-4"
                    >
                      <div className="space-y-2">
                        <Label htmlFor="name">Habit Name</Label>
                        <Input
                          id="name"
                          name="name"
                          placeholder="e.g., Morning Planning Session"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          className="h-12"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description">Description (Optional)</Label>
                        <Textarea
                          id="description"
                          name="description"
                          placeholder="Why is this habit important for your entrepreneurial journey?"
                          value={formData.description || ""}
                          onChange={handleInputChange}
                          className="min-h-[100px]"
                        />
                      </div>

                      <div className="pt-4 flex justify-end">
                        <Button
                          type="button"
                          onClick={nextStep}
                          className="bg-indigo-600 hover:bg-indigo-700"
                          disabled={!formData.name}
                        >
                          Next Step <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </motion.div>
                  )}

                  {formStep === 1 && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-6"
                    >
                      <div className="space-y-4">
                        <Label>Habit Type</Label>
                        <RadioGroup
                          value={formData.type}
                          onValueChange={handleTypeChange as (value: string) => void}
                          className="grid grid-cols-1 gap-4"
                        >
                          <div className="flex items-center space-x-2 border p-4 rounded-lg hover:border-indigo-500 cursor-pointer">
                            <RadioGroupItem value="GoodHabit" id="good" className="text-indigo-600" />
                            <Label htmlFor="good" className="flex-1 cursor-pointer">
                              <div className="font-medium">Good Habit</div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                A positive behavior you want to build in your entrepreneurial routine
                              </div>
                            </Label>
                          </div>

                          <div className="flex items-center space-x-2 border p-4 rounded-lg hover:border-indigo-500 cursor-pointer">
                            <RadioGroupItem value="BadHabit" id="bad" className="text-indigo-600" />
                            <Label htmlFor="bad" className="flex-1 cursor-pointer">
                              <div className="font-medium">Bad Habit</div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                A negative behavior you want to reduce or eliminate from your entrepreneurial routine
                              </div>
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>

                      <div className="pt-4 flex justify-between">
                        <Button type="button" variant="outline" onClick={prevStep}>
                          Back
                        </Button>
                        <Button type="button" onClick={nextStep} className="bg-indigo-600 hover:bg-indigo-700">
                          Next Step <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </motion.div>
                  )}

                  {formStep === 2 && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-6"
                    >
                      <div className="space-y-4">
                        <Label>Weekly Target</Label>
                        <div className="py-4">
                          <Slider
                            defaultValue={[formData.weeklyTarget || 3]}
                            max={7}
                            min={1}
                            step={1}
                            onValueChange={handleTargetChange}
                            className="py-4"
                          />
                          <div className="flex justify-between mt-2">
                            <span className="text-sm">1 day</span>
                            <span className="text-lg font-bold text-indigo-600">
                              {formData.weeklyTarget} days per week
                            </span>
                            <span className="text-sm">7 days</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 flex justify-between">
                        <Button type="button" variant="outline" onClick={prevStep}>
                          Back
                        </Button>
                        <Button type="button" onClick={nextStep} className="bg-indigo-600 hover:bg-indigo-700">
                          Next Step <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </motion.div>
                  )}

                  {formStep === 3 && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-6"
                    >
                      <div className="space-y-4">
                        <Label>Link to Business Goal (Optional)</Label>
                        <Select onValueChange={handleGoalChange}>
                          <SelectTrigger className="h-12">
                            <SelectValue placeholder="Select a business goal (optional)" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">No specific goal</SelectItem>
                            {isLoadingGoals ? (
                              <SelectItem value="loading" disabled>
                                Loading goals...
                              </SelectItem>
                            ) : goals.length > 0 ? (
                              goals.map((goal) => (
                                <SelectItem key={goal.id} value={goal.id}>
                                  {goal.title}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="no-goals" disabled>
                                No goals found
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                          Linking a habit to a business goal helps you track how your daily actions contribute to your
                          larger objectives.
                        </p>
                      </div>

                      <div className="pt-4 flex justify-between">
                        <Button type="button" variant="outline" onClick={prevStep}>
                          Back
                        </Button>
                        <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700" disabled={isSubmitting}>
                          {isSubmitting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Creating...
                            </>
                          ) : (
                            <>
                              <Sparkles className="mr-2 h-4 w-4" /> Create Habit
                            </>
                          )}
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </form>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
