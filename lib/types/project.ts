export type MilestoneStatus = "planned" | "in_progress" | "completed"
export type TaskStatus = "todo" | "doing" | "done"

export interface Task {
  id: string
  name: string
  description?: string
  status: TaskStatus
  estimatedHours?: number
  createdAt: string
  updatedAt: string
  assignedToIds?: string[];  // Changed from assignedToId

}

export interface Milestone {
  id: string
  name: string
  description?: string
  status: MilestoneStatus
  deadline: string
  tasks: Task[]
  createdAt: string
  updatedAt: string
}

export interface Project {
  id: string
  name: string
  description?: string
  goal: string
  deadline: string
  milestones: Milestone[]
  createdAt: string
  updatedAt: string
}