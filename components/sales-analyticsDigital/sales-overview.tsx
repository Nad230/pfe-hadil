"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Package, DollarSign, LineChart, User, Briefcase } from "lucide-react"
import { cn, formatCurrency } from "@/lib/utils"
import { DateRange } from "react-day-picker"

interface SalesOverviewProps {
  data: {
    invoiceCount: number
    averageInvoiceValue: number
    totalRevenue: number
    bestClient: {
      clientId: string
      name: string
      totalRevenue: number
    } | null
    bestProject: {
      projectId: string
      name: string
      totalRevenue: number
    } | null
  }
  dateRange: DateRange
}

export function SalesOverview({ data, dateRange }: SalesOverviewProps) {
  // Safely handle null/undefined values
  const safeValues = {
    totalRevenue: data?.totalRevenue || 0,
    invoiceCount: data?.invoiceCount || 0,
    averageInvoice: data?.averageInvoiceValue || 0,
    bestClient: data?.bestClient?.name || "No clients yet",
    bestProject: data?.bestProject?.name || "No projects yet"
  }

  const stats = [
    {
      title: "Total Revenue",
      value: safeValues.totalRevenue > 0 ? formatCurrency(safeValues.totalRevenue) : "--",
      icon: DollarSign,
      active: safeValues.totalRevenue > 0
    },
    {
      title: "Total Invoices",
      value: safeValues.invoiceCount > 0 ? safeValues.invoiceCount.toLocaleString() : "--",
      icon: Package,
      active: safeValues.invoiceCount > 0
    },
    {
      title: "Avg. Invoice",
      value: safeValues.averageInvoice > 0 ? formatCurrency(safeValues.averageInvoice) : "--",
      icon: LineChart,
      active: safeValues.averageInvoice > 0
    },
    {
      title: "Top Client",
      value: safeValues.bestClient,
      icon: User,
      active: safeValues.bestClient !== "No clients yet"
    },
    {
      title: "Top Project",
      value: safeValues.bestProject,
      icon: Briefcase,
      active: safeValues.bestProject !== "No projects yet"
    }
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
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