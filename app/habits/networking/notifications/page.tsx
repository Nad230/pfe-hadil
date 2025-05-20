"use client"
import { NotificationList } from "@/components/networking/notification/notification-list"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function NotificationsPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
        <p className="text-muted-foreground">Stay updated with your network activity</p>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="mentions">Mentions</TabsTrigger>
          <TabsTrigger value="comments">Comments</TabsTrigger>
          <TabsTrigger value="likes">Likes</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <NotificationList />
        </TabsContent>
        <TabsContent value="mentions">
          <NotificationList type="mention" />
        </TabsContent>
        <TabsContent value="comments">
          <NotificationList type="comment" />
        </TabsContent>
        <TabsContent value="likes">
          <NotificationList type="like" />
        </TabsContent>
      </Tabs>
    </div>
  )
}

