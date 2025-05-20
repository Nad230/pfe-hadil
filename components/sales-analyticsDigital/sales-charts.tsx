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

interface SalesChartsProps {
  data: Array<{
    product: { price: number }
    quantity: number
    date: string
    invoice: {
      items: Array<{
        amount: number
      }>
    }
  }>
  view: 'year' | 'month' | 'day'
  dateRange: DateRange
}

export function SalesCharts({ data, view, dateRange }: SalesChartsProps) {
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

      const periodSales = data.filter(sale => {
        const saleDate = new Date(sale.date)
        return saleDate >= periodStart && saleDate < periodEnd
      })

      const totalSales = periodSales.reduce(
        (sum, sale) => sum + (sale.invoice?.items?.reduce((itemSum, item) => itemSum + (item.amount || 0), 0) || 0),
        0
      )
      const totalOrders = periodSales.length

      return {
        date: format(periodStart, view === 'day' ? 'MMM d' : view === 'month' ? 'MMM w' : 'MMM yyyy'),
        totalSales,
        totalOrders
      }
    })
  }, [data, view, dateRange])

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background p-4 rounded-lg shadow-lg border">
          <p className="font-medium">{label}</p>
          <p className="text-sm">
            Sales: {formatCurrency(payload[0].value)}
          </p>
          <p className="text-sm">
            Orders: {payload[0].payload.totalOrders}
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
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="totalSales"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={false}
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
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="totalOrders"
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}