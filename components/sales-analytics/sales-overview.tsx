"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Package, DollarSign, LineChart, Star } from "lucide-react"
import { cn, formatCurrency } from "@/lib/utils"
import { DateRange } from "react-day-picker"

interface SalesOverviewProps {
  data: {
    orderCount: number
    averageSale: number
    totalRevenue: number
    bestProduct: string
  }
  dateRange: DateRange
}

export function SalesOverview({ data, dateRange }: SalesOverviewProps) {
  // Convert all values to numbers and handle null/undefined
  const safeValues = {
    totalRevenue: Number(data?.totalRevenue) || 0,
    orderCount: Number(data?.orderCount) || 0,
    averageSale: Number(data?.averageSale) || 0,
    bestProduct: data?.bestProduct?.trim() || "No sales yet"
  }

  const stats = [
    {
      title: "Total Revenue",
      value: safeValues.totalRevenue > 0 ? formatCurrency(safeValues.totalRevenue) : "--",
      icon: DollarSign,
      active: safeValues.totalRevenue > 0
    },
    {
      title: "Total Orders",
      value: safeValues.orderCount > 0 ? safeValues.orderCount.toLocaleString() : "--",
      icon: Package,
      active: safeValues.orderCount > 0
    },
    {
      title: "Avg. Order",
      value: safeValues.averageSale > 0 ? formatCurrency(safeValues.averageSale) : "--",
      icon: LineChart,
      active: safeValues.averageSale > 0
    },
    {
      title: "Best Seller",
      value: safeValues.bestProduct,
      icon: Star,
      active: safeValues.bestProduct !== "No sales yet"
    }
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title} className="hover:bg-muted/50 transition-colors">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <stat.icon className={cn(
                "h-8 w-8",
                stat.active ? "text-green-500" : "text-muted-foreground"
              )} />
            </div>
            <div className="mt-4">
              <p className={cn(
                "text-3xl font-bold",
                stat.active ? "text-foreground" : "text-muted-foreground"
              )}>
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