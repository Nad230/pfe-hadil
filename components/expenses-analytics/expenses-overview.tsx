"use client"

import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Wallet, Receipt, DollarSign, LineChart, Zap } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { DateRange } from "react-day-picker"

interface ExpensesOverviewProps {
  summary: {
    totalAmount: number
    totalCount: number
    averageAmount: number
    mostCommonType: {
      type: string
      count: number
    }
  }
  stats: {
    todayCount: number
    mostCommonType: {
      type: string
      count: number
    }
  }
  dateRange: DateRange
}

export function ExpensesOverview({ summary, stats }: ExpensesOverviewProps) {
  const statsItems = [
    {
      title: "Total Expenses",
      value: formatCurrency(summary.totalAmount),
      icon: DollarSign
    },
    {
      title: "Total Transactions",
      value: summary.totalCount,
      icon: Receipt
    },
    {
      title: "Average Expense",
      value: formatCurrency(summary.averageAmount),
      icon: LineChart
    },
   {
  title: "Most Common Type",
  value: summary.mostCommonType
    ? `${summary.mostCommonType.type} (${summary.mostCommonType.count})`
    : "No data",
  icon: Zap
}
,
    {
      title: "Today's Expenses",
      value: stats.todayCount,
      icon: Wallet
    }
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      {statsItems.map((stat) => (
        <Card key={stat.title} className="hover:bg-muted/50 transition-colors">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <stat.icon className="h-8 w-8 text-primary" />
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold text-foreground">
                {stat.value}
              </p>
              <p className="text-sm text-muted-foreground">{stat.title}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}