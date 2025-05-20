"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { DollarSign, TrendingDown, PiggyBank, AlertTriangle, Loader2 } from "lucide-react"
import { useEffect, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import Cookies from "js-cookie"

const parseJSONSafely = async (response: Response) => {
  const text = await response.text()
  try {
    return text ? JSON.parse(text) : null
  } catch (err) {
    console.error('Failed to parse JSON:', text)
    throw new Error(`Invalid JSON response: ${text.slice(0, 50)}`)
  }
}

export function BudgetPanel() {
  const [budgetRange, setBudgetRange] = useState<number>(0)
  const [totalExpenses, setTotalExpenses] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  const fetchBudgetData = async (signal?: AbortSignal) => {
    try {
      const token = Cookies.get("token")
      if (!token) throw new Error("Authentication required")

      const [budgetResponse, expensesResponse] = await Promise.all([
        fetch("http://localhost:3000/userlocation/location", {
          headers: { Authorization: `Bearer ${token}` },
          signal
        }),
        fetch("http://localhost:3000/expenses/total", {
          headers: { Authorization: `Bearer ${token}` },
          signal
        })
      ])

      let budgetValue = 0
      let expensesValue = 0
      let hasError = false
      const errors = []

      // Process budget response
      if (budgetResponse.ok) {
        try {
          const budgetData = await parseJSONSafely(budgetResponse)
          budgetValue = Number(budgetData?.BudgetRange) || 0
        } catch (err) {
          errors.push("Invalid budget data format")
          hasError = true
        }
      } else {
        errors.push(`Budget API: ${budgetResponse.status}`)
        hasError = true
      }

      // Process expenses response
      if (expensesResponse.ok) {
        try {
          const expensesData = await parseJSONSafely(expensesResponse)
          expensesValue = Number(expensesData?.totalAmount) || 0
        } catch (err) {
          errors.push("Invalid expenses data format")
          hasError = true
        }
      } else {
        errors.push(`Expenses API: ${expensesResponse.status}`)
        hasError = true
      }

      if (hasError) {
        throw new Error(errors.join(" | "))
      }

      setBudgetRange(budgetValue)
      setTotalExpenses(expensesValue)
      setError(null)
    } catch (err) {
      if (retryCount < 3) {
        setRetryCount(c => c + 1)
        return
      }
      setError(err instanceof Error ? err.message : 'Failed to load budget data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const abortController = new AbortController()
    const retryTimer = setTimeout(() => {
      fetchBudgetData(abortController.signal)
    }, retryCount * 1000) // Exponential backoff

    return () => {
      abortController.abort()
      clearTimeout(retryTimer)
    }
  }, [retryCount])



  const remainingBudget = budgetRange - totalExpenses
  const progress = budgetRange > 0 
    ? Math.min((totalExpenses / budgetRange) * 100, 100)
    : 0

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Skeleton className="h-5 w-5 rounded-full" />
            <Skeleton className="h-6 w-[150px]" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-8 w-[120px]" />
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-[200px]" />
            <Skeleton className="h-2 w-full" />
          </div>
        </CardContent>
      </Card>
    )
  }

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
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-green-500" />
          Budget Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Total Budget</p>
            <p className="text-2xl font-bold">
              ${(budgetRange ?? 0).toLocaleString()}
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Spent</p>
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-red-500" />
              <p className="text-2xl font-bold">
                ${(totalExpenses ?? 0).toLocaleString()}
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Remaining</p>
            <div className="flex items-center gap-2">
              <PiggyBank className="h-4 w-4 text-blue-500" />
              <p className="text-2xl font-bold">
                ${isNaN(remainingBudget) ? 0 : remainingBudget.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span>{isNaN(progress) ? 0 : Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </CardContent>
    </Card>
  )
}