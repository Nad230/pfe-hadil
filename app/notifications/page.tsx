"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Bell, MessageSquare, Heart, Trophy, Target } from "lucide-react"

interface Notification {
  id: string
  type: "message" | "like" | "achievement" | "challenge" | "goal"
  content: string
  user: {
    name: string
    avatar: string
  }
  timestamp: string
  read: boolean
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "message",
    content: "commented on your productivity post",
    user: {
      name: "Emma Watson",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop"
    },
    timestamp: "2024-03-20T10:00:00Z",
    read: false
  },
  {
    id: "2",
    type: "like",
    content: "liked your mindfulness journey update",
    user: {
      name: "David Park",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop"
    },
    timestamp: "2024-03-20T09:30:00Z",
    read: false
  },
  {
    id: "3",
    type: "achievement",
    content: "You've completed the 7-day meditation streak!",
    user: {
      name: "System",
      avatar: ""
    },
    timestamp: "2024-03-20T08:00:00Z",
    read: true
  },
  {
    id: "4",
    type: "challenge",
    content: "invited you to join the Productivity Power Week challenge",
    user: {
      name: "Lisa Thompson",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop"
    },
    timestamp: "2024-03-19T18:00:00Z",
    read: true
  },
  {
    id: "5",
    type: "goal",
    content: "You're 80% towards your weekly mindfulness goal!",
    user: {
      name: "System",
      avatar: ""
    },
    timestamp: "2024-03-19T12:00:00Z",
    read: true
  }
]

const notificationIcons = {
  message: MessageSquare,
  like: Heart,
  achievement: Trophy,
  challenge: Trophy,
  goal: Target
}

const notificationColors = {
  message: "bg-blue-500",
  like: "bg-red-500",
  achievement: "bg-yellow-500",
  challenge: "bg-purple-500",
  goal: "bg-green-500"
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications)
  const [filter, setFilter] = useState<"all" | "unread">("all")

  const filteredNotifications = filter === "all"
    ? notifications
    : notifications.filter(n => !n.read)

  const unreadCount = notifications.filter(n => !n.read).length

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })))
  }

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    ))
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold">Notifications</h1>
          {unreadCount > 0 && (
            <Badge variant="secondary" className="h-6 px-2">
              {unreadCount} unread
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => setFilter(filter === "all" ? "unread" : "all")}
          >
            {filter === "all" ? "Show Unread" : "Show All"}
          </Button>
          {unreadCount > 0 && (
            <Button onClick={markAllAsRead}>
              Mark All as Read
            </Button>
          )}
        </div>
      </div>

      <AnimatePresence initial={false}>
        {filteredNotifications.map((notification, index) => {
          const Icon = notificationIcons[notification.type]
          const colorClass = notificationColors[notification.type]

          return (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2, delay: index * 0.1 }}
            >
              <Card
                className={`
                  transition-colors duration-200
                  ${notification.read ? "bg-background" : "bg-muted"}
                `}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    {notification.user.avatar ? (
                      <Avatar>
                        <AvatarImage src={notification.user.avatar} />
                        <AvatarFallback>{notification.user.name[0]}</AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className={`p-2 rounded-full ${colorClass}`}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                    )}
                    <div className="flex-1 space-y-1">
                      <p>
                        <span className="font-medium">{notification.user.name}</span>
                        {" "}
                        {notification.content}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(notification.timestamp).toLocaleString()}
                      </p>
                    </div>
                    {!notification.read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markAsRead(notification.id)}
                      >
                        Mark as Read
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </AnimatePresence>

      {filteredNotifications.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-medium mb-2">No notifications</h2>
          <p className="text-muted-foreground">
            {filter === "unread"
              ? "You've read all your notifications!"
              : "You don't have any notifications yet."}
          </p>
        </motion.div>
      )}
    </div>
  )
}