"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DateRangePicker } from "@/components/sales-analytics/date-range-picker"
import { SalesOverview } from "@/components/sales-analytics/sales-overview"
import { SalesComparison } from "@/components/sales-analytics/sales-comparison"
import { SalesTable } from "@/components/sales-analytics/sales-table"
import { AIAssistant } from "@/components/sales-analytics/ai-assistant"
import { SalesCharts } from "@/components/sales-analytics/sales-charts"
import { ViewToggle } from "@/components/sales-analytics/view-toggle"
import { endOfDay, endOfMonth, endOfYear, format, startOfDay, startOfMonth, startOfYear } from "date-fns"
import Cookies from "js-cookie"
import { DateRange } from "react-day-picker"

interface Sale {
  id: string
  productId: string
  quantity: number
  date: string
  createdAt: string
  userId: string
  product: {
    name: string
    price: number
  }
}

interface SummaryData {
  totalRevenue: number
  totalOrderCount: number
  averageOrderValue: number
  bestSellingProduct: {
    productId: string
    name: string
    totalSold: number
  }
}

interface Stats {
  sales: {
    today: number
    month: number
    year: number
    allTime: number
  }
  profit: {
    today: number
    month: number
    year: number
    allTime: number
  }
  expense: {
    today: number
    month: number
    year: number
    allTime: number
  }
}

export default function SalesAnalyticsPage() {
  const [view, setView] = useState<'year' | 'month' | 'day'>('month')
  const [comparisonRanges, setComparisonRanges] = useState<{
  current: DateRange
  previous: DateRange
}>({
  current: { from: new Date(), to: new Date() },
  previous: { from: new Date(), to: new Date() }
})
 const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
  from: startOfMonth(new Date()),  // Default to current month
  to: endOfMonth(new Date())
})
  
  const [salesData, setSalesData] = useState<Sale[]>([])
  const [summary, setSummary] = useState<SummaryData | null>(null)
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
const [comparisonData, setComparisonData] = useState<{
  current: Sale[]
  previous: Sale[]
}>({
  current: [],
  previous: []
})


// 2. Update the useEffect to handle view changes
useEffect(() => {
  // When view changes, reset to current period
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
 const fetchComparisonData = async (currentRange: DateRange, previousRange: DateRange) => {
  try {
    const token = Cookies.get("token")
    if (!currentRange.from || !currentRange.to || !previousRange.from || !previousRange.to) {
      throw new Error("Invalid date range")
    }
    
    // Format dates safely
    const formatDate = (date: Date) => format(date, 'yyyy-MM-dd')
    
    const [currentRes, previousRes] = await Promise.all([
      fetch(`http://localhost:3000/sales/by-period?period=custom&start=${formatDate(currentRange.from)}&end=${formatDate(currentRange.to)}`, {
        headers: { Authorization: `Bearer ${token}` }
      }),
      fetch(`http://localhost:3000/sales/by-period?period=custom&start=${formatDate(previousRange.from)}&end=${formatDate(previousRange.to)}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
    ])

    if (!currentRes.ok || !previousRes.ok) throw new Error("Failed to fetch comparison data")
    
    const currentData = await currentRes.json()
    const previousData = await previousRes.json()

    setComparisonData({
      current: currentData,
      previous: previousData
    })

  } catch (error) {
    console.error('Error fetching comparison data:', error)
  }
}
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const token = Cookies.get("token")
        if (!token) throw new Error("Authentication token not found")

        const dateParam = format(dateRange.from, 'yyyy-MM-dd')

        // Fetch combined summary data
        const [summaryRes, salesRes, statsRes] = await Promise.all([
          fetch(`http://localhost:3000/sales/summary?period=${view}&date=${dateParam}`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch('http://localhost:3000/sales', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch('http://localhost:3000/sales/Allstats', {
            headers: { Authorization: `Bearer ${token}` }
          })
        ])

        // Handle summary data
        if (!summaryRes.ok) throw new Error("Failed to fetch summary data")
        setSummary(await summaryRes.json())

        // Handle sales data
        if (!salesRes.ok) throw new Error("Failed to fetch sales data")
        const salesData = await salesRes.json()
        setSalesData(Array.isArray(salesData) ? salesData : [])

        // Handle stats data
        if (!statsRes.ok) throw new Error("Failed to fetch stats")
        setStats(await statsRes.json())

      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [view, dateRange])

  if (loading) {
    return <div className="p-4 text-center">Loading data...</div>
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Sales Analytics</h1>
        <ViewToggle value={view} onValueChange={setView} />
      </div>

      <div className="flex items-center justify-between">
        <DateRangePicker
          view={view}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
        />
      </div>

      {summary && (
  <SalesOverview 
    data={{
      orderCount: summary.totalOrderCount,
      averageSale: summary.averageOrderValue,
      totalRevenue: summary.totalRevenue,
      bestProduct: summary.bestSellingProduct?.name ?? "N/A"
    }} 
    dateRange={dateRange} 
  />
)}

      
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Sales Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <SalesCharts 
              data={salesData} 
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
    <SalesComparison 
      currentPeriod={comparisonData.current}
      previousPeriod={comparisonData.previous}
      view={view}
      onPeriodChange={(currentRange, previousRange) => {
        setComparisonRanges({ current: currentRange, previous: previousRange })
        fetchComparisonData(currentRange, previousRange)
      }}
    />
  </CardContent>
</Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sales Log</CardTitle>
        </CardHeader>
        <CardContent>
          <SalesTable 
            data={salesData.map(sale => ({
              id: sale.id,
              product: sale.product.name,
              quantity: sale.quantity,
              price: sale.product.price,
              total: sale.quantity * sale.product.price,
              date: format(new Date(sale.date), 'MMM dd, yyyy HH:mm')
            }))} 
            dateRange={dateRange} 
          />
        </CardContent>
      </Card>

      <AIAssistant data={salesData} />
    </div>
  )
}