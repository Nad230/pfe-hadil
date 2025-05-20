"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ArrowRight, Briefcase, Search, Rocket, Crown, AlertCircle } from "lucide-react"
import { useOnboarding } from "../onboarding-context"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import Cookies from "js-cookie"
import { toast } from "sonner"

interface WorkStatusStepProps {
  onNext: () => void
  onBack: () => void
}

// Options for offline users
const offlineOptions = {
  diamond: [
    {
      id: "ai_business_finder",
      icon: Search,
      label: "Find Business Opportunities",
      description: "AI will help you discover perfect business opportunities in your area"
    },
    {
      id: "ai_business_planner",
      icon: Rocket,
      label: "Create a Business Plan",
      description: "AI will create a comprehensive plan for your business idea"
    },
    {
      id: "existing_business",
      icon: Briefcase,
      label: "Manage Existing Business",
      description: "Set up and optimize your current business operations"
    }
  ],
  gold: [
    {
      id: "ai_assist_limited",
      icon: Rocket,
      label: "AI-Assisted Planning",
      description: "Get AI help with your business (with some limitations)"
    },
    {
      id: "existing_business",
      icon: Briefcase,
      label: "Manage Existing Business",
      description: "Track transactions and manage your current business"
    }
  ],
  silver: [
    {
      id: "basic_tracking",
      icon: Briefcase,
      label: "Business Basics",
      description: "Track time, sales, shifts, expenses and transactions"
    }
  ]
}

// Options for online users
const onlineOptions = {
  diamond: [
    {
      id: "ai_job_finder",
      icon: Search,
      label: "Find Freelance Work",
      description: "AI will find jobs based on your skills, country and preferences"
    },
    {
      id: "existing_freelance",
      icon: Briefcase,
      label: "Manage Freelance Business",
      description: "Track and optimize your current freelance operations"
    }
  ],
  gold: [
    {
      id: "ai_assist_limited",
      icon: Rocket,
      label: "AI-Assisted Job Search",
      description: "Get AI help with finding work (with some limitations)"
    },
    {
      id: "existing_freelance",
      icon: Briefcase,
      label: "Manage Freelance Business",
      description: "Track transactions and manage your freelance work"
    }
  ],
  silver: [
    {
      id: "basic_tracking",
      icon: Briefcase,
      label: "Freelance Basics",
      description: "Track time, earnings and manage transactions"
    }
  ]
}

export function WorkStatusStep({ onNext, onBack }: WorkStatusStepProps) {
  const { data, updateData } = useOnboarding()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isNavigating, setIsNavigating] = useState(false)
  const [projectType, setProjectType] = useState<'online' | 'offline' | null>(null)
  const [packageType, setPackageType] = useState<'diamond' | 'gold' | 'silver' | null>(null)
  const [loadingPackage, setLoadingPackage] = useState(true)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoadingPackage(true)
        const token = Cookies.get("token")
        if (!token) {
          toast.error("Authentication required")
          return
        }

        // First get user's sub
        const meResponse = await fetch("http://localhost:3000/auth/me", {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (!meResponse.ok) throw new Error("Failed to fetch user data")
        const { sub } = await meResponse.json()

        // Then get subscription details
        const subResponse = await fetch(`http://localhost:3000/auth/${sub}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (!subResponse.ok) throw new Error("Failed to fetch subscription data")
        const { projectType, packageType } = await subResponse.json()

setProjectType(projectType?.toLowerCase?.())
setPackageType(packageType?.toLowerCase?.())
      } catch (error) {
        console.error("Error fetching user data:", error)
        toast.error("Failed to load user settings")
      } finally {
        setLoadingPackage(false)
      }
    }

    fetchUserData()
  }, [])

  // Get appropriate options based on project type and package
  const getOptions = () => {
    if (!projectType || !packageType) return []
    
    return projectType === 'online' 
      ? onlineOptions[packageType] 
      : offlineOptions[packageType]
  }

  const handleSelect = (status: string) => {
    updateData({ workStatus: status })
  }

  // Function to update firstTime to true
  const updateFirstTimeStatus = async () => {
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
          firstTime: true
        })
      })
      
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Failed to update onboarding status")
      
      return data
    } catch (error) {
      console.error("Error updating onboarding status:", error)
      throw error
    }
  }

  const handleProceed = async () => {
    if (!data.workStatus || isNavigating) return

    try {
      setIsLoading(true)
      setIsNavigating(true)

      if (projectType === 'online') {
        // For online users, update firstTime and redirect to freelance page
        await updateFirstTimeStatus()
        await router.replace('/freelance')
      } else {
        // For offline users, continue with normal flow
        switch (data.workStatus) {
          case 'ai_business_finder':
            await router.replace('/location')
            break
          
          case 'ai_business_planner':
            await router.replace('/plan-support')
            break

          default:
            // Only update firstTime if this is the final step in offline flow
            if (data.workStatus === 'existing_business' || data.workStatus === 'basic_tracking') {
              await updateFirstTimeStatus()
            }
            onNext() // Continue normal onboarding flow
        }
      }
      
      router.refresh()
    } catch (error: any) {
      toast.error(error.message)
      setIsNavigating(false)
    } finally {
      setIsLoading(false)
    }
  }

  if (loadingPackage) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Loading your options...</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center py-12">
          <div className="animate-pulse flex space-x-2">
            <div className="h-3 w-3 bg-primary rounded-full"></div>
            <div className="h-3 w-3 bg-primary rounded-full"></div>
            <div className="h-3 w-3 bg-primary rounded-full"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const options = getOptions()
  const packageDisplay = packageType ? packageType.charAt(0).toUpperCase() + packageType.slice(1) : ''

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center">
          {projectType === 'online' ? 'Freelance' : 'Business'} Options
        </CardTitle>
        <div className="text-center mt-2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary/10 text-primary">
            <Crown className="mr-1 h-4 w-4" /> {packageDisplay} Package
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
{Array.isArray(options) && options.length > 0 ? (
          <div className="grid gap-4">
            {options.map((option, index) => (
              <motion.div
                key={option.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Button
                  variant="outline"
                  className={cn(
                    "w-full h-24 relative overflow-hidden group",
                    data.workStatus === option.id && "border-primary bg-primary/5"
                  )}
                  onClick={() => handleSelect(option.id)}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="flex items-center gap-4">
                    <option.icon className="h-8 w-8 shrink-0" />
                    <div className="text-left">
                      <div className="font-semibold">{option.label}</div>
                      <div className="text-sm text-muted-foreground">{option.description}</div>
                    </div>
                  </div>
                </Button>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-4">Unable to load options. Please try again later.</p>
          </div>
        )}

        {packageType !== 'diamond' && packageType !== null && (
          <div className="rounded-lg bg-muted/50 p-4 border border-dashed">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="h-5 w-5 text-amber-500" />
              <h3 className="font-medium">Diamond Package Benefits</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Upgrade to Diamond for full AI assistance with business planning, opportunity discovery, and premium features.
            </p>
          </div>
        )}

        <div className="flex justify-between pt-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button 
            onClick={handleProceed}
            disabled={!data.workStatus || isLoading || isNavigating}
          >
            {isLoading || isNavigating ? (
              <span className="flex items-center">
                <span className="animate-pulse">Processing...</span>
              </span>
            ) : (
              <>
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}