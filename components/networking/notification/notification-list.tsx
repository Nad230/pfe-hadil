"use client"

import { useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { Heart, MessageCircle, User } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"

interface NotificationListProps {
  type?: "mention" | "comment" | "like"
}

export function NotificationList({ type }: NotificationListProps) {
  // Mock data for demonstration
  const [notifications, setNotifications] = useState([
    {
      id: "n1",
      type: "like",
      content: "liked your post",
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      isRead: false,
      user: {
        id: "user1",
        name: "John Doe",
        username: "johndoe",
        avatarUrl: "/placeholder-user.jpg",
      },
      post: {
        id: "post1",
        content: "Just launched my new website!",
      },
    },
    {
      id: "n2",
      type: "comment",
      content: "commented on your post",
      timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
      isRead: true,
      user: {
        id: "user2",
        name: "Jane Smith",
        username: "janesmith",
        avatarUrl: "/placeholder-user.jpg",
      },
      post: {
        id: "post1",
        content: "Just launched my new website!",
      },
    },
    {
      id: "n3",
      type: "mention",
      content: "mentioned you in a post",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      isRead: false,
      user: {
        id: "user3",
        name: "Alex Johnson",
        username: "alexj",
        avatarUrl: "/placeholder-user.jpg",
      },
      post: {
        id: "post2",
        content: "Hey @currentuser, check this out!",
      },
    },
  ])

  const filteredNotifications = type
    ? notifications.filter((notification) => notification.type === type)
    : notifications

  const markAsRead = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((notification) => {
        if (notification.id === notificationId) {
          return { ...notification, isRead: true }
        }
        return notification
      }),
    )
  }

  if (filteredNotifications.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-muted-foreground">No notifications found</p>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {filteredNotifications.map((notification) => (
        <div
          key={notification.id}
          className={`flex items-start gap-4 p-4 hover:bg-muted/50 transition-colors rounded-lg ${!notification.isRead ? "bg-muted/30" : ""}`}
          onClick={() => markAsRead(notification.id)}
        >
          <div className="relative">
            <Avatar>
              <AvatarImage src={notification.user.avatarUrl} alt={notification.user.name} />
              <AvatarFallback>{notification.user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 rounded-full p-1 bg-background">
              {notification.type === "like" && <Heart className="h-3 w-3 fill-red-500 text-red-500" />}
              {notification.type === "comment" && <MessageCircle className="h-3 w-3 fill-blue-500 text-blue-500" />}
              {notification.type === "mention" && <User className="h-3 w-3 fill-green-500 text-green-500" />}
            </div>
          </div>
          <div className="flex-1">
            <p>
              <Link href={`/profile/${notification.user.username}`} className="font-semibold hover:underline">
                {notification.user.name}
              </Link>{" "}
              {notification.content}{" "}
              <Link href={`/post/${notification.post.id}`} className="text-muted-foreground hover:underline">
                {notification.post.content.length > 30
                  ? `${notification.post.content.substring(0, 30)}...`
                  : notification.post.content}
              </Link>
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
            </p>
          </div>
          {!notification.isRead && <div className="h-2 w-2 rounded-full bg-primary" />}
        </div>
      ))}
    </div>
  )
}

