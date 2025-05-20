"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  BarChart,
  LineChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts"
import { 
  TrendingUp,
  Users,
  Clock,
  Calendar
} from "lucide-react"

export default function AnalyticsPage() {
  const engagementData = [
    { name: 'Mon', instagram: 65, youtube: 45, twitter: 35 },
    { name: 'Tue', instagram: 59, youtube: 55, twitter: 40 },
    { name: 'Wed', instagram: 80, youtube: 65, twitter: 55 },
    { name: 'Thu', instagram: 81, youtube: 75, twitter: 60 },
    { name: 'Fri', instagram: 56, youtube: 60, twitter: 45 },
    { name: 'Sat', instagram: 55, youtube: 50, twitter: 40 },
    { name: 'Sun', instagram: 40, youtube: 45, twitter: 35 }
  ]

  const growthData = [
    { name: 'Jan', followers: 4000 },
    { name: 'Feb', followers: 5000 },
    { name: 'Mar', followers: 6500 },
    { name: 'Apr', followers: 8200 },
    { name: 'May', followers: 9900 },
    { name: 'Jun', followers: 11500 }
  ]

  const stats = [
    {
      title: "Total Followers",
      value: "45.9K",
      change: "+12.3%",
      icon: Users
    },
    {
      title: "Engagement Rate",
      value: "4.8%",
      change: "+0.5%",
      icon: TrendingUp
    },
    {
      title: "Best Time",
      value: "2-4 PM",
      change: "EST",
      icon: Clock
    },
    {
      title: "Best Day",
      value: "Wednesday",
      change: "consistently",
      icon: Calendar
    }
  ]

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">Track your social media performance</p>
        </div>
        <Button variant="outline">
          Download Report
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <stat.icon className="h-5 w-5 text-muted-foreground" />
                <Badge variant="outline" className="text-xs">
                  {stat.change}
                </Badge>
              </div>
              <div className="mt-4">
                <p className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Engagement Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={engagementData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="instagram" fill="#E1306C" name="Instagram" />
                  <Bar dataKey="youtube" fill="#FF0000" name="YouTube" />
                  <Bar dataKey="twitter" fill="#1DA1F2" name="Twitter" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Follower Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={growthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="followers" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}