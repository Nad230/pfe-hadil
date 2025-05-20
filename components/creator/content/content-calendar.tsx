"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Plus, Calendar as CalendarIcon, Instagram, Youtube, Atom as Tiktok } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"

export function ContentCalendar() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())

  // Mock content schedule
  const scheduledContent = [
    {
      id: "1",
      platform: "instagram",
      type: "post",
      time: "10:00 AM",
      title: "Product Review",
      status: "scheduled"
    },
    {
      id: "2",
      platform: "youtube",
      type: "video",
      time: "2:00 PM",
      title: "Weekly Vlog",
      status: "draft"
    },
    {
      id: "3",
      platform: "tiktok",
      type: "video",
      time: "4:30 PM",
      title: "Dance Challenge",
      status: "idea"
    }
  ]

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "instagram":
        return <Instagram className="h-4 w-4" />
      case "youtube":
        return <Youtube className="h-4 w-4" />
      case "tiktok":
        return <Tiktok className="h-4 w-4" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
      case "draft":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
      case "idea":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
      default:
        return ""
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-[1fr,300px]">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Content Calendar</CardTitle>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Schedule Content
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {scheduledContent.map((content) => (
              <div
                key={content.id}
                className="flex items-center justify-between p-4 rounded-lg border"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-full bg-muted`}>
                    {getPlatformIcon(content.platform)}
                  </div>
                  <div>
                    <h3 className="font-medium">{content.title}</h3>
                    <p className="text-sm text-muted-foreground">{content.time}</p>
                  </div>
                </div>
                <Badge className={getStatusColor(content.status)}>
                  {content.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4" />
            Calendar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="rounded-md border"
          />
          <div className="mt-4 space-y-2">
            <h4 className="font-medium">Best Posting Times</h4>
            <div className="space-y-1 text-sm">
              <p className="flex items-center gap-2">
                <Instagram className="h-4 w-4" />
                <span className="text-muted-foreground">10:00 AM, 6:00 PM</span>
              </p>
              <p className="flex items-center gap-2">
                <Youtube className="h-4 w-4" />
                <span className="text-muted-foreground">2:00 PM, 8:00 PM</span>
              </p>
              <p className="flex items-center gap-2">
                <Tiktok className="h-4 w-4" />
                <span className="text-muted-foreground">4:00 PM, 9:00 PM</span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}