"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { DateRange } from "react-day-picker"
import { DateRangePicker } from "./date-range-picker"
import { ArrowUp, ArrowDown, Badge } from "lucide-react"
import { cn, formatCurrency } from "@/lib/utils"
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear, startOfDay, endOfDay } from "date-fns"
import Cookies from "js-cookie"

interface ExpenseComparisonData {
  periodA: {
    date: string
    summary: {
      totalAmount: number
      totalCount: number
      averageAmount: number
      mostCommonType: {
        type: string
        count: number
      } | null
    }
  }
  periodB: {
    date: string
    summary: {
      totalAmount: number
      totalCount: number
      averageAmount: number
      mostCommonType: {
        type: string
        count: number
      } | null
    }
  }
  differences: {
    amountPctDiff: number
    countPctDiff: number
    averagePctDiff: number
  }
}

interface ExpensesComparisonProps {
  view: 'year' | 'month' | 'day'
  onPeriodChange: (currentRange: DateRange, previousRange: DateRange) => void
}

export function ExpensesComparison({ view, onPeriodChange }: ExpensesComparisonProps) {
  const [currentRange, setCurrentRange] = useState<DateRange>(getInitialRange(true))
  const [previousRange, setPreviousRange] = useState<DateRange>(getInitialRange(false))
  const [comparisonData, setComparisonData] = useState<ExpenseComparisonData | null>(null)
  const [loading, setLoading] = useState(false)

  function getInitialRange(isCurrent: boolean): DateRange {
    const now = new Date()
    switch(view) {
      case 'year': {
        const year = now.getFullYear() - (isCurrent ? 0 : 1)
        return { 
          from: startOfYear(new Date(year, 0, 1)), 
          to: endOfYear(new Date(year, 11, 31))
        }
      }
      case 'month': {
        const month = now.getMonth() - (isCurrent ? 0 : 1)
        const year = now.getFullYear()
        return { 
          from: startOfMonth(new Date(year, month)), 
          to: endOfMonth(new Date(year, month))
        }
      }
      default: {
        const dayOffset = isCurrent ? 0 : 1
        const baseDate = new Date(now.getTime() - 86400000 * dayOffset)
        return { 
          from: startOfDay(baseDate), 
          to: endOfDay(baseDate)
        }
      }
    }
  }

  useEffect(() => {
    const now = new Date()
    setCurrentRange(getInitialRange(true))
    setPreviousRange(getInitialRange(false))
  }, [view])

  useEffect(() => {
    const fetchComparison = async () => {
      setLoading(true)
      try {
        const token = Cookies.get("token")
        if (!token || !currentRange.from || !previousRange.from) return

        const params = new URLSearchParams({
          period: view,
          dateA: format(currentRange.from, 'yyyy-MM-dd'),
          dateB: format(previousRange.from, 'yyyy-MM-dd')
        })

        const res = await fetch(`http://localhost:3000/expenses/compare-periods?${params}`, {
          headers: { Authorization: `Bearer ${token}` }
        })

        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
        const data = await res.json()
        
        setComparisonData(data)
        onPeriodChange(currentRange, previousRange)
      } catch (error) {
        console.error("Expenses comparison error:", error)
        setComparisonData(null)
      } finally {
        setLoading(false)
      }
    }

    fetchComparison()
  }, [currentRange, previousRange, view])

  const metrics = comparisonData ? [
    {
      label: "Total Expenses",
      current: comparisonData.periodA.summary.totalAmount,
      previous: comparisonData.periodB.summary.totalAmount,
      change: comparisonData.differences.amountPctDiff
    },
    {
      label: "Transactions",
      current: comparisonData.periodA.summary.totalCount,
      previous: comparisonData.periodB.summary.totalCount,
      change: comparisonData.differences.countPctDiff
    },
    {
      label: "Average Expense",
      current: comparisonData.periodA.summary.averageAmount,
      previous: comparisonData.periodB.summary.averageAmount,
      change: comparisonData.differences.averagePctDiff
    }
  ] : []

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-sm">
              Current Period
            </Badge>
            <span className="text-sm text-muted-foreground">
              {format(currentRange.from!, 'MMM dd, yyyy')} - {format(currentRange.to!, 'MMM dd, yyyy')}
            </span>
          </div>
          <DateRangePicker
            view={view}
            dateRange={currentRange}
            onDateRangeChange={setCurrentRange}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-sm">
              Previous Period
            </Badge>
            <span className="text-sm text-muted-foreground">
              {format(previousRange.from!, 'MMM dd, yyyy')} - {format(previousRange.to!, 'MMM dd, yyyy')}
            </span>
          </div>
          <DateRangePicker
            view={view}
            dateRange={previousRange}
            onDateRangeChange={setPreviousRange}
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center">Loading comparison data...</div>
      ) : comparisonData ? (
        <div className="space-y-8">
          <div className="grid gap-4 md:grid-cols-3">
            {metrics.map((metric) => {
              const isPositive = metric.change >= 0
              const currentValue = formatCurrency(metric.current)
              const previousValue = formatCurrency(metric.previous)

              return (
                <Card key={metric.label}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium">{metric.label}</h3>
                      <div className="flex items-center">
                        <span className={cn(
  "text-sm",
  isPositive ? "text-green-500" : "text-red-500"
)}>
  {metric.previous === 0 
  ? (metric.current === 0 ? '0%' : '∞%') 
  : (typeof metric.change === 'number' 
      ? `${isPositive ? '+' : ''}${metric.change.toFixed(1)}%` 
      : 'N/A')}

</span>
                       {metric.previous !== 0 && (
  isPositive ? (
    <ArrowUp className="h-4 w-4 text-green-500" />
  ) : (
    <ArrowDown className="h-4 w-4 text-red-500" />
  )
)}
                      </div>
                    </div>
                    
                    <div className="mt-4 space-y-2">
                      <div>
                        <p className="text-2xl font-bold">{currentValue}</p>
                        <p className="text-xs text-muted-foreground">Current Period</p>
                      </div>
                      <div className="pt-2 border-t">
                        <p className="text-lg text-muted-foreground">{previousValue}</p>
                        <p className="text-xs text-muted-foreground">Previous Period</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">Common Expense Comparison</h3>
              <div className="grid gap-8 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Current Period</span>
                    <Badge variant="secondary">
                      {format(currentRange.from!, 'MMM yyyy')}
                    </Badge>
                  </div>
                  {comparisonData.periodA.summary.mostCommonType ? (
                    <div className="space-y-1">
                      <p className="text-xl font-bold">
                        {comparisonData.periodA.summary.mostCommonType.type}
                      </p>
                      <div className="text-sm text-muted-foreground">
                        {comparisonData.periodA.summary.mostCommonType.count} transactions
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No common expense type</p>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Previous Period</span>
                    <Badge variant="secondary">
                      {format(previousRange.from!, 'MMM yyyy')}
                    </Badge>
                  </div>
                  {comparisonData.periodB.summary.mostCommonType ? (
                    <div className="space-y-1">
                      <p className="text-xl font-bold">
                        {comparisonData.periodB.summary.mostCommonType.type}
                      </p>
                      <div className="text-sm text-muted-foreground">
                        {comparisonData.periodB.summary.mostCommonType.count} transactions
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No common expense type</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="text-center">No comparison data available</div>
      )}
    </div>
  )
}