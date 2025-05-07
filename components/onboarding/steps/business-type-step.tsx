"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ArrowRight, Coffee, Scissors, ShoppingBag, Wrench, Store, Sparkles } from "lucide-react"
import { useOnboarding } from "../onboarding-context"
import { cn } from "@/lib/utils"
import Cookies from "js-cookie";
import { useState } from "react"

interface BusinessTypeStepProps {
  onNext: () => void
  onBack: () => void
}

const businessTypes = [
  { id: "coffee_shop", icon: Coffee, label: "Coffee Shop" },
  { id: "salon", icon: Scissors, label: "Hair Salon" },
  { id: "retail", icon: Store, label: "Retail Store" },
  { id: "online_seller", icon: ShoppingBag, label: "Online Seller" },
  { id: "services", icon: Wrench, label: "Services" },
  { id: "other", icon: Sparkles, label: "Other" },
]

export function BusinessTypeStep({ onNext, onBack }: BusinessTypeStepProps) {
  const { data, updateData } = useOnboarding()
  const [isUpdating, setIsUpdating] = useState(false)


  
  const updateUserProfile = async (role: string) => {
    try {
      const token = Cookies.get("token");
  
      const res = await fetch("http://localhost:3000/auth/update", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          role: role // Send the role parameter
        })
      });
  
      const data = await res.json();
  
      if (!res.ok) {
        console.error("Server responded with:", data);
        throw new Error("Failed to update profile");
      }
  
      return data;
    } catch (error) {
      console.error("Error in updateUserProfile:", error);
      throw error;
    }
  }
  const handleSelect = (type: string) => {
    updateData({ businessType: type }) // Only update local state
  }

  const handleNext = async () => {
    if (!data.businessType) return
    
    try {
      setIsUpdating(true)
      await updateUserProfile(data.businessType) // Send selected business type as role
      onNext()
    } catch (error) {
      console.error("Failed to update role:", error)
      // Add error handling (e.g., toast notification)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center">What type of business is it?</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          {businessTypes.map((type, index) => (
            <motion.div
              key={type.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Button
                variant="outline"
                className={cn(
                  "w-full h-24 flex flex-col items-center justify-center gap-2",
                  data.businessType === type.id && "border-primary"
                )}
                onClick={() => handleSelect(type.id)}
              >
                <type.icon className="h-6 w-6" />
                <span>{type.label}</span>
              </Button>
            </motion.div>
          ))}
        </div>

        <div className="flex justify-between pt-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button 
            onClick={handleNext}
            disabled={!data.businessType || isUpdating}
          >
            {isUpdating ? "Saving..." : "Next"}
            {!isUpdating && <ArrowRight className="ml-2 h-4 w-4" />}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}