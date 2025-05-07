"use client"
import { Card, CardContent } from "@/components/ui/card"
import { Lightbulb } from "lucide-react"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import Cookies from "js-cookie"
import { useParams } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton"

interface Tip {
  content: string
  author?: string
}

const fetchWithTimeout = (url: string, options = {}, timeout = 8000) => {
  return Promise.race([
    fetch(url, options),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout')), timeout)
    )
  ])
}

export function MotivationalTip() {
  const { startupPlanId } = useParams()
  const [tip, setTip] = useState<Tip | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const cleanText = (text?: string) => {
    try {
      if (!text) return ''
      return text
        .replace(/[\r\n]+/g, ' ')
        .replace(/[*\-]+/g, '')
        .replace(/\s+/g, ' ')
        .trim()
    } catch (error) {
      console.error("Error cleaning text:", error)
      return text || ''
    }
  }

  useEffect(() => {
    const abortController = new AbortController()
    const signal = abortController.signal

    const fetchTip = async (retries = 3) => {
      try {
        const token = Cookies.get("token")
        if (!token) throw new Error("Authentication failed")
        if (!startupPlanId) throw new Error("Invalid business plan ID")

        const response = await fetchWithTimeout(
          `http://localhost:3000/business-plan/startup/${startupPlanId}/tips`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            signal
          }
        ) as Response

        if (!response.ok) {
          if (response.status === 401) throw new Error("Authentication required")
          if (response.status >= 500 && retries > 0) {
            await new Promise(resolve => setTimeout(resolve, 1000 * (4 - retries)))
            return fetchTip(retries - 1)
          }
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        if (!Array.isArray(data)) throw new Error("Invalid response format")
        
        const validTip = data[0]?.content ? {
          content: data[0].content,
          author: data[0]?.author
        } : null

        setTip(validTip)
        setError(null)
      } catch (err) {
        if (err.name === 'AbortError') return
        
        const message = err instanceof Error ? err.message : 'Failed to load tip'
        if (retries > 0) {
          await new Promise(resolve => setTimeout(resolve, 1000))
          return fetchTip(retries - 1)
        }
        setError(message)
      } finally {
        setLoading(false)
      }
    }

    fetchTip()

    return () => abortController.abort()
  }, [startupPlanId])

  if (error) {
    return (
      <Card>
        <CardContent className="p-4 text-destructive">
          Error: {error}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-start gap-4"
        >
          <div className="rounded-full p-3 bg-yellow-500/10 text-yellow-500">
            <Lightbulb className="h-6 w-6" />
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold">Daily Inspiration</h3>
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-4 w-[150px]" />
              </div>
            ) : tip ? (
              <>
                <p className="text-sm text-muted-foreground">
                  "{cleanText(tip.content)}"
                </p>
                {tip.author && (
                  <p className="text-xs text-muted-foreground italic">
                    — {cleanText(tip.author)}
                  </p>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                No tips available today
              </p>
            )}
          </div>
        </motion.div>
      </CardContent>
    </Card>
  )
}