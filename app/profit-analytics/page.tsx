"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DateRangePicker } from "@/components/profit-analytics/date-range-picker"
import { ProfitOverview } from "@/components/profit-analytics/profit-overview"
import { ProfitComparison } from "@/components/profit-analytics/profit-comparison"
import { ProfitTable } from "@/components/profit-analytics/profit-table"
import { AIAssistant } from "@/components/profit-analytics/ai-assistant"
import { ProfitCharts } from "@/components/profit-analytics/profit-charts"
import { ViewToggle } from "@/components/profit-analytics/view-toggle"
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear, startOfDay, endOfDay } from "date-fns"
import Cookies from "js-cookie"
import { DateRange } from "react-day-picker"

interface ProfitSummary {
  totalRevenue: number
  totalExpenses: number
  profit: number
  mostCommonExpenseType: {
    type: string
    count: number
    totalSpent: number
  } | null
  bestSellingProduct: {
    productId: string
    name: string
    totalSold: number
    revenueGenerated: number
  } | null
  profitabilityInsight: string
}

interface ComparisonData {
  current: ProfitSummary | null
  previous: ProfitSummary | null
}

export default function ProfitAnalyticsPage() {
  const [view, setView] = useState<'year' | 'month' | 'day'>('month')
   const [comparisonRanges, setComparisonRanges] = useState<{
     current: DateRange
     previous: DateRange
   }>({
     current: { from: new Date(), to: new Date() },
     previous: { from: new Date(), to: new Date() }
   })
  const [dateRange, setDateRange] = useState<DateRange>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date())
  })
  const [profitSummary, setProfitSummary] = useState<ProfitSummary | null>(null)
  const [comparisonData, setComparisonData] = useState<ComparisonData>({
    current: null,
    previous: null
  })
  const [loading, setLoading] = useState(true)

  // Handle view changes
  useEffect(() => {
    const now = new Date()
    setDateRange({
      from: view === 'year' ? startOfYear(now) :
            view === 'month' ? startOfMonth(now) :
            startOfDay(now),
      to: view === 'year' ? endOfYear(now) :
          view === 'month' ? endOfMonth(now) :
          endOfDay(now)
    })
  }, [view])

  // Fetch main profit data
  useEffect(() => {
    const fetchProfitData = async () => {
      try {
        setLoading(true)
        const token = Cookies.get("token")
        if (!token || !dateRange.from) return

        const dateParam = format(dateRange.from, 'yyyy-MM-dd')
        const res = await fetch(
          `http://localhost:3000/sales/profit-summary?period=${view}&date=${dateParam}`,
          { headers: { Authorization: `Bearer ${token}` } }
        )

        if (!res.ok) throw new Error("Failed to fetch profit data")
        setProfitSummary(await res.json())
      } catch (error) {
        console.error('Fetch error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfitData()
  }, [view, dateRange.from])

  // Fetch comparison data
  const fetchComparison = async (currentRange: DateRange, previousRange: DateRange) => {
    try {
      const token = Cookies.get("token")
      if (!token || !currentRange.from || !previousRange.from) return

      const [currentRes, previousRes] = await Promise.all([
        fetch(`http://localhost:3000/sales/profit-summary?period=${view}&date=${format(currentRange.from, 'yyyy-MM-dd')}`,
          { headers: { Authorization: `Bearer ${token}` } }
        ),
        fetch(`http://localhost:3000/sales/profit-summary?period=${view}&date=${format(previousRange.from, 'yyyy-MM-dd')}`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
      ])

      if (!currentRes.ok || !previousRes.ok) throw new Error("Failed to fetch comparison data")
      
      setComparisonData({
        current: await currentRes.json(),
        previous: await previousRes.json()
      })
    } catch (error) {
      console.error('Comparison error:', error)
    }
  }

  if (loading) {
    return <div className="p-4 text-center">Loading profit data...</div>
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Profit Analytics</h1>
        <ViewToggle value={view} onValueChange={setView} />
      </div>

      <div className="flex items-center justify-between">
        <DateRangePicker
          view={view}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
        />
      </div>

      {profitSummary ? (
        <>
          <ProfitOverview 
            totalRevenue={profitSummary.totalRevenue}
            totalExpenses={profitSummary.totalExpenses}
            profit={profitSummary.profit}
            insight={profitSummary.profitabilityInsight}
          />

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Profit Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ProfitCharts 
                  revenue={profitSummary.totalRevenue}
                  expenses={profitSummary.totalExpenses}
                  profit={profitSummary.profit}
                  view={view}
                  dateRange={dateRange}
                />
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Period Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <ProfitComparison 
  view={view} // Add this line
  onPeriodChange={(current, previous) => {
    setComparisonRanges({ current, previous })
  }}
/>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Key Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <ProfitTable 
                bestProduct={profitSummary.bestSellingProduct}
                commonExpense={profitSummary.mostCommonExpenseType}
              />
            </CardContent>
          </Card>

          <AIAssistant insight={profitSummary.profitabilityInsight} />
        </>
      ) : (
        <div className="text-center">Failed to load profit data</div>
      )}
    </div>
  )
}