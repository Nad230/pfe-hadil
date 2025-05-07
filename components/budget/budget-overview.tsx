"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { DollarSign, TrendingDown, PiggyBank, AlertTriangle, Loader2 } from "lucide-react"
import { useEffect, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import Cookies from "js-cookie"

export function BudgetOverview() {
  const [budgetRange, setBudgetRange] = useState<number>(0)
  const [totalExpenses, setTotalExpenses] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBudgetData = async () => {
      try {
        const token = Cookies.get("token")
        const [budgetResponse, expensesResponse] = await Promise.all([
          fetch("http://localhost:3000/userlocation/location", {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }),
          fetch("http://localhost:3000/expenses/total", {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          })
          
        ])

        if (!budgetResponse.ok || !expensesResponse.ok) {
          throw new Error('Failed to fetch budget data')
        }
        

        const budgetData = await budgetResponse.json()
        const expensesData = await expensesResponse.json()

        console.log(expensesData)

        setBudgetRange(budgetData.BudgetRange)
        setTotalExpenses(expensesData.totalAmount)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load budget data')
      } finally {
        setLoading(false)
      }
    }

    fetchBudgetData()
  }, [])

  const remainingBudget = budgetRange - totalExpenses
  const progress = budgetRange > 0 ? Math.min((totalExpenses / budgetRange) * 100, 100) : 0

  const getAlertMessage = () => {
    if (totalExpenses > budgetRange) {
      return {
        message: "Budget exceeded! Review expenses immediately.",
        color: "text-red-500",
        iconColor: "text-red-500"
      }
    }
    if (progress >= 80) {
      return {
        message: "Approaching budget limit! Monitor spending carefully.",
        color: "text-yellow-500",
        iconColor: "text-yellow-500"
      }
    }
    return {
      message: "You're under budget! Great job managing expenses.",
      color: "text-green-500",
      iconColor: "text-green-500"
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Budget Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-4 rounded-lg">
                <Skeleton className="h-5 w-5 mb-2" />
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-8 w-[150px] mt-2" />
              </div>
            ))}
          </div>
          <Skeleton className="h-4 w-[200px]" />
          <Skeleton className="h-2 w-full" />
          <Skeleton className="h-6 w-full" />
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
        <CardTitle>Budget Overview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-green-500/10 rounded-lg">
            <DollarSign className="h-5 w-5 text-green-500 mb-2" />
            <p className="text-sm text-muted-foreground">Total Budget</p>
            <p className="text-2xl font-bold">${(budgetRange ?? 0).toLocaleString()}</p>
            </div>
          
          <div className="p-4 bg-red-500/10 rounded-lg">
            <TrendingDown className="h-5 w-5 text-red-500 mb-2" />
            <p className="text-sm text-muted-foreground">Spent</p>
            <p className="text-2xl font-bold">
  ${(totalExpenses ?? 0).toLocaleString()}
</p>

          </div>
          
          <div className="p-4 bg-blue-500/10 rounded-lg">
            <PiggyBank className="h-5 w-5 text-blue-500 mb-2" />
            <p className="text-sm text-muted-foreground">Remaining</p>
            <p className="text-2xl font-bold">${isNaN(remainingBudget) ? 0 : remainingBudget.toLocaleString()}</p>
            </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Budget Usage</span>
            <span>{isNaN(progress) ? 0 : Math.round(progress)}%</span>
            </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className={`flex items-start gap-2 p-4 ${getAlertMessage().color}/10 rounded-lg`}>
          <AlertTriangle className={`h-5 w-5 ${getAlertMessage().iconColor} mt-0.5`} />
          <p className={`text-sm ${getAlertMessage().color}`}>{getAlertMessage().message}</p>
        </div>
      </CardContent>
    </Card>
  )
}