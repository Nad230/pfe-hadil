"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Navigation, Bike, Car, Wallet, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import confetti from "canvas-confetti"
import { toast } from "sonner"
import Cookies from "js-cookie"

interface DistanceOption {
  id: string
  title: string
  description: string
  range: string
  icon: typeof MapPin
  color: string
}

const distanceOptions: DistanceOption[] = [
  {
    id: "walking",
    title: "Walking Distance",
    description: "Perfect for neighborhood jobs and local opportunities",
    range: "500 - 1500 meters",
    icon: MapPin,
    color: "from-green-500 to-emerald-600"
  },
  {
    id: "biking",
    title: "Biking Distance",
    description: "Ideal for local gigs and nearby businesses",
    range: "1000 - 3000 meters",
    icon: Bike,
    color: "from-blue-500 to-indigo-600"
  },
  {
    id: "driving",
    title: "City-Wide",
    description: "Access opportunities across the entire city",
    range: "3000 - 5000 meters",
    icon: Car,
    color: "from-purple-500 to-pink-600"
  }
]

interface DistanceSelectionStepProps {
  onNext: () => void
  onBack: () => void
}

export function DistanceSelectionStep({ onNext, onBack }: DistanceSelectionStepProps) {
  const router = useRouter()
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [budget, setBudget] = useState("")
  const [currency, setCurrency] = useState("USD")
  const [location, setLocation] = useState<{ city?: string; country?: string }>({})
  const [step, setStep] = useState(1)
  const [isUpdatingRange, setIsUpdatingRange] = useState(false)
  const [isUpdatingBudget, setIsUpdatingBudget] = useState(false)
  const [locationId, setLocationId] = useState<string | null>(null)

  useEffect(() => {
    const savedLocation = localStorage.getItem("selectedLocation")
    if (savedLocation) setLocation(JSON.parse(savedLocation))
    
    const fetchLocationId = async () => {
      try {
        const token = Cookies.get("token")
        const response = await fetch("http://localhost:3000/userlocation/location", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) throw new Error("Failed to fetch location ID")
        
        const data = await response.json()
        setLocationId(data.id)
      } catch (error) {
        toast.error("Failed to load location data")
      }
    }

    fetchLocationId()
  }, [])

  const getRangeValue = (optionId: string) => {
    const ranges = {
      walking: 1500,
      biking: 3000,
      driving: 5000
    }
    return ranges[optionId as keyof typeof ranges] || 0
  }

  const handleOptionSelect = async (optionId: string) => {
    if (!locationId) {
      toast.error("Location data not loaded yet")
      return
    }

    try {
      setIsUpdatingRange(true)
      const token = Cookies.get("token")
      
      const response = await fetch(`http://localhost:3000/userlocation/${locationId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          range: getRangeValue(optionId)
        })
      })

      if (!response.ok) throw new Error("Failed to update range")

      setSelectedOption(optionId)
      confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } })
      setStep(2)
      localStorage.setItem("searchRadius", optionId)
      toast.success("Work range updated successfully!")
    } catch (error) {
      toast.error("Failed to update work range")
    } finally {
      setIsUpdatingRange(false)
    }
  }

  const handleBudgetSubmit = async () => {
    if (!budget || isNaN(Number(budget))) return

    try {
      setIsUpdatingBudget(true)
      const token = Cookies.get("token")

      const budgetResponse = await fetch("http://localhost:3000/auth/update", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          budgetRange: {
            amount: Number(budget),
            currency
          }
        })
      })

      if (!budgetResponse.ok) throw new Error("Failed to update budget")

      localStorage.setItem("userBudget", JSON.stringify({
        amount: Number(budget),
        currency
      }))
      
      confetti({ particleCount: 100, spread: 100, origin: { y: 0.6 } })
      toast.success("Budget preferences saved!")
      onNext() // Navigate to the next step
    } catch (error) {
      toast.error("Failed to save budget preferences")
    } finally {
      setIsUpdatingBudget(false)
    }
  }

  return (
    <div className="min-h-screen bg-[url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80')] bg-cover bg-center bg-no-repeat">
      <div className="min-h-screen bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="w-full max-w-4xl space-y-8">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="text-center">Choose Your Work Radius</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center space-y-4">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", duration: 0.8 }}
                        className="w-20 h-20 bg-primary/10 rounded-full mx-auto flex items-center justify-center"
                      >
                        <Navigation className="h-10 w-10 text-primary" />
                      </motion.div>
                      <h1 className="text-4xl font-bold tracking-tight">
                        {location.city && location.country ? (
                          <>
                            Working in {location.city}, {location.country}
                          </>
                        ) : (
                          "Choose Your Work Radius"
                        )}
                      </h1>
                      <p className="text-muted-foreground text-lg">
                        How far are you willing to travel for work opportunities?
                      </p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-3">
                      {distanceOptions.map((option, index) => {
                        const Icon = option.icon
                        return (
                          <motion.div
                            key={option.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <Card
                              className={`relative overflow-hidden transition-all duration-300 ${
                                selectedOption === option.id ? "ring-2 ring-primary" : ""
                              } hover:shadow-lg cursor-pointer group`}
                              onClick={() => handleOptionSelect(option.id)}
                            >
                              <CardContent className="p-6">
                                <div className={`absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-300 ${option.color}`} />
                                <div className="relative space-y-4">
                                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${option.color} flex items-center justify-center`}>
                                    <Icon className="h-6 w-6 text-white" />
                                  </div>
                                  <h3 className="text-xl font-semibold">{option.title}</h3>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {option.description}
                                  </p>
                                  <div className="text-sm font-medium bg-primary/10 px-3 py-1 rounded-full inline-block">
                                    {option.range}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        )
                      })}
                    </div>

                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="text-center text-sm text-muted-foreground"
                    >
                      Don't worry, you can always change this later in your settings
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="text-center">What's your budget range?</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    <div className="flex items-center gap-3">
                      <select
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        className="h-10 px-3 py-2 rounded-lg border bg-background"
                      >
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="IQD">IQD (د.ع)</option>
                      </select>
                      <input
                        type="number"
                        value={budget}
                        onChange={(e) => setBudget(e.target.value)}
                        placeholder="Enter budget amount"
                        className="w-full h-10 px-3 py-2 rounded-lg border bg-background"
                      />
                    </div>
                    <Button 
                      onClick={handleBudgetSubmit}
                      className="w-full"
                      size="lg"
                      disabled={isUpdatingBudget}
                    >
                      {isUpdatingBudget ? (
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      ) : (
                        "Find Opportunities"
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex justify-between pt-4">
            <Button variant="ghost" onClick={onBack}>
              Back
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}