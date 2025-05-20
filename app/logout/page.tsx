// app/logout/page.tsx
"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Cookies from "js-cookie"

export default function LogoutPage() {
  const router = useRouter()

  useEffect(() => {
    // Remove the token cookie
    Cookies.remove("token")
    
    // Redirect to auth page
    router.push("/auth")
    
    // Optional: Add a small delay for better UX
    setTimeout(() => {
      router.refresh() // Refresh the page to clear any state
    }, 500)
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-lg">Logging out...</p>
    </div>
  )
}