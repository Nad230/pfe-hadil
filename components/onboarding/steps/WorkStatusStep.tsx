"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ArrowRight, Briefcase, Search, Rocket } from "lucide-react"
import { useOnboarding } from "../onboarding-context"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import Cookies from "js-cookie"
import { toast } from "sonner"

interface WorkStatusStepProps {
  onNext: () => void
  onBack: () => void
}

const options = [
  {
    id: "have_work",
    icon: Briefcase,
    label: "I already have a business",
    description: "I'm here to set up my existing business"
  },
  {
    id: "find_work",
    icon: Search,
    label: "Help me find a business",
    description: "I need assistance discovering the right opportunity"
  },
  {
    id: "have_plan",
    icon: Rocket,
    label: "I have a business plan",
    description: "I want AI assistance to launch my business idea"
  }
]

export function WorkStatusStep({ onNext, onBack }: WorkStatusStepProps) {
  const { data, updateData } = useOnboarding()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isNavigating, setIsNavigating] = useState(false)
  const [projectType, setProjectType] = useState<'online' | 'offline' | null>(null)

  useEffect(() => {
    const fetchProjectType = async () => {
      try {
        const token = Cookies.get("token")
        if (!token) return

        const meResponse = await fetch("http://localhost:3000/auth/me", {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (!meResponse.ok) throw new Error("Failed to fetch user data")
        const { sub } = await meResponse.json()

        const subResponse = await fetch(`http://localhost:3000/auth/${sub}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (!subResponse.ok) throw new Error("Failed to fetch project type")
        const { projectType } = await subResponse.json()

        setProjectType(projectType)
      } catch (error) {
        console.error("Error fetching project type:", error)
        toast.error("Failed to load project type")
      }
    }

    fetchProjectType()
  }, [])

  const filteredOptions = options.filter(option => {
    // Hide "have_plan" for online users instead of "have_work"
    if (projectType === 'online' && option.id === 'have_plan') return false
    return true
  })

  const handleSelect = (status: string) => {
    updateData({ workStatus: status })
  }

  const handleProceed = async () => {
    if (!data.workStatus || isNavigating) return

    try {
      setIsLoading(true)
      setIsNavigating(true)

      switch (data.workStatus) {
        case 'find_work':
          await router.replace(projectType === 'online' ? '/skills' : '/location')
          break
          
        case 'have_plan':
          await router.replace('/plan-support')
          break

        case 'have_work':
          await router.replace(projectType === 'online' ? '/freelance' : '/business-dashboard')
          break

        default:
          onNext()
      }
      
      router.refresh()
    } catch (error: any) {
      toast.error(error.message)
      setIsNavigating(false)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center">What's your current situation?</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4">
          {filteredOptions.map((option, index) => (
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