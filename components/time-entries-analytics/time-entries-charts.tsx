"use client"

import { useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { TimeEntry } from "@/lib/types/time-tracker"
import { DateRange } from "react-day-picker"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from "recharts"
import { format, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval } from "date-fns"
import { formatDecimalHours, formatDuration } from "@/lib/utils/time"

interface TimeEntriesChartsProps {
  data: TimeEntry[]
  view: 'year' | 'month' | 'day'
  dateRange: DateRange
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

export function TimeEntriesCharts({ data, view, dateRange }: TimeEntriesChartsProps) {
  const chartData = useMemo(() => {
    if (!dateRange.from || !dateRange.to) return []

    const interval = { start: dateRange.from, end: dateRange.to }
    let periods: Date[]

    switch (view) {
      case 'year':
        periods = eachMonthOfInterval(interval)
        break
      case 'month':
        periods = eachWeekOfInterval(interval)
        break
      case 'day':
        periods = eachDayOfInterval(interval)
        break
    }

    return periods.map(date => {
      const periodEntries = data.filter(entry => {
        const entryDate = new Date(entry.startTime)
        switch (view) {
          case 'year':
            return entryDate.getMonth() === date.getMonth() &&
                   entryDate.getFullYear() === date.getFullYear()
          case 'month':
            return entryDate >= date &&
                   entryDate < new Date(date.getFullYear(), date.getMonth(), date.getDate() + 7)
          case 'day':
            return entryDate.toDateString() === date.toDateString()
        }
      })

      const totalDuration = periodEntries.reduce((sum, entry) => sum + entry.duration, 0)
      const entries = periodEntries.length

      return {
        date: format(date, view === 'day' ? 'MMM d' : view === 'month' ? 'MMM w' : 'MMM yyyy'),
        duration: totalDuration,
        entries
      }
    })
  }, [data, view, dateRange])

  const projectData = useMemo(() => {
    const projects = data.reduce((acc, entry) => {
      acc[entry.projectId] = (acc[entry.projectId] || 0) + entry.duration
      return acc
    }, {} as Record<string, number>)

    return Object.entries(projects).map(([id, duration]) => ({
      name: id,
      value: duration
    }))
  }, [data])

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background p-4 rounded-lg border shadow-lg">
          <p className="font-medium">{payload[0].payload.date}</p>
          <p className="text-sm text-muted-foreground">
  Duration: {formatDecimalHours(payload[0].value)}
</p>

        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardContent className="pt-6">
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
<YAxis tickFormatter={(value) => formatDecimalHours(value)} />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="duration"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <h3 className="mb-4 text-lg font-semibold">Time Distribution</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis tickFormatter={(value) => formatDuration(value)} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="duration"
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h3 className="mb-4 text-lg font-semibold">Project Distribution</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={projectData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => 
                      `${name} (${formatDuration(value)})`
                    }
                  >
                    {projectData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}