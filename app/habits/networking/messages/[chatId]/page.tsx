"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import  ChatContainer from "@/components/networking/chat/chat-container"
import { Button } from "@/components/ui/button"
import { ArrowLeft, AlertCircle, Loader2 } from "lucide-react"
import { motion } from "framer-motion"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useMobile } from "@/hooks/use-mobile"

export default function ChatPage() {
  const router = useRouter()
  const { chatId } = useParams() as { chatId: string }
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [chatExists, setChatExists] = useState(false)
  const isMobile = useMobile()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const verifyChatExists = async () => {
      try {
        // Check if we're on the client side before accessing localStorage
        if (typeof window === "undefined") return

        const token = localStorage.getItem("access_token")
        if (!token) {
          console.error("No token found in localStorage")
          setError("Authentication required. Please log in.")
          setIsLoading(false)
          return
        }

        console.log(`Verifying chat exists: ${chatId}`)
        console.log(`Using API URL: ${process.env.NEXT_PUBLIC_BACKEND_URL}/chats/${chatId}`)

        try {
          const chatResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/chats/${chatId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          })

          console.log(`Chat verification response status: ${chatResponse.status}`)

          if (!chatResponse.ok) {
            const errorText = await chatResponse.text()
            console.error(`Chat verification error: ${chatResponse.status} - ${errorText}`)

            if (chatResponse.status === 404) {
              setError("Chat not found. It may have been deleted or you don't have access.")
              setChatExists(false)
            } else {
              throw new Error(`Failed to load chat: ${chatResponse.status}`)
            }
            return
          }

          const chatData = await chatResponse.json()
          console.log("Chat data verified:", chatData)

          // Store chat data for reference
          localStorage.setItem("selectedChat", JSON.stringify(chatData))
          setChatExists(true)
        } catch (fetchError) {
          console.error("Fetch error:", fetchError)
          setError(`Network error: ${fetchError.message}`)
        }
      } catch (err) {
        console.error("Error verifying chat:", err)
        setError(err instanceof Error ? err.message : "Failed to load chat")
      } finally {
        setIsLoading(false)
        setLoading(false)
      }
    }

    if (chatId) {
      verifyChatExists()
    } else {
      setError("No chat ID provided")
      setIsLoading(false)
      setLoading(false)
    }
  }, [chatId])

  const handleBack = () => {
    router.push("/habits/networking/messages")
  }

  return (
    <motion.div
      className="h-[calc(100vh-4rem)] overflow-hidden bg-background"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex h-full relative">
        {/* Chat container */}
        <motion.div
          className="flex-1 flex flex-col h-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          {isLoading ? (
            <div className="flex flex-col h-full">
              <div className="flex items-center gap-4 p-4 border-b">
                <Button variant="ghost" size="icon" onClick={handleBack}>
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <Skeleton className="h-6 w-32" />
              </div>
              <div className="flex-1 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full p-6">
              <Alert variant="destructive" className="mb-4 max-w-md">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
              <Button variant="outline" onClick={handleBack} className="mt-4">
                Back to Messages
              </Button>
            </div>
          ) : chatExists ? (
            <ChatContainer chatId={chatId} onBack={handleBack} error={error} showBackButton={true} />
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-6">
              <div className="text-center mb-4">
                <h3 className="text-lg font-medium mb-2">Chat not found</h3>
                <p className="text-muted-foreground">This chat may have been deleted or you don't have access.</p>
              </div>
              <Button variant="outline" onClick={handleBack}>
                Back to Messages
              </Button>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  )
}
