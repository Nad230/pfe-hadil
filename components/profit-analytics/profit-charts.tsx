"use client"

import { useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
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
  Bar
} from "recharts"
import { format, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval } from "date-fns"
import { formatCurrency } from "@/lib/utils"

interface ProfitChartsProps {
  data: Array<{
    revenue: number
    expenses: number
    profit: number
    date: string
  }>
  view: 'year' | 'month' | 'day'
  dateRange: DateRange
}

export function ProfitCharts({ data, view, dateRange }: ProfitChartsProps) {
  const chartData = useMemo(() => {
if (!dateRange || !dateRange.from || !dateRange.to) return []

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
      default:
        periods = eachDayOfInterval(interval)
        break
    }

    return periods.map(periodStart => {
      const periodEnd = new Date(periodStart)
      switch (view) {
        case 'year':
          periodEnd.setMonth(periodEnd.getMonth() + 1)
          break
        case 'month':
          periodEnd.setDate(periodEnd.getDate() + 7)
          break
        case 'day':
          periodEnd.setDate(periodEnd.getDate() + 1)
          break
      }

    const periodData = Array.isArray(data)
  ? data.filter(entry => {
      const entryDate = new Date(entry.date)
      return entryDate >= periodStart && entryDate < periodEnd
    })
  : []


      const revenue = periodData.reduce((sum, entry) => sum + entry.revenue, 0)
      const expenses = periodData.reduce((sum, entry) => sum + entry.expenses, 0)
      const profit = revenue - expenses

      return {
        date: format(periodStart, view === 'day' ? 'MMM d' : view === 'month' ? 'MMM w' : 'MMM yyyy'),
        revenue,
        expenses,
        profit
      }
    })
  }, [data, view, dateRange])

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background p-4 rounded-lg shadow-lg border">
          <p className="font-medium">{label}</p>
          <p className="text-sm">
            Revenue: {formatCurrency(payload[0].payload.revenue)}
          </p>
          <p className="text-sm">
            Expenses: {formatCurrency(payload[0].payload.expenses)}
          </p>
          <p className="text-sm">
            Profit: {formatCurrency(payload[0].payload.profit)}
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
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
  tickFormatter={value => formatCurrency(value)}
  width={80}
  domain={['auto', 'auto']} // Add this to handle negative values
/>
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  name="Revenue"
                  stroke="hsl(var(--chart-1))"
                  strokeWidth={2}
                  dot={false}
                   strokeDasharray={chartData.some(d => d.profit < 0) ? "4 4" : "0"}
                />
                <Line
                  type="monotone"
                  dataKey="expenses"
                  name="Expenses"
                  stroke="hsl(var(--chart-2))"
                  strokeWidth={2}
                  dot={false}
                   strokeDasharray={chartData.some(d => d.profit < 0) ? "4 4" : "0"}
                />
                <Line
                  type="monotone"
                  dataKey="profit"
                  name="Profit"
                  stroke="hsl(var(--chart-3))"
                  strokeWidth={2}
                  dot={false}
                   strokeDasharray={chartData.some(d => d.profit < 0) ? "4 4" : "0"}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
  tickFormatter={value => formatCurrency(value)}
  width={80}
  domain={['auto', 'auto']} // Add this to handle negative values
/>
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="revenue"
                  name="Revenue"
                  fill="hsl(var(--chart-1))"
                  radius={[4, 4, 0, 0]}
                  baseline={0}
                />
                <Bar
                  dataKey="expenses"
                  name="Expenses"
                  fill="hsl(var(--chart-2))"
                  radius={[4, 4, 0, 0]}
                  baseline={0}
                />
                <Bar
                  dataKey="profit"
                  name="Profit"
                  fill="hsl(var(--chart-3))"
                  radius={[4, 4, 0, 0]}
                  baseline={0}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}