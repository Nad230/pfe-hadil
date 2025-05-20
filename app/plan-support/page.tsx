"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { useState } from "react"
import Cookies from "js-cookie"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { motion, AnimatePresence } from "framer-motion"

const businessTypeExamples = [
  "Coffee Shop",
  "Barbershop",
  "Restaurant",
  "Retail Store",
  "Other"
]

export default function BusinessDetailsPage() {
  const router = useRouter()
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false)

  const [formData, setFormData] = useState({
    projectName: "",
    businessType: "",
    budgetRange: "",
    city: "",
    country: "",
    description: ""
  })
  const [customBusinessType, setCustomBusinessType] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)

  const updateBusinessDetails = async (businessType: string, budget: number) => {
    try {
      const token = Cookies.get("token")
      if (!token) throw new Error("Authentication required")

      const res = await fetch("http://localhost:3000/business-plan/userplan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          projectName: formData.projectName,
          projectType: businessType, // Changed from formData.businessType to parameter
          BudgetRange: budget, 
          city: formData.city,
          country: formData.country,
          description: formData.description
        })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Failed to update business details")
      return data
    } catch (error) {
      console.error("Error updating business details:", error)
      throw error
    }
  }

 
  const handleSubmit = async () => {
    // Validation
    if (!formData.projectName.trim()) {
      toast.error("Business name is required")
      return
    }
    if (!formData.businessType) {
      toast.error("Business type is required")
      return
    }
    if (formData.businessType === "Other" && !customBusinessType.trim()) {
      toast.error("Please enter your business type")
      return
    }
    if (!formData.budgetRange) {
      toast.error("Budget range is required")
      return
    }
    if (isNaN(Number(formData.budgetRange))) {
      toast.error("Budget must be a valid number")
      return
    }
    if (!formData.city.trim()) {
      toast.error("City is required")
      return
    }
    if (!formData.country.trim()) {
      toast.error("Country is required")
      return
    }

    try {
      setIsUpdating(true)
      const finalBusinessType = formData.businessType === "Other" 
        ? customBusinessType 
        : formData.businessType
      const budget = Number(formData.budgetRange)

      // Save business details
      await updateBusinessDetails(finalBusinessType, budget)
      
      // Show processing state
      setIsGeneratingPlan(true)
      
      // Call the new API endpoint
      const token = Cookies.get("token")
      if (!token) throw new Error("Authentication required")

      const response = await fetch("http://localhost:3000/project-offline-ai/planadvice", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` }
      })

      if (!response.ok) throw new Error("Failed to generate plan")

      // Redirect after successful generation
      router.push("/startBusiness")
      toast.success("AI business plan generated successfully!")
    } catch (error) {
      toast.error(error.message)
    } finally {
      setIsUpdating(false)
      setIsGeneratingPlan(false)
    }
  }
  


  return (
    <div className="container max-w-2xl mx-auto px-4 py-8">
      <AnimatePresence>
        {isGeneratingPlan && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center space-y-4"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="mx-auto h-12 w-12 rounded-full border-4 border-primary border-t-transparent"
              />
              <h2 className="text-xl font-semibold">
                AI is crafting your perfect business plan
              </h2>
              <p className="text-muted-foreground">
                Analyzing market trends and optimizing strategies...
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence >
      <Card>
        <CardHeader>
          <CardTitle className="text-center">
            Tell us about your business 🏢
            <span className="block text-base font-normal text-muted-foreground mt-2">
              Help us understand your business better
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <Input
              placeholder="Business Name *"
              value={formData.projectName}
              onChange={(e) => setFormData({...formData, projectName: e.target.value})}
              className="text-lg h-12"
            />

            <div className="space-y-4">
              <Select
                value={formData.businessType}
                onValueChange={(value) => setFormData({...formData, businessType: value})}
              >
                <SelectTrigger className="h-12 text-lg">
                  <SelectValue placeholder="Business Type *" />
                </SelectTrigger>
                <SelectContent>
                  {businessTypeExamples.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {formData.businessType === "Other" && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Input
                    placeholder="Enter your business type *"
                    value={customBusinessType}
                    onChange={(e) => setCustomBusinessType(e.target.value)}
                    className="text-lg h-12"
                  />
                </motion.div>
              )}
            </div>

            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <Input
                type="number"
                min="0"
                placeholder="Budget Range *"
                value={formData.budgetRange}
                onChange={(e) => setFormData({...formData, budgetRange: e.target.value})}
                className="pl-8 text-lg h-12"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="City *"
                value={formData.city}
                onChange={(e) => setFormData({...formData, city: e.target.value})}
                className="text-lg h-12"
              />
              <Input
                placeholder="Country *"
                value={formData.country}
                onChange={(e) => setFormData({...formData, country: e.target.value})}
                className="text-lg h-12"
              />
            </div>

            <Textarea
              placeholder="Business Description (Optional)"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="min-h-[100px]"
            />
          </motion.div>

          <div className="flex justify-between pt-4">
            <Button variant="ghost" onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={
                !formData.projectName.trim() || 
                !formData.businessType ||
                (formData.businessType === "Other" && !customBusinessType.trim()) ||
                !formData.budgetRange ||
                !formData.city.trim() || 
                !formData.country.trim() || 
                isUpdating
              }
            >
              {isUpdating ? "Saving..." : "Save & Continue"}
              {!isUpdating && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}