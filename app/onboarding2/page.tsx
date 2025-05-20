"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { WelcomeScreen } from "@/components/onboarding/welcome-screen"
import { RoleSelection } from "@/components/onboarding/role-selection"
import { AvatarSelection } from "@/components/onboarding/avatar-selection"
import { useRouter } from "next/navigation"
import { BackgroundAnimation } from "@/components/onboarding/background-animation"

export type Role = "developer" | "student" | "teacher" | "creator"

export default function OnboardingPage() {
  const [step, setStep] = useState<"welcome" | "role" | "avatar">("welcome")
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const router = useRouter()

  const handleComplete = () => {
    // In a real app, you'd save the user's selections
    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <BackgroundAnimation />
      <div className="relative z-10">
        <AnimatePresence mode="wait">
          {step === "welcome" && (
            <WelcomeScreen key="welcome" onContinue={() => setStep("role")} />
          )}
          {step === "role" && (
            <RoleSelection
              key="role"
              onSelect={(role) => {
                setSelectedRole(role)
                setStep("avatar")
              }}
            />
          )}
          {step === "avatar" && selectedRole && (
            <AvatarSelection
              key="avatar"
              role={selectedRole}
              onComplete={handleComplete}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}