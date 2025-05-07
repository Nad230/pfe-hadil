"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { useOnboarding } from "../onboarding-context"
import { useState } from "react"
import Cookies from "js-cookie";

interface BusinessNameStepProps {
  onNext: () => void
  onBack: () => void
}

export function BusinessNameStep({ onNext, onBack }: BusinessNameStepProps) {
    const { data, updateData } = useOnboarding()
    const [businessName, setBusinessName] = useState(data.businessName)
    const [isUpdating, setIsUpdating] = useState(false)

  const updateUserProfile = async (projectName: string) => {
    try {
      const token = Cookies.get("token");
  
      const res = await fetch("http://localhost:3000/auth/update", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          projectName: projectName
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

   
  
    const handleNext = async () => {
      if (businessName.trim()) {
        try {
          setIsUpdating(true)
          updateData({ businessName })
          await updateUserProfile(businessName)
          onNext()
        } catch (error) {
          console.error("Failed to update project name:", error)
          // Add error handling (e.g., toast notification)
        } finally {
          setIsUpdating(false)
        }
      }
    }
  
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-center">
            So... what do we call your empire? 🏰
            <span className="block text-base font-normal text-muted-foreground mt-2">
              Even if it's just starting, it's still awesome.
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Input
              placeholder="Ex: Café Central, PixelFix Studio, Nadhir Dev"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="text-lg h-12"
              onKeyDown={(e) => e.key === "Enter" && handleNext()}
            />
          </motion.div>
  
          <div className="flex justify-between pt-4">
            <Button variant="ghost" onClick={onBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button 
              onClick={handleNext} 
              disabled={!businessName.trim() || isUpdating}
            >
              {isUpdating ? "Saving..." : "Next"}
              {!isUpdating && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }