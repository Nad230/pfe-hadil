"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, ChevronDown, ChevronRight } from "lucide-react"
import { Project, MilestoneStatus, Milestone, Task } from "@/lib/types/project"
import { cn } from "@/lib/utils"

interface ProjectBoardProps {
  project: Project
}

const statusColors: Record<MilestoneStatus, {
  bg: string,
  border: string,
  text: string,
  gradient: string
}> = {
  planned: {
    bg: "bg-blue-50 dark:bg-blue-950",
    border: "border-blue-200 dark:border-blue-800",
    text: "text-blue-700 dark:text-blue-300",
    gradient: "from-blue-50/50 dark:from-blue-950/50"
  },
  in_progress: {
    bg: "bg-amber-50 dark:bg-amber-950",
    border: "border-amber-200 dark:border-amber-800",
    text: "text-amber-700 dark:text-amber-300",
    gradient: "from-amber-50/50 dark:from-amber-950/50"
  },
  completed: {
    bg: "bg-emerald-50 dark:bg-emerald-950",
    border: "border-emerald-200 dark:border-emerald-800",
    text: "text-emerald-700 dark:text-emerald-300",
    gradient: "from-emerald-50/50 dark:from-emerald-950/50"
  }
}

const taskStatusColors = {
  todo: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  doing: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  done: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
}

export function ProjectBoard({ project }: ProjectBoardProps) {
  const [expandedMilestone, setExpandedMilestone] = useState<string | null>(null)
  const [showAddDialog, setShowAddDialog] = useState(false)

  const columns: MilestoneStatus[] = ["planned", "in_progress", "completed"]
  
  const handleDragEnd = (milestone: Milestone, newStatus: MilestoneStatus) => {
    // Handle milestone status update
    console.log("Update milestone status:", milestone.id, newStatus)
  }

  const handleTaskDragEnd = (task: Task, newStatus: "todo" | "doing" | "done") => {
    // Handle task status update
    console.log("Update task status:", task.id, newStatus)
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Project Timeline</h2>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Milestone
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {columns.map(status => {
          const milestones = project.milestones.filter(m => m.status === status)
          const colors = statusColors[status]
          
          return (
            <div key={status} className="space-y-4">
              <div className={cn(
                "px-4 py-3 rounded-lg border",
                colors.bg,
                colors.border
              )}>
                <h3 className={cn("font-semibold capitalize", colors.text)}>
                  {status.replace("_", " ")}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {milestones.length} milestone{milestones.length !== 1 ? 's' : ''}
                </p>
              </div>

              <div 
                className={cn(
                  "min-h-[700px] rounded-lg bg-gradient-to-b",
                  colors.gradient,
                  "to-transparent border",
                  colors.border
                )}
                onDragOver={(e) => {
                  e.preventDefault()
                  e.dataTransfer.dropEffect = "move"
                }}
                onDrop={(e) => {
                  e.preventDefault()
                  const milestone = JSON.parse(e.dataTransfer.getData("milestone"))
                  handleDragEnd(milestone, status)
                }}
              >
                <div className="p-4 space-y-4">
                  {milestones.map((milestone) => (
                    <motion.div
                      key={milestone.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                    >
                      <Card 
                        className={cn(
                          "overflow-hidden transition-all duration-200",
                          expandedMilestone === milestone.id ? "ring-2 ring-primary" : "hover:ring-2 hover:ring-primary/50"
                        )}
                      >
                        <div className="p-4">
                          <div 
                            className="flex items-start gap-4 cursor-pointer"
                            onClick={() => setExpandedMilestone(
                              expandedMilestone === milestone.id ? null : milestone.id
                            )}
                          >
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 shrink-0"
                            >
                              {expandedMilestone === milestone.id ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </Button>
                            
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold truncate">{milestone.name}</h4>
                              {milestone.description && (
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  {milestone.description}
                                </p>
                              )}
                              <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                                <span>Due: {new Date(milestone.deadline).toLocaleDateString()}</span>
                                <span>•</span>
                                <span>{milestone.tasks.length} tasks</span>
                              </div>
                            </div>
                          </div>

                          <AnimatePresence>
                            {expandedMilestone === milestone.id && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="mt-4 pt-4 border-t"
                              >
                                <div className="grid grid-cols-3 gap-3">
                                  {(["todo", "doing", "done"] as const).map(taskStatus => (
                                    <div
                                      key={taskStatus}
                                      className={cn(
                                        "p-3 rounded-lg",
                                        taskStatusColors[taskStatus]
                                      )}
                                      onDragOver={(e) => {
                                        e.preventDefault()
                                        e.dataTransfer.dropEffect = "move"
                                      }}
                                      onDrop={(e) => {
                                        e.preventDefault()
                                        const task = JSON.parse(e.dataTransfer.getData("task"))
                                        handleTaskDragEnd(task, taskStatus)
                                      }}
                                    >
                                      <h5 className="text-sm font-medium mb-2 capitalize">
                                        {taskStatus}
                                      </h5>
                                      <div className="space-y-2">
                                        {milestone.tasks
                                          .filter(task => task.status === taskStatus)
                                          .map(task => (
                                            <div
                                              key={task.id}
                                              className="p-2 bg-white dark:bg-gray-800 rounded shadow-sm"
                                              draggable
                                              onDragStart={(e) => {
                                                e.dataTransfer.setData("task", JSON.stringify(task))
                                                e.dataTransfer.effectAllowed = "move"
                                              }}
                                            >
                                              <p className="text-sm font-medium">{task.name}</p>
                                              {task.description && (
                                                <p className="text-xs text-muted-foreground mt-1">
                                                  {task.description}
                                                </p>
                                              )}
                                              {task.estimatedHours && (
                                                <p className="text-xs text-muted-foreground mt-1">
                                                  {task.estimatedHours}h estimated
                                                </p>
                                              )}
                                            </div>
                                          ))}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}