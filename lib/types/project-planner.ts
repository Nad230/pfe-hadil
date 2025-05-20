export type MilestoneStatus = 'not_started' | 'in_progress' | 'completed'
export type TaskPriority = 'low' | 'medium' | 'high'
export type TaskStatus = 'not_started' | 'in_progress' | 'completed'

export interface TeamMember {
  id: string
  name: string
  avatar?: string
  role?: string
}

export interface Task {
  id: string
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  estimatedHours?: number
  actualHours?: number
  assignedTo?: string
  dependsOn?: string[]
  startDate?: string
  dueDate?: string
  completedDate?: string
  createdAt: string
  updatedAt: string
}

export interface Milestone {
  id: string
  title: string
  description?: string
  status: MilestoneStatus
  startDate?: string
  dueDate?: string
  completedDate?: string
  tasks: Task[]
  createdAt: string
  updatedAt: string
}

export interface Project {
  id: string
  name: string
  description: string
  tags: string[]
  mainGoal: string
  estimatedCompletionDate: string
  milestones: Milestone[]
  teamMembers?: TeamMember[]
  createdAt: string
  updatedAt: string
}