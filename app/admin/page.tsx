"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UsersStats } from "@/components/admin/users-stats"
import { UsersTable } from "@/components/admin/users-table"
import { MaintenanceSettings } from "@/components/admin/maintenance-settings"
import { JobStats } from "@/components/admin/job-stats"
import { useEffect, useState } from "react"
import { StatsData } from "@/components/admin/users-stats"
import Cookies from "js-cookie"

export default function AdminPage() {
  const [stats, setStats] = useState<StatsData | null>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = Cookies.get("token")
        const response = await fetch("http://localhost:3000/auth/stats", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) throw new Error("Failed to fetch stats")
        const data = await response.json()
        setStats(data)
      } catch (err) {
        console.error("Stats fetch error:", err)
        setError("Failed to load dashboard data. Retrying...")
        setTimeout(fetchStats, 5000) // Auto-retry after 5 seconds
      }
    }

    fetchStats()
  }, [])

  if (!stats) return <div className="p-4 text-center">Loading dashboard...</div>

  return (
    <div className="container mx-auto py-8 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <h1 className="text-4xl font-bold">Admin Dashboard</h1>
      </motion.div>

      <Tabs defaultValue="overview" className="space-y-8">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-8">
        <div className="grid gap-8 md:grid-cols-2">
          <UsersStats initialStats={stats} />
          <JobStats initialStats={stats} />
        </div>
      </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
            </CardHeader>
            <CardContent>
              <UsersTable />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <MaintenanceSettings />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}