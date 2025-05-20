"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { DateRange } from "react-day-picker"
import { DateRangePicker } from "./date-range-picker"
import { ArrowUp, ArrowDown } from "lucide-react"
import { cn, formatCurrency } from "@/lib/utils"
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear, startOfDay, endOfDay } from "date-fns"
import Cookies from "js-cookie"
interface BestClient {
  clientId: string
  name: string
  totalRevenue: number
}

interface BestProject {
  projectId: string
  name: string
  totalRevenue: number
}

interface ComparisonData {
  periodA: {
    summary: {
      totalRevenue: number
      invoiceCount: number
      averageInvoiceValue: number
      bestClient: BestClient | null
      bestProject: BestProject | null
    }
  }
  periodB: {
    summary: {
      totalRevenue: number
      invoiceCount: number
      averageInvoiceValue: number
      bestClient: BestClient | null
      bestProject: BestProject | null
    }
  }
  differences: {
    revenuePctDiff: number | null
    invoiceCountPctDiff: number | null
    avgInvoiceValuePctDiff: number | null
  }
}

interface SalesComparisonProps {
  view: 'year' | 'month' | 'day'
  onPeriodChange: (currentRange: DateRange, previousRange: DateRange) => void
}
export function SalesComparison({ view, onPeriodChange }: SalesComparisonProps) {
  const [currentRange, setCurrentRange] = useState<DateRange>({ from: new Date(), to: new Date() })
  const [previousRange, setPreviousRange] = useState<DateRange>({ from: new Date(), to: new Date() })
  const [comparisonData, setComparisonData] = useState<ComparisonData | null>(null)
  const [loading, setLoading] = useState(false)

  const getRange = (date: Date, type: 'current' | 'previous') => {
    const adjustDate = (d: Date) => {
      if (type === 'previous') {
        return view === 'year' ? new Date(d.getFullYear() - 1, d.getMonth(), d.getDate())
          : view === 'month' ? new Date(d.getFullYear(), d.getMonth() - 1, d.getDate())
          : new Date(d.getTime() - 86400000) // Previous day
      }
      return d
    }

    const baseDate = adjustDate(date)
    return {
      from: view === 'year' ? startOfYear(baseDate)
        : view === 'month' ? startOfMonth(baseDate)
        : startOfDay(baseDate),
      to: view === 'year' ? endOfYear(baseDate)
        : view === 'month' ? endOfMonth(baseDate)
        : endOfDay(baseDate)
    }
  }

  useEffect(() => {
    const now = new Date()
    setCurrentRange(getRange(now, 'current'))
    setPreviousRange(getRange(now, 'previous'))
  }, [view])

  const fetchComparisonData = async () => {
    try {
      const token = Cookies.get("token")
      if (!token || !currentRange.from || !previousRange.from) return null
      
      const period = view
      const dateA = format(currentRange.from, 'yyyy-MM-dd')
      const dateB = format(previousRange.from, 'yyyy-MM-dd')

      const res = await fetch(
        `http://localhost:3000/sale-digital/compare-periods?period=${period}&dateA=${dateA}&dateB=${dateB}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (!res.ok) throw new Error("Failed to fetch comparison data")
      return await res.json()
    } catch (error) {
      console.error('Fetch error:', error)
      return null
    }
  }

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        const data = await fetchComparisonData()
        setComparisonData(data)
        onPeriodChange(currentRange, previousRange)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [currentRange, previousRange])

  const getPercentage = (value: number | null, current: number, previous: number) => {
    if (value !== null) return value
    if (previous === 0) return current === 0 ? 0 : 100
    return ((current - previous) / previous) * 100
  }

  const metrics = comparisonData ? [
    {
      label: "Total Sales",
      current: comparisonData.periodB.summary.totalRevenue,
      previous: comparisonData.periodA.summary.totalRevenue,
      change: getPercentage(
        comparisonData.differences.revenuePctDiff,
        comparisonData.periodB.summary.totalRevenue,
        comparisonData.periodA.summary.totalRevenue
      )
    },
    {
      label: "Orders",
      current: comparisonData.periodB.summary.invoiceCount,
      previous: comparisonData.periodA.summary.invoiceCount,
      change: getPercentage(
        comparisonData.differences.invoiceCountPctDiff,
        comparisonData.periodB.summary.invoiceCount,
        comparisonData.periodA.summary.invoiceCount
      )
    },
    {
      label: "Average Order",
      current: comparisonData.periodB.summary.averageInvoiceValue,
      previous: comparisonData.periodA.summary.averageInvoiceValue,
      change: getPercentage(
        comparisonData.differences.avgInvoiceValuePctDiff,
        comparisonData.periodB.summary.averageInvoiceValue,
        comparisonData.periodA.summary.averageInvoiceValue
      )
    }
  ] : []

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <p className="mb-2 text-sm font-medium">Current Period</p>
          <DateRangePicker
            view={view}
            dateRange={currentRange}
            onDateRangeChange={setCurrentRange}
          />
        </div>
        <div>
          <p className="mb-2 text-sm font-medium">Previous Period</p>
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
                <>

        <div className="grid gap-4 md:grid-cols-3">
          {metrics.map((metric) => {
            const isPositive = metric.change >= 0
            const currentValue = view === 'year' ? metric.current.toFixed(0) 
                            : view === 'month' ? metric.current.toFixed(1)
                            : metric.current.toFixed(2)
            const previousValue = view === 'year' ? metric.previous.toFixed(0) 
                             : view === 'month' ? metric.previous.toFixed(1)
                             : metric.previous.toFixed(2)

            return (
              <Card key={metric.label}>
                <CardContent className="pt-6">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    {metric.label}
                  </h3>
                  <div className="mt-2 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-2xl font-bold">
                        {metric.label.includes('Sales') || metric.label.includes('Average') 
                          ? formatCurrency(metric.current)
                          : metric.current}
                      </p>
                      <p className="text-sm text-muted-foreground">Current</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">
                        {metric.label.includes('Sales') || metric.label.includes('Average') 
                          ? formatCurrency(metric.previous)
                          : metric.previous}
                      </p>
                      <p className="text-sm text-muted-foreground">Previous</p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center">
                    {isPositive ? (
                      <ArrowUp className="h-4 w-4 text-green-500" />
                    ) : (
                      <ArrowDown className="h-4 w-4 text-red-500" />
                    )}
                    <span className={cn(
                      "ml-1 text-sm",
                      isPositive ? "text-green-500" : "text-red-500"
                    )}>
                      {Math.abs(metric.change).toFixed(1)}%
                    </span>
                  </div>
                </CardContent>
              </Card>
            )

          })}
           <Card>
              <CardContent className="pt-6">
                <h3 className="text-sm font-medium text-muted-foreground">Top Project</h3>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-lg font-semibold">
                      {comparisonData.periodB.summary.bestProject?.name || "N/A"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {comparisonData.periodB.summary.bestProject 
                        ? formatCurrency(comparisonData.periodB.summary.bestProject.totalRevenue)
                        : "Current period"}
                    </p>
                  </div>
                  <div>
                    <p className="text-lg font-semibold">
                      {comparisonData.periodA.summary.bestProject?.name || "N/A"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {comparisonData.periodA.summary.bestProject 
                        ? formatCurrency(comparisonData.periodA.summary.bestProject.totalRevenue)
                        : "Previous period"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      ) : (
        <div className="text-center">No comparison data available</div>
      )}
    </div>
  )
}