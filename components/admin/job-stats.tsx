// components/admin/job-stats.tsx
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Gem, Crown } from "lucide-react"
import { motion } from "framer-motion"
import { StatsData } from "./users-stats"

interface JobStatsProps {
  initialStats: Pick<StatsData, "SILVER" | "GOLD" | "DIAMOND">
}

export function JobStats({ initialStats }: JobStatsProps) {
  const stats = [
    { title: "Silver Users",   value: initialStats.SILVER,   icon: Gem,   color: "text-slate-400",  iconProps: { fill: "#c0c0c0" } },
    { title: "Gold Users",     value: initialStats.GOLD,     icon: Crown, color: "text-amber-500", iconProps: { fill: "#ffd700" } },
    { title: "Diamond Users",  value: initialStats.DIAMOND,  icon: Gem,   color: "text-indigo-500", iconProps: { fill: "#b9f2ff" } },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Package Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {stats.map((stat, i) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-4 rounded-lg bg-muted/50"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-full bg-white/10 ${stat.color}`}>
                    <Icon className="h-6 w-6" {...stat.iconProps} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <h3 className="text-2xl font-bold">{stat.value.toLocaleString()}</h3>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
