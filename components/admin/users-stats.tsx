// components/admin/users-stats.tsx
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, UserPlus, Crown, UserCheck, Gem } from "lucide-react"
import { motion } from "framer-motion"

export interface StatsData {
  totalUsers: number
  newUsersThisWeek: number
  activeToday: number
  activeThisMonth: number
  SILVER: number
  GOLD: number
  DIAMOND: number
}

interface UsersStatsProps {
  initialStats: StatsData
}

export function UsersStats({ initialStats }: UsersStatsProps) {
  const stats = [
    { title: "Total Users",       value: initialStats.totalUsers,      icon: Users,     color: "text-blue-500" },
    { title: "Active Today",      value: initialStats.activeToday,     icon: UserCheck, color: "text-green-500" },
    { title: "New This Week",     value: initialStats.newUsersThisWeek, icon: UserPlus,  color: "text-purple-500" },
    { title: "Active This Month", value: initialStats.activeThisMonth, icon: Crown,     color: "text-yellow-600" },
   
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {stats.map((stat, i) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-4 rounded-lg bg-muted/50"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-full bg-white/10 ${stat.color}`}>
                    <Icon className="h-6 w-6" {...(stat.iconProps || {})} />
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
