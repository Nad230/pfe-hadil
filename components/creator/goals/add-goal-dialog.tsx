"use client"

import { Dialog, DialogContent } from "@/components/ui/dialog"
import { GoalWizard } from "./goal-wizard"

interface AddGoalDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddGoalDialog({ open, onOpenChange }: AddGoalDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl">
        <GoalWizard />
      </DialogContent>
    </Dialog>
  )
}