"use client"

import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Calendar, ListTodo } from "lucide-react"
import { Milestone } from "@/lib/types/project"
import { motion } from "framer-motion"
import { differenceInDays } from "date-fns"

interface MilestoneCardProps {
  milestone: Milestone
  onClick: () => void
}
const priorityColors = {
  low: "bg-green-100 text-green-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-red-100 text-red-800"
};
const statusColors = {
  planned: "from-blue-500/20 to-transparent",
  in_progress: "from-amber-500/20 to-transparent",
  completed: "from-emerald-500/20 to-transparent"
}


export function MilestoneCard({ milestone, onClick }: MilestoneCardProps) {
    const completedTasks = (milestone.tasks ?? []).filter(t => t.status === "done").length
    const progress = milestone.tasks && milestone.tasks.length > 0
    ? (completedTasks / milestone.tasks.length) * 100
    : 0
    const daysLeft = differenceInDays(
        new Date(milestone.dueDate || milestone.deadline || new Date()), 
        new Date()
      )
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -5 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card
        className="overflow-hidden cursor-pointer group"
        onClick={onClick}
        draggable
        onDragStart={(e) => {
          e.dataTransfer.setData("milestone", JSON.stringify(milestone))
          e.dataTransfer.effectAllowed = "move"
        }}
      >
        <div className="relative p-6">
          <div className={`absolute inset-0 bg-gradient-to-br ${statusColors[milestone.status]} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
          <div className="relative space-y-4">
            <div>
              <h4 className="text-lg font-semibold">{milestone.name}</h4>
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                {milestone.description}
              </p>
              <p className={`px-2 py-1 rounded-full text-xs ${priorityColors[milestone.priority]}`}>
                  {milestone.priority}
              </p>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-blue-500">
                <Calendar className="h-4 w-4" />
                <span>{daysLeft} days left</span>
              </div>
              <div className="flex items-center gap-2 text-purple-500">
                <ListTodo className="h-4 w-4" />
                <span>{completedTasks}/{milestone.tasks?.length ?? 0}</span>
                </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent rounded-full" />
              <Progress value={progress} className="h-2 relative" />
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}