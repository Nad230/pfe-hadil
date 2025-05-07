"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Clock, Users, ArrowLeft } from "lucide-react"
import { CreateActivityDialog } from "@/components/events/create-dialog-activity"

import Link from "next/link"
import { useState } from "react"

const events = [
  {
    id: "1",
    title: "Tech Conference 2024",
    description: "Annual technology conference featuring the latest in web development",
    date: "2024-04-15",
    time: "09:00 AM",
    location: "San Francisco Convention Center",
    attendees: 250,
    category: "Conference",
    status: "upcoming"
  },
  {
    id: "2",
    title: "Startup Networking Mixer",
    description: "Connect with local entrepreneurs and investors",
    date: "2024-04-20",
    time: "06:00 PM",
    location: "Innovation Hub",
    attendees: 75,
    category: "Networking",
    status: "upcoming"
  },
  {
    id: "3",
    title: "Web Development Workshop",
    description: "Hands-on workshop on modern web development practices",
    date: "2024-04-25",
    time: "02:00 PM",
    location: "Tech Campus",
    attendees: 30,
    category: "Workshop",
    status: "upcoming"
  }
]

const categoryColors = {
  Conference: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100",
  Networking: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
  Workshop: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
}

export default function EventsPage() {
  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[url('https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&q=80')] bg-cover bg-center bg-no-repeat">
      <div className="min-h-screen bg-background/80 backdrop-blur-sm p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Link href="/profile">
                <Button variant="ghost" size="sm" className="mb-2">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Profile
                </Button>
              </Link>
              <h1 className="text-3xl font-bold">Activites</h1>
              <p className="text-muted-foreground">
                Discover and manage your upcoming Activite
              </p>
            </div>
            <CreateActivityDialog open={dialogOpen} onOpenChange={setDialogOpen} />
            <Button onClick={() => setDialogOpen(true)}>
              <Calendar className="h-4 w-4 mr-2" />
              Add New Activity
            </Button>

          </div>

          <div className="grid gap-6">
            {events.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center gap-6">
                      <div className="flex-1 space-y-4">
                        <div className="space-y-2">
                          
                          <h3 className="text-xl font-semibold">{event.title}</h3>
                          <p className="text-muted-foreground">
                            {event.description}
                          </p>
                        </div>

                        
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Users className="h-4 w-4" />
                            <span>{event.attendees} attending</span>
                          </div>
                        </div>
                        <Button>View Details</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}