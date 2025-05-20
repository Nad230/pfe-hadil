"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DateRangePicker } from "@/components/time-entries-analytics/date-range-picker"
import { TimeEntriesOverview } from "@/components/time-entries-analytics/time-entries-overview"
import { TimeEntriesComparison } from "@/components/time-entries-analytics/time-entries-comparison"
import { TimeEntriesTable } from "@/components/time-entries-analytics/time-entries-table"
import { AIAssistant } from "@/components/time-entries-analytics/ai-assistant"
import { TimeEntriesCharts } from "@/components/time-entries-analytics/time-entries-charts"
import { ViewToggle } from "@/components/time-entries-analytics/view-toggle"
import { format, startOfMonth, endOfMonth, startOfDay, endOfDay, startOfYear, endOfYear } from "date-fns"
import Cookies from "js-cookie"
import { DateRange } from "react-day-picker"

interface TimeEntry {
  id: string
  startTime: string
  endTime: string | null
  duration: number | null
  project: {
    name: string
  }
  task: {
    name: string
  }
  notes: string | null
  status: string
}

interface SummaryData {
  totalDuration: number
  entryCount: number
  averageDuration: number
  mostTimeSpentProject: {
    name: string
    totalDuration: number
  }
}

interface StatsData {
  today: number
  weekly: number
  monthly: number
  projectsTracked: number
}

export default function TimeEntriesAnalyticsPage() {
  const [view, setView] = useState<'year' | 'month' | 'day'>('month')
  const [dateRange, setDateRange] = useState<DateRange>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date())
  })
  const [entries, setEntries] = useState<TimeEntry[]>([])
  const [summary, setSummary] = useState<SummaryData | null>(null)
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const token = Cookies.get("token")
        if (!token) throw new Error("Authentication token not found")

        const dateParam = format(dateRange.from || new Date(), 'yyyy-MM-dd')

        const [entriesRes, summaryRes, statsRes] = await Promise.all([
          fetch(`http://localhost:3000/time-entry/by-period?period=${view}&date=${dateParam}`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch(`http://localhost:3000/time-entry/summary?period=${view}&date=${dateParam}`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch(`http://localhost:3000/time-entry/stats`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ])

        if (!entriesRes.ok) throw new Error("Failed to fetch entries")
        if (!summaryRes.ok) throw new Error("Failed to fetch summary")
        if (!statsRes.ok) throw new Error("Failed to fetch stats")

        const entriesData = await entriesRes.json()
        const summaryData = await summaryRes.json()
        const statsData = await statsRes.json()

        setEntries(entriesData)
        setSummary(summaryData)
        setStats(statsData)

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
        <h1 className="text-3xl font-bold tracking-tight">Time Entries Analytics</h1>
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
            <TimeEntriesOverview 
              summary={summary}
              stats={stats}
              dateRange={dateRange}
            />
          )}

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Time Tracking Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <TimeEntriesCharts 
                  data={entries} 
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
                <TimeEntriesComparison />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Time Entries Log</CardTitle>
            </CardHeader>
            <CardContent>
              <TimeEntriesTable 
                data={entries} 
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