"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Users, MapPin, Clock, Activity } from "lucide-react"

export function AudienceInsights() {
  const demographics = [
    { age: "18-24", percentage: 35 },
    { age: "25-34", percentage: 45 },
    { age: "35-44", percentage: 15 },
    { age: "45+", percentage: 5 }
  ]

  const locations = [
    { country: "United States", percentage: 40 },
    { country: "United Kingdom", percentage: 20 },
    { country: "Canada", percentage: 15 },
    { country: "Australia", percentage: 10 },
    { country: "Others", percentage: 15 }
  ]

  const activeHours = [
    { time: "6:00 - 9:00", percentage: 15 },
    { time: "9:00 - 12:00", percentage: 25 },
    { time: "12:00 - 15:00", percentage: 20 },
    { time: "15:00 - 18:00", percentage: 25 },
    { time: "18:00 - 21:00", percentage: 15 }
  ]

  const interests = [
    { category: "Technology", percentage: 35 },
    { category: "Lifestyle", percentage: 25 },
    { category: "Business", percentage: 20 },
    { category: "Health & Fitness", percentage: 15 },
    { category: "Entertainment", percentage: 5 }
  ]

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Demographics</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-4">
            {demographics.map((item) => (
              <div key={item.age} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span>{item.age}</span>
                  <span className="text-muted-foreground">{item.percentage}%</span>
                </div>
                <Progress value={item.percentage} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Locations</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-4">
            {locations.map((item) => (
              <div key={item.country} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span>{item.country}</span>
                  <span className="text-muted-foreground">{item.percentage}%</span>
                </div>
                <Progress value={item.percentage} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-4">
            {activeHours.map((item) => (
              <div key={item.time} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span>{item.time}</span>
                  <span className="text-muted-foreground">{item.percentage}%</span>
                </div>
                <Progress value={item.percentage} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Interests</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-4">
            {interests.map((item) => (
              <div key={item.category} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span>{item.category}</span>
                  <span className="text-muted-foreground">{item.percentage}%</span>
                </div>
                <Progress value={item.percentage} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Audience Growth Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Follower Growth</h3>
              <p className="text-2xl font-bold">+2,847</p>
              <p className="text-sm text-green-500">+12% this month</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Engagement Rate</h3>
              <p className="text-2xl font-bold">5.2%</p>
              <p className="text-sm text-green-500">+0.8% this month</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Audience Quality</h3>
              <p className="text-2xl font-bold">94%</p>
              <p className="text-sm text-green-500">+2% this month</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}