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
  Bar,
  PieChart,
  Pie,
  Cell
} from "recharts"
import { format, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval } from "date-fns"
import { formatCurrency } from "@/lib/utils"

interface Expense {
  id: string
  title: string
  amount: number
  type: string
  repeat: boolean
  date: string
}

interface ExpensesChartsProps {
  data: Expense[]
  view: 'year' | 'month' | 'day'
  dateRange: DateRange
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

export function ExpensesCharts({ data, view, dateRange }: ExpensesChartsProps) {
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

    return periods.map(date => {
      const periodExpenses = data.filter(expense => {
        const expenseDate = new Date(expense.date)
        return expenseDate >= date && expenseDate < new Date(date.getTime() + (
          view === 'year' ? 31 * 24 * 60 * 60 * 1000 :
          view === 'month' ? 7 * 24 * 60 * 60 * 1000 :
          24 * 60 * 60 * 1000
        ))
      })

      const total = periodExpenses.reduce((sum, expense) => sum + expense.amount, 0)
      const recurring = periodExpenses.filter(e => e.repeat).reduce((sum, e) => sum + e.amount, 0)

      return {
        date: format(date, view === 'day' ? 'MMM d' : view === 'month' ? 'MMM w' : 'MMM yyyy'),
        total,
        recurring
      }
    })
  }, [data, view, dateRange])

  const typeData = useMemo(() => {
    const types = data.reduce((acc, expense) => {
      acc[expense.type] = (acc[expense.type] || 0) + expense.amount
      return acc
    }, {} as Record<string, number>)

    return Object.entries(types).map(([name, value]) => ({
      name,
      value
    }))
  }, [data])

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background p-4 rounded-lg shadow-lg border">
          <p className="font-medium">{payload[0].payload.date}</p>
          <p className="text-sm">Total: {formatCurrency(payload[0].value)}</p>
          <p className="text-sm">Recurring: {formatCurrency(payload[1].value)}</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardContent className="pt-6">
          <h3 className="mb-4 text-lg font-semibold">Expense Trends</h3>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis tickFormatter={value => formatCurrency(value)} />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="total"
                  name="Total"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="recurring"
                  name="Recurring"
                  stroke="hsl(var(--chart-2))"
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
            <h3 className="mb-4 text-lg font-semibold">Monthly Breakdown</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis tickFormatter={value => formatCurrency(value)} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Bar
                    dataKey="total"
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
            <h3 className="mb-4 text-lg font-semibold">Expense Types</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={typeData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    innerRadius={60}
                    paddingAngle={5}
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => 
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {typeData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS[index % COLORS.length]} 
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}