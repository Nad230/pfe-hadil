// Update TaskCard component to include actions
"use client"

import { Card } from "@/components/ui/card"
import { Task } from "@/lib/types/project"
import { motion } from "framer-motion"
import { Clock, Edit, Trash2 } from "lucide-react"

interface TaskCardProps {
  task: Task
  onEdit: (task: Task) => void
  onDelete: (taskId: string) => void
}
const priorityColors = {
  low: "bg-green-100 text-green-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-red-100 text-red-800"
};

const statusColors = {
  todo: "from-blue-500/20 to-transparent",
  doing: "from-amber-500/20 to-transparent",
  done: "from-emerald-500/20 to-transparent"
}

export function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -5 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card
        className="overflow-hidden cursor-move group"
        draggable
        onDragStart={(e) => {
          e.dataTransfer.setData("task", JSON.stringify(task))
          e.dataTransfer.effectAllowed = "move"
        }}
      >
        <div className="relative p-6">
          <div className={`absolute inset-0 bg-gradient-to-br ${statusColors[task.status]} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
          <div className="relative space-y-3">
            <div className="flex justify-between items-start">
              <h4 className="text-lg font-semibold">{task.name}</h4>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={(e) => {
                    e.stopPropagation()
                    onEdit(task)
                  }}
                  className="text-muted-foreground hover:text-primary"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete(task.id)
                  }}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
      

            <p className="text-sm text-muted-foreground line-clamp-2">
              {task.description}
            </p>

            <div className="flex items-center gap-2">
  <div className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[task.priority]}`}>
    {task.priority}
  </div>
  {task.startDate && task.dueDate && (
    <div className="flex items-center gap-1 text-xs text-muted-foreground">
      <Clock className="h-3 w-3" />
      <span>{new Date(task.startDate).toLocaleDateString()} - {new Date(task.dueDate).toLocaleDateString()}</span>
    </div>
  )}
</div>
            {task.estimatedHours && (
              <div className="flex items-center gap-2 text-sm text-purple-500">
                <Clock className="h-4 w-4" />
                <span>{task.estimatedHours} hours estimated</span>
              </div>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  )
}