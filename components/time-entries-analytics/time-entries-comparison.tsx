"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { DateRange } from "react-day-picker"
import { DateRangePicker } from "./date-range-picker"
import { ArrowUp, ArrowDown } from "lucide-react"
import { formatDecimalHours } from "@/lib/utils/time"
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear, startOfDay, endOfDay } from "date-fns"
import Cookies from "js-cookie"

interface MostTimeSpentProject {
  name: string
  totalDuration: number
}

interface ComparisonData {
  periodA: {
    summary: {
      totalDuration: number
      entryCount: number
      averageDuration: number
      mostTimeSpentProject: MostTimeSpentProject | null
    }
  }
  periodB: {
    summary: {
      totalDuration: number
      entryCount: number
      averageDuration: number
      mostTimeSpentProject: MostTimeSpentProject | null
    }
  }
  differences: {
    durationPctDiff: number | null
    entryCountPctDiff: number | null
    avgDurationPctDiff: number | null
  }
}

interface TimeEntriesComparisonProps {
  view: 'year' | 'month' | 'day'
}

export function TimeEntriesComparison({ view }: TimeEntriesComparisonProps) {
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
        `http://localhost:3000/time-entry/compare-periods?period=${period}&dateA=${dateA}&dateB=${dateB}`,
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
      label: "Total Duration",
      current: comparisonData.periodB.summary.totalDuration,
      previous: comparisonData.periodA.summary.totalDuration,
      change: getPercentage(
        comparisonData.differences.durationPctDiff,
        comparisonData.periodB.summary.totalDuration,
        comparisonData.periodA.summary.totalDuration
      )
    },
    {
      label: "Entries",
      current: comparisonData.periodB.summary.entryCount,
      previous: comparisonData.periodA.summary.entryCount,
      change: getPercentage(
        comparisonData.differences.entryCountPctDiff,
        comparisonData.periodB.summary.entryCount,
        comparisonData.periodA.summary.entryCount
      )
    },
    {
      label: "Average Duration",
      current: comparisonData.periodB.summary.averageDuration,
      previous: comparisonData.periodA.summary.averageDuration,
      change: getPercentage(
        comparisonData.differences.avgDurationPctDiff,
        comparisonData.periodB.summary.averageDuration,
        comparisonData.periodA.summary.averageDuration
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
              const currentValue = formatDecimalHours(metric.current)
              const previousValue = formatDecimalHours(metric.previous)

              return (
                <Card key={metric.label}>
                  <CardContent className="pt-6">
                    <h3 className="text-sm font-medium text-muted-foreground">
                      {metric.label}
                    </h3>
                    <div className="mt-2 grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-2xl font-bold">{currentValue}</p>
                        <p className="text-sm text-muted-foreground">Current</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{previousValue}</p>
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
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-sm font-medium text-muted-foreground">Most Time Spent Project</h3>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-lg font-semibold">
                      {comparisonData.periodB.summary.mostTimeSpentProject?.name || "N/A"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {comparisonData.periodB.summary.mostTimeSpentProject 
                        ? formatDecimalHours(comparisonData.periodB.summary.mostTimeSpentProject.totalDuration)
                        : "Current period"}
                    </p>
                  </div>
                  <div>
                    <p className="text-lg font-semibold">
                      {comparisonData.periodA.summary.mostTimeSpentProject?.name || "N/A"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {comparisonData.periodA.summary.mostTimeSpentProject 
                        ? formatDecimalHours(comparisonData.periodA.summary.mostTimeSpentProject.totalDuration)
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