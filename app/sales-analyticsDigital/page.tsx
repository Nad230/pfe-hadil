"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DateRangePicker } from "@/components/sales-analyticsDigital/date-range-picker"
import { SalesOverview } from "@/components/sales-analyticsDigital/sales-overview"
import { SalesComparison } from "@/components/sales-analyticsDigital/sales-comparison"
import { SalesTable } from "@/components/sales-analyticsDigital/sales-table"
import { AIAssistant } from "@/components/sales-analyticsDigital/ai-assistant"
import { SalesCharts } from "@/components/sales-analyticsDigital/sales-charts"
import { ViewToggle } from "@/components/sales-analyticsDigital/view-toggle"
import { endOfDay, endOfMonth, endOfYear, format, startOfDay, startOfMonth, startOfYear } from "date-fns"
import Cookies from "js-cookie"
import { DateRange } from "react-day-picker"
interface InvoiceItem {
  id: string
  description: string
  amount: number
}

// Wrong existing interface
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
interface Client {
  id: string
  name: string
}

interface Project {
  id: string
  name: string
  tags: string[]
  status: string
}

interface Invoice {
  id: string
  status: string
  dueDate: string
  client: Client
  project: Project
  items: InvoiceItem[]
}

interface InvoiceSale {
  id: string
  invoiceId: string
  date: string
  createdAt: string
  userId: string
  invoice: Invoice
}

interface SummaryData {
  totalRevenue: number
  invoiceCount: number
  averageInvoiceValue: number
  bestClient: {
    clientId: string
    name: string
    totalRevenue: number
  }
  bestProject: {
    projectId: string
    name: string
    totalRevenue: number
  }
}

interface Stats {
  salesDigital: {
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
  
const [salesData, setSalesData] = useState<InvoiceSale[]>([]) // Use InvoiceSale type
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
     // In the fetchData function:
const [summaryRes, salesRes, statsRes] = await Promise.all([
  fetch(`http://localhost:3000/sale-digital/summary?period=${view}&date=${dateParam}`, {
    headers: { Authorization: `Bearer ${token}` }
  }),
  fetch('http://localhost:3000/sale-digital', {
    headers: { Authorization: `Bearer ${token}` }
  }),
  fetch('http://localhost:3000/sale-digital/Allstats', {
    headers: { Authorization: `Bearer ${token}` }
  })
]);
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
    invoiceCount: summary.invoiceCount,
    averageInvoiceValue: summary.averageInvoiceValue,
    totalRevenue: summary.totalRevenue,
    bestClient: summary.bestClient,  // Pass the full object
    bestProject: summary.bestProject  // Pass the full object
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
      view={view}
      onPeriodChange={(currentRange, previousRange) => {
        setComparisonRanges({ current: currentRange, previous: previousRange })
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
  data={salesData}
  dateRange={dateRange}
/>
        </CardContent>
      </Card>

      <AIAssistant data={salesData} />
    </div>
  )
}