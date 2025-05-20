"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { MilestoneCard } from "./milestone-card"
import { Milestone, MilestoneStatus } from "@/lib/types/project"
import { Button } from "../ui/button"
import { Edit, Trash2 } from "lucide-react"

interface MilestoneColumnProps {
  status: "planned" | "in_progress" | "completed"
  milestones: Milestone[]
  onDragEnd: (milestone: Milestone, newStatus: "planned" | "in_progress" | "completed") => void
  onSelect: (id: string) => void
  onEdit?: (milestone: Milestone) => void
  onDelete?: (id: string) => void
  currentUserId?: string
}

const columnTitles: Record<MilestoneStatus, string> = {
  planned: "Planned",
  in_progress: "In Progress",
  completed: "Completed"
}

const columnColors: Record<MilestoneStatus, string> = {
  planned: "bg-blue-100 dark:bg-blue-900",
  in_progress: "bg-amber-100 dark:bg-amber-900",
  completed: "bg-green-100 dark:bg-green-900"
}

export function MilestoneColumn({
  status,
  milestones,
  onDragEnd,
  onSelect,
  onEdit,
  onDelete,
  currentUserId
}: MilestoneColumnProps) {
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const milestone = JSON.parse(e.dataTransfer.getData("milestone"))
    onDragEnd(milestone, status)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className={`px-4 py-2 rounded-lg ${columnColors[status]}`}>
        <h3 className="font-semibold">{columnTitles[status]}</h3>
        <p className="text-sm text-muted-foreground">{milestones.length} milestones</p>
      </div>
  
      <div 
        className="flex-1 p-4 rounded-lg bg-muted/50 min-h-[500px]"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        <div className="space-y-4">
          {milestones.map((milestone, index) => {
            const isOwner = currentUserId === milestone.assignedBy
            
            return (
              <motion.div
                key={milestone.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="space-y-2">
                  <MilestoneCard
                    milestone={milestone}
                    onClick={() => onSelect(milestone.id)}
                  />

                  {(isOwner && onEdit && onDelete) && (
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => onEdit(milestone)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => onDelete(milestone.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}