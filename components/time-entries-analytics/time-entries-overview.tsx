"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Clock, Target, BarChart, Activity } from "lucide-react"
import { formatDecimalHours, formatDuration } from "@/lib/utils/time"
import { DateRange } from "react-day-picker"

interface TimeEntriesOverviewProps {
  summary: {
    totalDuration: number
    entryCount: number
    averageDuration: number
    mostTimeSpentProject: {
      name: string
      totalDuration: number
    }
  }
  stats: {
    today: number
    weekly: number
    monthly: number
    projectsTracked: number
  }
  dateRange: DateRange
}

export function TimeEntriesOverview({ summary, stats }: TimeEntriesOverviewProps) {
  const statsItems = [
    {
        title: "Total Tracked",
  value: formatDecimalHours(summary.totalDuration),
  icon: Clock,
  description: "Total time tracked"
},
{
  title: "Daily Average",
  value: formatDecimalHours(stats.today),
  icon: Activity,
  description: "Today's tracked time"
},
{
  title: "Avg. Session",
  value: formatDecimalHours(summary.averageDuration),
  icon: BarChart,
  description: "Average session duration"
}
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statsItems.map((stat) => (
        <Card key={stat.title} className="hover:bg-muted/50 transition-colors">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <stat.icon className="h-8 w-8 text-primary" />
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold text-foreground">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.title}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}