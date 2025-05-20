"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { TaskCard } from "./task-card"
import { Task, TaskStatus } from "@/lib/types/project"

interface TaskColumnProps {
  status: TaskStatus
  tasks: Task[]
  onDragEnd: (task: Task, newStatus: TaskStatus) => void
  onEdit: (task: Task) => void
  onDelete: (taskId: string) => void
  onTaskClick?: (task: Task) => void // Add this line
}

const columnTitles: Record<TaskStatus, string> = {
  todo: "To Do",
  doing: "In Progress",
  done: "Completed"
}

const columnColors: Record<TaskStatus, string> = {
  todo: "bg-blue-100 dark:bg-blue-900",
  doing: "bg-amber-100 dark:bg-amber-900",
  done: "bg-green-100 dark:bg-green-900"
}

export function TaskColumn({ 
  status, 
  tasks, 
  onDragEnd, 
  onEdit, 
  onDelete, 
  onTaskClick  // Add this line
}: TaskColumnProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className={`px-4 py-2 rounded-lg ${columnColors[status]}`}>
        <h3 className="font-semibold">{columnTitles[status]}</h3>
        <p className="text-sm text-muted-foreground">{tasks.length} tasks</p>
      </div>

      <div 
        className="flex-1 p-4 rounded-lg bg-muted/50 min-h-[500px]"
        onDragOver={(e) => {
          e.preventDefault()
          e.dataTransfer.dropEffect = "move"
        }}
        onDrop={(e) => {
          e.preventDefault()
          const task = JSON.parse(e.dataTransfer.getData("task"))
          onDragEnd(task, status)
        }}
      >
        <div className="space-y-4">
          {tasks.map((task, index) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
            onClick={() => onTaskClick?.(task)} // Add this onClick handler
  className="cursor-pointer" // Add cursor pointer
>
  <TaskCard 
    task={task}
    onEdit={onEdit}
    onDelete={onDelete}
    onDragEnd={(newStatus) => onDragEnd(task, newStatus)}
  />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}