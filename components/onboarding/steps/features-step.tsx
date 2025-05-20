"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ArrowRight, Clock } from "lucide-react"
import { useOnboarding } from "../onboarding-context"
import { cn } from "@/lib/utils"
import Cookies from "js-cookie"
import { useState } from "react"

interface FeaturesStepProps {
  onNext: () => void
  onBack: () => void
}

const hours = Array.from({ length: 24 }, (_, i) => i) // 0-23 hours

const updateUserProfile = async (startHour: number, endHour: number) => {
  try {
    const token = Cookies.get("token")
    if (!token) throw new Error("No authentication token found")

    const res = await fetch("http://localhost:3000/auth/update", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        startHour,
        endHour
      })
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data.message || "Failed to update profile")
    
    return data
  } catch (error) {
    console.error("Error updating profile:", error)
    throw error
  }
}

export function FeaturesStep({ onNext, onBack }: FeaturesStepProps) {
  const { data, updateData } = useOnboarding()
  const [error, setError] = useState("")

  const handleSubmit = async () => {
    if (!data.startHour || !data.endHour) {
      setError("Please select both start and end hours")
      return
    }
    
    // Allow overnight shifts (endHour < startHour) but prevent same hour selection
    if (data.startHour === data.endHour) {
      setError("Start and end hours cannot be the same")
      return
    }

    try {
      await updateUserProfile(data.startHour, data.endHour)
      onNext()
    } catch (err) {
      setError("Failed to save work hours. Please try again.")
    }
  }

  // Helper function to format hour display
  const formatHour = (hour: number) => {
    if (hour === 0) return "00:00 (Midnight)"
    if (hour === 12) return "12:00 (Noon)"
    return `${hour.toString().padStart(2, '0')}:00`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center">
          Set Your Daily Work Hours
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-6"
        >
          <div className="flex items-center gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Start Hour</label>
              <select
                value={data.startHour ?? ""}
                onChange={(e) => updateData({ startHour: Number(e.target.value) })}
                className="p-2 border rounded-md"
              >
                <option value="">Select start time</option>
                {hours.map((hour) => (
                  <option key={`start-${hour}`} value={hour}>
                    {formatHour(hour)}
                  </option>
                ))}
              </select>
            </div>

            <span className="mt-6">to</span>

            <div className="space-y-2">
              <label className="text-sm font-medium">End Hour</label>
              <select
                value={data.endHour ?? ""}
                onChange={(e) => updateData({ endHour: Number(e.target.value) })}
                className="p-2 border rounded-md"
              >
                <option value="">Select end time</option>
                {hours.map((hour) => (
                  <option key={`end-${hour}`} value={hour}>
                    {formatHour(hour)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-500 text-sm"
            >
              {error}
            </motion.div>
          )}

          <p className="text-muted-foreground text-sm text-center">
            Note: We support overnight shifts! Example: 20:00 → 07:00
          </p>
        </motion.div>

        <div className="flex justify-between pt-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!data.startHour || !data.endHour}
          >
            Save Hours
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}