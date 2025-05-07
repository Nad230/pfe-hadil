"use client"

import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard"

export default function OnboardingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <OnboardingWizard />
    </div>
  )
}