"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DateRangePicker } from "@/components/expenses-analytics/date-range-picker"
import { ExpensesOverview } from "@/components/expenses-analytics/expenses-overview"
import { ExpensesComparison } from "@/components/expenses-analytics/expenses-comparison"
import { ExpensesTable } from "@/components/expenses-analytics/expenses-table"
import { AIAssistant } from "@/components/expenses-analytics/ai-assistant"
import { ExpensesCharts } from "@/components/expenses-analytics/expenses-charts"
import { ViewToggle } from "@/components/expenses-analytics/view-toggle"
import { endOfDay, endOfMonth, endOfYear, format, startOfDay, startOfMonth, startOfYear } from "date-fns"
import Cookies from "js-cookie"
import { DateRange } from "react-day-picker"

interface Expense {
  id: string
  title: string
  amount: number
  type: string
  repeat: boolean
  repeatType: string | null
  date: string
  createdAt: string
}

interface SummaryData {
  totalAmount: number
  totalCount: number
  averageAmount: number
  mostCommonType: {
    type: string
    count: number
  }
}

interface Stats {
  totalAmount: number
  todayCount: number
  mostCommonType: {
    type: string
    count: number
  }
  typeBreakdown: Array<{
    type: string
    count: number
  }>
}

export default function ExpensesAnalyticsPage() {
  const [view, setView] = useState<'year' | 'month' | 'day'>('month')
  const [comparisonRanges, setComparisonRanges] = useState<{
  current: DateRange
  previous: DateRange
}>({
  current: { from: new Date(), to: new Date() },
  previous: { from: new Date(), to: new Date() }
})
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date())
  })
  const [expensesData, setExpensesData] = useState<Expense[]>([])
  const [summary, setSummary] = useState<SummaryData | null>(null)
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const token = Cookies.get("token")
        if (!token) throw new Error("Authentication token not found")

        const dateParam = format(dateRange.from, 'yyyy-MM-dd')

        const [expensesRes, summaryRes, statsRes] = await Promise.all([
          fetch(`http://localhost:3000/expenses/by-period?period=${view}&date=${dateParam}`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch(`http://localhost:3000/expenses/summary?period=${view}&date=${dateParam}`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch(`http://localhost:3000/expenses/type-breakdown?period=${view}&date=${dateParam}`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ])

        if (!expensesRes.ok) throw new Error("Failed to fetch expenses")
        if (!summaryRes.ok) throw new Error("Failed to fetch summary")
        if (!statsRes.ok) throw new Error("Failed to fetch stats")

        const expenses = await expensesRes.json()
        const summaryData = await summaryRes.json()
        const typeBreakdown = await statsRes.json()

        setExpensesData(expenses)
        setSummary(summaryData)
        setStats({
          totalAmount: summaryData.totalAmount,
          todayCount: summaryData.totalCount,
          mostCommonType: summaryData.mostCommonType,
          typeBreakdown
        })

      } catch (error) {
        console.error("Failed to fetch data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [view, dateRange])

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Expenses Analytics</h1>
        <ViewToggle value={view} onValueChange={setView} />
      </div>

      <div className="flex items-center justify-between">
        <DateRangePicker
          view={view}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
        />
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          {summary && stats && (
            <ExpensesOverview 
              summary={summary}
              stats={stats}
              dateRange={dateRange}
            />
          )}

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Expenses Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ExpensesCharts 
                  data={expensesData} 
                  view={view} 
                  dateRange={dateRange} 
                  stats={stats}
                />
              </CardContent>
            </Card>

           <Card className="md:col-span-2">
  <CardHeader>
    <CardTitle>Period Comparison</CardTitle>
  </CardHeader>
  <CardContent>
    <ExpensesComparison 
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
              <CardTitle>Expenses Log</CardTitle>
            </CardHeader>
            <CardContent>
              <ExpensesTable 
                data={expensesData} 
                dateRange={dateRange} 
              />
            </CardContent>
          </Card>
        </>
      )}

      <AIAssistant />
    </div>
  )
}