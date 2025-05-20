"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { WelcomeStep } from "./steps/welcome-step"
import { LanguageStep } from "./steps/language-step"
import { BusinessCategoryStep } from "./steps/business-category-step"
import { NameStep } from "./steps/name-step"
import { BusinessNameStep } from "./steps/business-name-step"
import { BusinessTypeStep } from "./steps/business-type-step"
import { FeaturesStep } from "./steps/features-step"
import { CelebrationStep } from "./steps/celebration-step"
import { OnboardingProvider } from "./onboarding-context"
import { WorkStatusStep } from "./steps/WorkStatusStep"
import { LocationStep } from "./steps/location-step"
import { DistanceSelectionStep } from "./steps/DistanceSelectionStep"
import { SuggestionsStep } from "./steps/SuggestionsStep"

export function OnboardingWizard() {
  const [currentStep, setCurrentStep] = useState(0)

  const steps = [
    WelcomeStep,
    LanguageStep,
    BusinessCategoryStep,
    WorkStatusStep,
    NameStep,
    BusinessNameStep,
    BusinessTypeStep,
    FeaturesStep,
    CelebrationStep,
  ]

  const CurrentStepComponent = steps[currentStep]

  const goToNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const goToPreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  return (
    <OnboardingProvider>
      <div className="container max-w-2xl mx-auto px-4 py-8 min-h-screen flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            <CurrentStepComponent
              onNext={goToNextStep}
              onBack={goToPreviousStep}
              isFirstStep={currentStep === 0}
              isLastStep={currentStep === steps.length - 1}
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </OnboardingProvider>
  )
}