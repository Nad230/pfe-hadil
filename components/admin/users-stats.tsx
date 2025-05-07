"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, UserPlus, Crown, UserCheck, Gem } from "lucide-react"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"

export function UsersStats() {
  const [statsData, setStatsData] = useState({
    totalUsers: 0,
    newUsersThisWeek: 0,
    activeToday: 0,
    SILVER: 0,
    GOLD: 0,
    DIAMOND: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [basicStatsRes, packageStatsRes] = await Promise.all([
          fetch("http://localhost:3000/auth/stats"),
          fetch("http://localhost:3000/auth/statsPackage")
        ])

        if (!basicStatsRes.ok || !packageStatsRes.ok) {
          throw new Error("Failed to fetch data")
        }

        const basicStats = await basicStatsRes.json()
        const packageStats = await packageStatsRes.json()

        setStatsData({
          totalUsers: basicStats.totalUsers,
          newUsersThisWeek: basicStats.newUsersThisWeek,
          activeToday: basicStats.activeToday,
          SILVER: packageStats.SILVER,
          GOLD: packageStats.GOLD,
          DIAMOND: packageStats.DIAMOND
        })
        setLoading(false)
      } catch (err) {
        setError("Failed to load user statistics")
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const stats = [
    {
      title: "Total Users",
      value: statsData.totalUsers.toLocaleString(),
      icon: Users,
      color: "text-blue-500"
    },
    {
      title: "Active Today",
      value: statsData.activeToday.toLocaleString(),
      icon: UserCheck,
      color: "text-green-500"
    },
    {
      title: "New This Week",
      value: statsData.newUsersThisWeek.toLocaleString(),
      icon: UserPlus,
      color: "text-purple-500"
    },
    {
      title: "Silver Users",
      value: statsData.SILVER.toLocaleString(),
      icon: Gem,
      color: "text-slate-400",
      iconProps: { fill: "#c0c0c0" }
    },
    {
      title: "Gold Users",
      value: statsData.GOLD.toLocaleString(),
      icon: Gem,
      color: "text-amber-500",
      iconProps: { fill: "#ffd700" }
    },
    {
      title: "Diamond Users",
      value: statsData.DIAMOND.toLocaleString(),
      icon: Gem,
      color: "text-indigo-500",
      iconProps: { fill: "#b9f2ff" }
    }
  ]

  if (loading) return <div className="p-4 text-center">Loading statistics...</div>
  if (error) return <div className="p-4 text-center text-red-500">{error}</div>

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 rounded-lg bg-muted/50"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-full bg-white/10 ${stat.color}`}>
                    <Icon className="h-6 w-6" {...stat.iconProps} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <h3 className="text-2xl font-bold">{stat.value}</h3>
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