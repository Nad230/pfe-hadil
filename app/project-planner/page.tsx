"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProjectOverview } from "@/components/project-planner/project-overview"
import { MilestoneTimeline } from "@/components/project-planner/milestone-timeline"
import { TaskBreakdown } from "@/components/project-planner/task-breakdown"
import { ProjectProgress } from "@/components/project-planner/project-progress"
import { mockProject } from "@/lib/mock-data/project-planner"

export default function ProjectPlannerPage() {
  const [project, setProject] = useState(mockProject)

  const handleProjectUpdate = (updatedProject: typeof project) => {
    setProject(updatedProject)
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Project Planner</h1>
      </div>

      <ProjectOverview 
        project={project} 
        onUpdate={(updatedOverview) => {
          setProject({
            ...project,
            name: updatedOverview.name,
            description: updatedOverview.description,
            tags: updatedOverview.tags,
            mainGoal: updatedOverview.mainGoal,
            estimatedCompletionDate: updatedOverview.estimatedCompletionDate
          })
        }}
      />

      <Tabs defaultValue="timeline" className="space-y-6">
        <TabsList>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
        </TabsList>
        
        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>Milestones & Timeline</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <MilestoneTimeline 
                milestones={project.milestones}
                onUpdate={(updatedMilestones) => {
                  setProject({
                    ...project,
                    milestones: updatedMilestones
                  })
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="tasks">
          <TaskBreakdown 
            milestones={project.milestones}
            onUpdate={(updatedMilestones) => {
              setProject({
                ...project,
                milestones: updatedMilestones
              })
            }}
          />
        </TabsContent>
        
        <TabsContent value="progress">
          <ProjectProgress project={project} />
        </TabsContent>
      </Tabs>
    </div>
  )
}