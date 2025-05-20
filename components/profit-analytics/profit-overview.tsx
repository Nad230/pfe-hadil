"use client"

import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, TrendingDown, DollarSign, Wallet, PiggyBank, LineChart } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { DateRange } from "react-day-picker"

interface ProfitOverviewProps {
  totalRevenue: number
  totalExpenses: number
  profit: number
  insight: string
  dateRange: DateRange
}

export function ProfitOverview({ 
  totalRevenue,
  totalExpenses,
  profit,
  insight,
  dateRange 
}: ProfitOverviewProps) {
  const margin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0

  const stats = [
    {
      title: "Revenue",
      value: formatCurrency(totalRevenue),
      icon: DollarSign,
      trend: totalRevenue >= 0 ? "up" : "down"
    },
    {
      title: "Expenses",
      value: formatCurrency(totalExpenses),
      icon: Wallet,
      trend: totalExpenses <= 0 ? "up" : "down"
    },
    {
      title: "Net Profit",
      value: formatCurrency(profit),
      icon: PiggyBank,
      trend: profit >= 0 ? "up" : "down"
    },
    {
      title: "Profit Margin",
      value: `${margin.toFixed(1)}%`,
      icon: LineChart,
      trend: margin >= 0 ? "up" : "down"
    }
  ]

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <stat.icon className="h-8 w-8 text-muted-foreground" />
                <span className={`flex items-center text-sm ${
                  stat.trend === "up" ? "text-green-600" : "text-red-600"
                }`}>
                  {stat.trend === "up" ? (
                    <TrendingUp className="mr-1 h-4 w-4" />
                  ) : (
                    <TrendingDown className="mr-1 h-4 w-4" />
                  )}
                </span>
              </div>
              <div className="mt-4">
                <p className="text-3xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {insight && (
        <div className="p-4 bg-yellow-100 rounded-lg text-sm">
          {insight}
        </div>
      )}
    </div>
  )
}