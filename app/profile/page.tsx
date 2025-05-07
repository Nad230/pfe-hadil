"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { MapPin, Mail, Calendar, Link as LinkIcon, Activity, Book, Users, Briefcase } from "lucide-react"
import Link from "next/link"

const activities = [
  {
    id: "events",
    title: "Events",
    description: "View and manage your upcoming events",
    icon: Calendar,
    color: "from-purple-500 to-pink-500",
    link: "/profile/events"
  },
  {
    id: "learning",
    title: "Learning",
    description: "Track your learning progress",
    icon: Book,
    color: "from-blue-500 to-indigo-500",
    link: "/profile/learning"
  },
  {
    id: "network",
    title: "Network",
    description: "Manage your professional connections",
    icon: Users,
    color: "from-green-500 to-emerald-500",
    link: "/profile/network"
  },
  {
    id: "business",
    title: "Business",
    description: "Overview of your business activities",
    icon: Briefcase,
    color: "from-amber-500 to-orange-500",
    link: "/profile/business"
  }
]

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-[url('https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&q=80')] bg-cover bg-center bg-no-repeat">
      <div className="min-h-screen bg-background/80 backdrop-blur-sm p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Profile Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative"
          >
            <div className="h-48 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500" />
            <div className="absolute -bottom-16 left-8 flex items-end gap-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Avatar className="h-32 w-32 border-4 border-background">
                  <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="mb-4 space-y-1"
              >
                <h1 className="text-3xl font-bold">John Doe</h1>
                <p className="text-muted-foreground">Full Stack Developer & Entrepreneur</p>
              </motion.div>
            </div>
          </motion.div>

          {/* Profile Info */}
          <div className="grid gap-8 pt-20 md:grid-cols-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="md:col-span-2 space-y-8"
            >
              <Card>
                <CardHeader>
                  <CardTitle>About Me</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    Passionate developer with 5+ years of experience building web applications.
                    Focused on creating intuitive user experiences and scalable solutions.
                  </p>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>San Francisco, CA</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <span>john.doe@example.com</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Joined January 2024</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <LinkIcon className="h-4 w-4" />
                      <span>portfolio.example.com</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Skills</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {["React", "TypeScript", "Node.js", "Next.js", "TailwindCSS", "GraphQL", "AWS", "Docker"].map((skill) => (
                      <Badge key={skill} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">Events Attended</div>
                    <div className="text-2xl font-bold">24</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">Courses Completed</div>
                    <div className="text-2xl font-bold">12</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">Network Connections</div>
                    <div className="text-2xl font-bold">156</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">Business Projects</div>
                    <div className="text-2xl font-bold">8</div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Activities Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {activities.map((activity, index) => {
              const Icon = activity.icon
              return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + (index * 0.1) }}
                >
                  <Link href={activity.link}>
                    <Card className="h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                      <CardContent className="p-6 space-y-4">
                        <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${activity.color} flex items-center justify-center`}>
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{activity.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {activity.description}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}