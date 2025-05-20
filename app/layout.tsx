"use client"

import "./globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { Navigation } from "@/components/navigation"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Cookies from "js-cookie"
import { TranslationProvider } from "@/components/context/translation-context"
import { Mascot } from "@/components/mascot/mascot"
import ShiftToast from "@/components/shifts/ShiftToast"
import TimerToast from "@/components/time-tracker/TimerToast"
import { Button } from "@/components/ui/button"
import { AIAssistantProvider } from "@/contexts/AIAssistantContext"
import AIAssistantButton from "@/components/AIAssistantButton/AIAssistantButton"
import AIAssistantPanel from "@/components/AIAssistantButton/AIAssistantPanel"
import AICharacterButton from "@/components/AICharacter/AICharacterButton"
import AICharacterDialog from "@/components/AICharacter/AICharacterDialog"
import { AICharacterProvider } from "@/contexts/AICharacterContext"

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [firstTime, setFirstTime] = useState<boolean | null>(null)
  const [projectType, setProjectType] = useState<"online" | "offline" | null>(null)

  const isAuthPage = pathname.startsWith("/auth")
  const isOnboardingPage = pathname.startsWith("/onboarding")

  useEffect(() => {
    if (isAuthPage) return

    const checkUser = async () => {
      const token = Cookies.get("token")
      if (!token) {
        setIsAuthenticated(false)
        return
      }

      try {
        const meRes = await fetch("http://localhost:3000/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!meRes.ok) {
          setIsAuthenticated(false)
          return
        }

        const { sub } = await meRes.json()

        const userRes = await fetch(`http://localhost:3000/auth/${sub}`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!userRes.ok) {
          setIsAuthenticated(false)
          return
        }

        const userData = await userRes.json()
        setFirstTime(userData.firstTime)
        setProjectType(userData.projectType)
        setIsAuthenticated(true)

    


      } catch (error) {
        console.error("Auth error:", error)
        setIsAuthenticated(false)
      }
    }

    checkUser()
  }, [pathname])

  const blockInteraction = firstTime === false && !isOnboardingPage

  // Define where to show which AI UI
  const assistantRoutes = [
    "/sales-analytics",
    "/expenses-analytics",
    "/timeEntry-analytics",
    "/profit-analytics",
  ]

  const characterRoutes = [
    "/freelance",
    "/freelance/portfolio",
    "/freelance/clients",
    "/freelance/invoices",
    "/project",
    "/transactions"
  ]

  const isAssistantVisible =
    projectType === "offline" && assistantRoutes.some((route) => pathname.startsWith(route))

  const isCharacterVisible =
    projectType === "online" &&
    (characterRoutes.some((route) => pathname.startsWith(route)) ||
      pathname.startsWith("/project/"))

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AIAssistantProvider>
          <AICharacterProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <TranslationProvider>
                <div className="min-h-screen bg-background relative">
                  {isAuthPage || !isAuthenticated ? (
                    <main className="container mx-auto px-4 py-4">{children}</main>
                  ) : (
                    <>
                      <Navigation>
                        <div
                          className={`relative ${
                            blockInteraction ? "pointer-events-none" : ""
                          }`}
                        >
                          {children}

                          {/* Blocking overlay */}
                          {blockInteraction && (
                            <div className="fixed inset-0 z-[9999] bg-background/90 backdrop-blur-sm flex items-center justify-center">
                              <div className="text-center space-y-4 p-8 max-w-2xl">
                                <h1 className="text-2xl font-bold">
                                  Please Complete Onboarding First
                                </h1>
                                <p className="text-muted-foreground">
                                  You need to finish the onboarding process before accessing the
                                  dashboard
                                </p>
                                <Button size="lg" onClick={() => router.push("/onboarding")}>
                                  Go to Onboarding
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </Navigation>
                    </>
                  )}
                </div>

                <Toaster />
                <div className="fixed bottom-4 right-4">
                  <Mascot mood="idle" />
                </div>
                <ShiftToast />
                <TimerToast />

                {/* 👇 Conditionally render AI components */}
                {isAssistantVisible && (
                  <>
                    <AIAssistantButton />
                    <AIAssistantPanel />
                  </>
                )}
                {isCharacterVisible && (
                  <>
                    <AICharacterDialog />
                    <AICharacterButton />
                  </>
                )}
              </TranslationProvider>
            </ThemeProvider>
          </AICharacterProvider>
        </AIAssistantProvider>
      </body>
    </html>
  )
}
