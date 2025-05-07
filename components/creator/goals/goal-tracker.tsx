"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Plus, Target, TrendingUp, Users, DollarSign } from "lucide-react"
import { AddGoalDialog } from "./add-goal-dialog" // Adjust import path as needed
import { useState } from "react"

export function GoalTracker() {

  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const goals = [
    {
      id: "1",
      title: "Follower Growth",
      target: 100000,
      current: 85000,
      type: "followers",
      deadline: "2024-04-30",
      progress: 85
    },
    {
      id: "2",
      title: "Monthly Revenue",
      target: 10000,
      current: 7500,
      type: "revenue",
      deadline: "2024-04-30",
      progress: 75
    },
    {
      id: "3",
      title: "Engagement Rate",
      target: 10,
      current: 5.8,
      type: "engagement",
      deadline: "2024-04-30",
      progress: 58
    },
    {
      id: "4",
      title: "Brand Deals",
      target: 5,
      current: 3,
      type: "deals",
      deadline: "2024-04-30",
      progress: 60
    }
  ]

  const getIcon = (type: string) => {
    switch (type) {
      case "followers":
        return Users
      case "revenue":
        return DollarSign
      case "engagement":
        return TrendingUp
      case "deals":
        return Target
      default:
        return Target
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Creator Goals</h2>
          <p className="text-muted-foreground">Track your progress and achieve your targets</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add New Goal
        </Button>
      </div>
      <AddGoalDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
      />
      <div className="grid gap-6 md:grid-cols-2">
        {goals.map((goal) => {
          const Icon = getIcon(goal.type)
          return (
            <Card key={goal.id}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    {goal.title}
                  </div>
                </CardTitle>
                <span className="text-sm text-muted-foreground">
                  Due {new Date(goal.deadline).toLocaleDateString()}
                </span>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl font-bold">
                      {goal.type === "revenue" ? "$" : ""}
                      {goal.current.toLocaleString()}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      Target: {goal.type === "revenue" ? "$" : ""}
                      {goal.target.toLocaleString()}
                      {goal.type === "engagement" ? "%" : ""}
                    </span>
                  </div>
                  <Progress value={goal.progress} className="h-2" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    {goal.progress}% completed
                  </p>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="text-sm font-medium mb-2">Milestones</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <span>25% - {new Date(goal.deadline).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <span>50% - {new Date(goal.deadline).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 rounded-full bg-yellow-500" />
                      <span>75% - In Progress</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 rounded-full bg-gray-300" />
                      <span>100% - Target</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}