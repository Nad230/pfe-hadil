"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FullPlanTimeline } from "@/components/full-plan/full-plan-timeline"
import { Map } from "lucide-react"

export default function FullPlanPage({
  params
}: {
  params: { startupPlanId: string }
}) {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Full Plan Overview</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Map className="h-5 w-5 text-purple-500" />
            30-Day Launch Roadmap
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FullPlanTimeline startupPlanId={params.startupPlanId} />
        </CardContent>
      </Card>
    </div>
  )
}