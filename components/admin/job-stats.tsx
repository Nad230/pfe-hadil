"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Gem, Crown } from "lucide-react"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"

export function JobStats() {
  const [packageStats, setPackageStats] = useState({
    SILVER: 0,
    GOLD: 0,
    DIAMOND: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchPackageStats = async () => {
      try {
        const response = await fetch("http://localhost:3000/auth/statsPackage")
        if (!response.ok) throw new Error("Failed to fetch package stats")
        const data = await response.json()
        setPackageStats(data)
        setLoading(false)
      } catch (err) {
        setError("Failed to load package statistics")
        setLoading(false)
      }
    }

    fetchPackageStats()
  }, [])

  const stats = [
    {
      title: "Silver Users",
      value: packageStats.SILVER.toLocaleString(),
      icon: Gem,
      color: "text-slate-400",
      iconProps: { fill: "#c0c0c0" }
    },
    {
      title: "Gold Users",
      value: packageStats.GOLD.toLocaleString(),
      icon: Crown,
      color: "text-amber-500",
      iconProps: { fill: "#ffd700" }
    },
    {
      title: "Diamond Users",
      value: packageStats.DIAMOND.toLocaleString(),
      icon: Gem,
      color: "text-indigo-500",
      iconProps: { fill: "#b9f2ff" }
    }
  ]

  if (loading) return <div className="p-4 text-center">Loading package statistics...</div>
  if (error) return <div className="p-4 text-center text-red-500">{error}</div>

  return (
    <Card>
      <CardHeader>
        <CardTitle>Package Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 rounded-lg bg-muted/50"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-full bg-white/10 ${stat.color}`}>
                    <Icon className="h-6 w-6" {...stat.iconProps} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <div className="flex items-baseline gap-2">
                      <h3 className="text-2xl font-bold">{stat.value}</h3>
                    </div>
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