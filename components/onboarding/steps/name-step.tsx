"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { useOnboarding } from "../onboarding-context"
import { useState } from "react"
import Cookies from "js-cookie"

interface NameStepProps {
  onNext: () => void
  onBack: () => void
}

const updateUserProfile = async (location: string) => {
  try {
    const token = Cookies.get("token");
    if (!token) throw new Error("No authentication token found");

    const res = await fetch("http://localhost:3000/auth/update", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        location: location
      })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to update location");
    
    return data;
  } catch (error) {
    console.error("Error updating location:", error);
    throw error;
  }
}

export function NameStep({ onNext, onBack }: NameStepProps) {
  const { data, updateData } = useOnboarding()
  const [location, setLocation] = useState(data.location || "")
  const [error, setError] = useState("")

  const handleNext = async () => {
    if (!location.trim()) {
      setError("Please enter your business location")
      return
    }

    try {
      await updateUserProfile(location.trim())
      updateData({ location })
      onNext()
    } catch (err) {
      setError("Failed to save location. Please try again.")
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center">
          Where is your business located?
          <span className="block text-base font-normal text-muted-foreground mt-2">
            We'll use this for local recommendations and timezone
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Input
            placeholder="Ex: Tunis, Sousse, Ariana..."
            value={location}
            onChange={(e) => {
              setLocation(e.target.value)
              setError("")
            }}
            className="text-lg h-12"
            onKeyDown={(e) => e.key === "Enter" && handleNext()}
          />
        </motion.div>

        {error && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-red-500 text-sm text-center"
          >
            {error}
          </motion.div>
        )}

        <div className="flex justify-between pt-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button 
            onClick={handleNext} 
            disabled={!location.trim()}
          >
            Next
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}