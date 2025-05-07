"use client"

import { createContext, useContext, useState } from "react"

interface OnboardingData {
  language: string
  businessCategory: string
  name: string
  businessName: string
  businessType: string
  selectedFeatures: string[]
}

interface OnboardingContextType {
  data: OnboardingData
  updateData: (newData: Partial<OnboardingData>) => void
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined)

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<OnboardingData>({
    language: "en",
    businessCategory: "",
    name: "",
    businessName: "",
    businessType: "",
    selectedFeatures: [],
  })

  const updateData = (newData: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...newData }))
  }

  return (
    <OnboardingContext.Provider value={{ data, updateData }}>
      {children}
    </OnboardingContext.Provider>
  )
}

export function useOnboarding() {
  const context = useContext(OnboardingContext)
  if (context === undefined) {
    throw new Error("useOnboarding must be used within an OnboardingProvider")
  }
  return context
}