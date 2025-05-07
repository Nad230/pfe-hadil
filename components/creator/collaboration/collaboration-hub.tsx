"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, MessageSquare, HandshakeIcon, Search } from "lucide-react"

export function CollaborationHub() {
  const collaborators = [
    {
      id: "1",
      name: "Sarah Chen",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
      expertise: ["Photography", "Lifestyle"],
      followers: "45.2K",
      status: "available"
    },
    {
      id: "2",
      name: "Alex Rivera",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
      expertise: ["Tech Reviews", "Gaming"],
      followers: "82.1K",
      status: "collaborating"
    },
    {
      id: "3",
      name: "Emma Watson",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
      expertise: ["Fitness", "Wellness"],
      followers: "67.8K",
      status: "available"
    }
  ]

  const opportunities = [
    {
      id: "1",
      title: "Tech Review Collab",
      creator: "TechReviewPro",
      type: "Video Collaboration",
      requirements: "50K+ followers, Tech niche",
      deadline: "2024-04-20"
    },
    {
      id: "2",
      title: "Fitness Challenge",
      creator: "FitLife",
      type: "Cross-promotion",
      requirements: "30K+ followers, Fitness/Health niche",
      deadline: "2024-04-25"
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
      case "collaborating":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
      default:
        return ""
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Featured Collaborators</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {collaborators.map((collaborator) => (
              <div
                key={collaborator.id}
                className="flex items-center justify-between p-4 rounded-lg border"
              >
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src={collaborator.avatar} />
                    <AvatarFallback>{collaborator.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{collaborator.name}</h3>
                      <Badge className={getStatusColor(collaborator.status)}>
                        {collaborator.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      {collaborator.followers}
                    </div>
                    <div className="flex gap-2 mt-2">
                      {collaborator.expertise.map((skill) => (
                        <Badge key={skill} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <MessageSquare className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Collaboration Opportunities</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {opportunities.map((opportunity) => (
              <div
                key={opportunity.id}
                className="p-4 rounded-lg border space-y-2"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">{opportunity.title}</h3>
                  <Badge variant="outline">{opportunity.type}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">By {opportunity.creator}</p>
                <p className="text-sm">{opportunity.requirements}</p>
                <div className="flex items-center justify-between pt-2">
                  <p className="text-sm text-muted-foreground">
                    Deadline: {opportunity.deadline}
                  </p>
                  <Button size="sm">
                    <HandshakeIcon className="mr-2 h-4 w-4" />
                    Apply
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Find Collaborators</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Active Creators</h3>
              <p className="text-2xl font-bold">1,247</p>
              <p className="text-sm text-muted-foreground">In your niche</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Open Opportunities</h3>
              <p className="text-2xl font-bold">38</p>
              <p className="text-sm text-muted-foreground">Available now</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Potential Reach</h3>
              <p className="text-2xl font-bold">2.4M</p>
              <p className="text-sm text-muted-foreground">Combined audience</p>
            </div>
          </div>

          <div className="mt-6">
            <Button className="w-full">
              <Search className="mr-2 h-4 w-4" />
              Find More Collaborators
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}