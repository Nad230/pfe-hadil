"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Brain, Calendar, CheckCircle2, Clock, Plus, Target } from "lucide-react"

export function TaskManager() {
  const tasks = [
    {
      id: "1",
      title: "Homepage Design",
      project: "E-commerce Website Redesign",
      client: {
        name: "Sarah Chen",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop"
      },
      deadline: "2024-03-25",
      estimatedHours: 8,
      progress: 65,
      status: "in_progress",
      aiSuggestions: [
        "Consider A/B testing for the hero section",
        "Optimize for mobile-first design",
        "Include social proof elements"
      ]
    },
    {
      id: "2",
      title: "User Authentication",
      project: "Mobile App Development",
      client: {
        name: "Alex Rivera",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop"
      },
      deadline: "2024-03-28",
      estimatedHours: 12,
      progress: 30,
      status: "at_risk",
      aiSuggestions: [
        "Implement biometric authentication",
        "Add two-factor authentication",
        "Consider OAuth integration"
      ]
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
      case "in_progress":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
      case "at_risk":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
      default:
        return ""
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">8 due this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">16</div>
            <p className="text-xs text-green-500">+4 this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hours Logged</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45.2</div>
            <p className="text-xs text-muted-foreground">This week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Suggestions</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">New insights</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Current Tasks</CardTitle>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Task
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="flex flex-col space-y-4 rounded-lg border p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="font-semibold">{task.title}</h3>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={task.client.avatar} />
                          <AvatarFallback>{task.client.name[0]}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-muted-foreground">
                          {task.project}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Badge className={getStatusColor(task.status)}>
                    {task.status.replace("_", " ").toUpperCase()}
                  </Badge>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Due {new Date(task.deadline).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{task.estimatedHours} hours estimated</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Brain className="h-4 w-4" />
                    <span>{task.aiSuggestions.length} AI suggestions</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{task.progress}%</span>
                  </div>
                  <Progress value={task.progress} className="h-2" />
                </div>

                <div className="space-y-2 bg-muted/50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Brain className="h-4 w-4 text-primary" />
                    AI Suggestions
                  </div>
                  <ul className="space-y-1">
                    {task.aiSuggestions.map((suggestion, index) => (
                      <li key={index} className="text-sm text-muted-foreground">
                        • {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm">View Details</Button>
                  <Button size="sm">Update Progress</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}