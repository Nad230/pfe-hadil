"use client"

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type OnboardingStep = {
  id: string
  title: string
  description: string
  element: string
  position: 'top' | 'right' | 'bottom' | 'left'
  page: string
}

type OnboardingState = {
  isActive: boolean
  hasCompleted: boolean
  currentStep: number
  currentPage: string
  steps: Record<string, OnboardingStep[]>
  setActive: (active: boolean) => void
  setCompleted: (completed: boolean) => void
  setCurrentStep: (step: number) => void
  setCurrentPage: (page: string) => void
  nextStep: () => void
  previousStep: () => void
  skipTour: () => void
  restartTour: () => void
}

export const useOnboarding = create<OnboardingState>()(
  persist(
    (set, get) => ({
      isActive: false,
      hasCompleted: false,
      currentStep: 0,
      currentPage: '/',
        steps: {
            '/dashboard': [
              {
                id: 'header-greeting',
                title: 'Daily Overview 👋',
                description: 'Start here every morning to see your personalized greeting and current work status',
                element: '#dashboard-header',
                position: 'bottom',
                page: '/dashboard'
              },
              {
                id: 'end-day-button',
                title: 'Finish Strong 💪',
                description: 'When your shift ends, click here to review your daily achievements and statistics',
                element: '#end-day-button', // Add this ID to your EndOfDayReport button
                position: 'bottom',
                page: '/dashboard'
              },
              {
                id: 'live-stats',
                title: 'Real-Time Metrics 📈',
                description: 'Your four key numbers - updated continuously throughout the day',
                element: '#monthly-stats',
                position: 'bottom',
                page: '/dashboard'
              },
              {
                id: 'quick-actions',
                title: 'Quick Actions ⚡',
                description: 'Start sales, begin shifts, or add expenses - your daily toolkit',
                element: '#quick-actions',
                position: 'top',
                page: '/dashboard'
              },
              {
                id: 'activity-summary',
                title: 'Activity Breakdown 📋',
                description: 'Review your shifts, notes, expenses, and sales - all in one place',
                element: '#contribution-tracker',
                position: 'top',
                page: '/dashboard'
              },
              {
                id: 'ai-assistant',
                title: 'AI Business Partner 🤖',
                description: '24/7 assistance with insights and recommendations for your coffee shop',
                element: '#ai-assistant-button',
                position: 'left',
                page: '/dashboard'
              }
            ],
        '/transactions': [
          {
            id: 'transactions-welcome',
            title: 'Transaction Management 💰',
            description: 'Record and track all your business transactions here.',
            element: '#transactions-header',
            position: 'bottom',
            page: '/transactions'
          },
          {
            id: 'add-transaction',
            title: 'Add New Transactions',
            description: 'Click here to record income, expenses, or any financial activity.',
            element: '#add-transaction-btn',
            position: 'left',
            page: '/transactions'
          },
          {
            id: 'transaction-filters',
            title: 'Smart Filters',
            description: 'Filter your transactions by date, type, or category.',
            element: '#transaction-filters',
            position: 'bottom',
            page: '/transactions'
          }
        ]
      },
      setActive: (active) => set({ isActive: active }),
      setCompleted: (completed) => set({ hasCompleted: completed }),
      setCurrentStep: (step) => set({ currentStep: step }),
      setCurrentPage: (page) => set({ currentPage: page }),
      nextStep: () => {
        const { currentStep, currentPage, steps } = get()
        const pageSteps = steps[currentPage]
        
        if (currentStep < pageSteps.length - 1) {
          set({ currentStep: currentStep + 1 })
        } else {
          // Find next page with steps
          const pages = Object.keys(steps)
          const currentPageIndex = pages.indexOf(currentPage)
          
          if (currentPageIndex < pages.length - 1) {
            set({
              currentPage: pages[currentPageIndex + 1],
              currentStep: 0
            })
          } else {
            // Tour completed
            set({
              isActive: false,
              hasCompleted: true,
              currentStep: 0,
              currentPage: '/'
            })
          }
        }
      },
      previousStep: () => {
        const { currentStep, currentPage, steps } = get()
        
        if (currentStep > 0) {
          set({ currentStep: currentStep - 1 })
        } else {
          // Find previous page with steps
          const pages = Object.keys(steps)
          const currentPageIndex = pages.indexOf(currentPage)
          
          if (currentPageIndex > 0) {
            const previousPage = pages[currentPageIndex - 1]
            set({
              currentPage: previousPage,
              currentStep: steps[previousPage].length - 1
            })
          }
        }
      },
      skipTour: () => {
        set({
          isActive: false,
          hasCompleted: true,
          currentStep: 0,
          currentPage: '/'
        })
      },
      restartTour: () => {
        set({
          isActive: true,
          hasCompleted: false,
          currentStep: 0,
          currentPage: '/dashboard'
        })
      }
    }),
    {
      name: 'onboarding-storage'
    }
  )
)