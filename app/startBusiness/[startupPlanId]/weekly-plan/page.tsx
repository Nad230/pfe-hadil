"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "lucide-react"
import { WeeklyTasks } from "@/components/weekly-plan/weekly-tasks"

export default function WeeklyPlanPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Weekly Plan</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-500" />
            This Week's Tasks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <WeeklyTasks />
        </CardContent>
      </Card>
    </div>
  )
}