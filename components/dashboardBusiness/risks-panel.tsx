"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"
import { useEffect, useState } from "react"
import Cookies from "js-cookie"
import { useParams } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton"

interface Risk {
  id: string
  risk: string
  mitigation: string
}

export function RisksPanel() {
  const { startupPlanId } = useParams()
  const [risks, setRisks] = useState<Risk[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const cleanText = (text: string) => {
    try {
      return text
        .replace(/[\r\n]+/g, ' ')
        .replace(/[*\-]+/g, '')
        .replace(/\s+/g, ' ')
        .trim()
    } catch (error) {
      console.error("Error cleaning text:", error)
      return text // Return original text if cleaning fails
    }
  }

  useEffect(() => {
    const abortController = new AbortController()
    const signal = abortController.signal

    const fetchRisks = async (retries = 3) => {
      try {
        const token = Cookies.get("token")
        if (!token) throw new Error("Authentication failed")
        
        const response = await fetch(
          `http://localhost:3000/business-plan/startup/${startupPlanId}/risks`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            signal
          }
        )

        if (!response.ok) {
          if (response.status === 401) throw new Error("Authentication required")
          if (response.status >= 500 && retries > 0) {
            await new Promise(resolve => setTimeout(resolve, 1000 * (4 - retries)))
            return fetchRisks(retries - 1)
          }
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        if (!Array.isArray(data)) throw new Error("Invalid response format")

        setRisks(data)
        setError(null)
      } catch (err) {
        if (err.name === 'AbortError') {
          console.log('Fetch aborted')
          return
        }
        
        const message = err instanceof Error ? err.message : 'Failed to load risks'
        if (retries > 0) {
          await new Promise(resolve => setTimeout(resolve, 1000))
          return fetchRisks(retries - 1)
        }
        setError(message)
      } finally {
        setLoading(false)
      }
    }

    if (startupPlanId) {
      fetchRisks()
    } else {
      setLoading(false)
      setError("Invalid business plan ID")
    }

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
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-amber-500">
          <AlertTriangle className="h-5 w-5" />
          Critical Considerations
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {loading ? (
            Array(3).fill(0).map((_, i) => (
              <li key={i}>
                <Skeleton className="h-4 w-full" />
              </li>
            ))
          ) : risks.length > 0 ? (
            risks.map((risk) => {
              try {
                const riskText = cleanText(risk.risk)
                const mitigationText = cleanText(risk.mitigation)
                
                return (
                  <li key={risk.id} className="text-sm flex items-start gap-2 text-foreground/90">
                    <span className="text-red-500 font-bold mt-1">•</span>
                    <span>{riskText}: {mitigationText}</span>
                  </li>
                )
              } catch (error) {
                console.error("Error rendering risk:", error)
                return null
              }
            })
          ) : (
            <p className="text-muted-foreground text-sm">
              No critical considerations identified
            </p>
          )}
        </ul>
      </CardContent>
    </Card>
  )
}