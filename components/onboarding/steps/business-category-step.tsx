"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ArrowRight, Store, Globe } from "lucide-react"
import { useOnboarding } from "../onboarding-context"
import { cn } from "@/lib/utils"
import Cookies from "js-cookie";
import { useState } from "react"

interface BusinessCategoryStepProps {
  onNext: () => void
  onBack: () => void
}

const categories = [
  {
    id: "offline",
    icon: Store,
    label: "Local Business",
    description: "Real-life business owners & local establishments"
  },
  {
    id: "online",
    icon: Globe,
    label: "Digital Business",
    description: "Freelancers & online workers"
  }
]

export function BusinessCategoryStep({ onNext, onBack }: BusinessCategoryStepProps) {
  const { data, updateData } = useOnboarding()
  const [isUpdating, setIsUpdating] = useState(false)

  const updateUserProfile = async (projectType: string) => {

    
    try {
      const token = Cookies.get("token");
  
      const res = await fetch("http://localhost:3000/auth/update", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          projectType: projectType
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

  const handleSelect = (category: string) => {
    updateData({ businessCategory: category })
  }

  const handleNext = async () => {
    if (!data.businessCategory) return
    
    try {
      setIsUpdating(true)
      await updateUserProfile(data.businessCategory) // Send as projectType
      onNext()
    } catch (error) {
      console.error("Failed to update project type:", error)
      // Add error handling (e.g., toast notification)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center">What best describes your business?</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Button
                variant="outline"
                className={cn(
                  "w-full h-24 relative overflow-hidden group",
                  data.businessCategory === category.id && "border-primary bg-primary/5"
                )}
                onClick={() => handleSelect(category.id)}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-center gap-4">
                  <category.icon className="h-8 w-8 shrink-0" />
                  <div className="text-left">
                    <div className="font-semibold">{category.label}</div>
                    <div className="text-sm text-muted-foreground">{category.description}</div>
                  </div>
                </div>
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
            disabled={!data.businessCategory || isUpdating}
          >
            {isUpdating ? "Saving..." : "Next"}
            {!isUpdating && <ArrowRight className="ml-2 h-4 w-4" />}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}