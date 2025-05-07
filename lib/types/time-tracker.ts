export type TaskStatus = 'not_started' | 'in_progress' | 'completed' | 'paused'

export interface Project {
  ownerId: string | null
  id: string
  name: string
  description?: string
  color: string
  isArchived: boolean
  createdAt: string
  updatedAt: string
}

export interface Task {
  id: string
  projectId: string
  name: string
  description?: string
  status: TaskStatus
  estimatedHours?: number
  createdAt: string
  updatedAt: string
}

export interface TimeEntry {
  id: string
  taskId: string
  projectId: string
  startTime: string
  endTime?: string
  duration: number // in seconds
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface TimeReport {
  totalDuration: number
  projectBreakdown: {
    [projectId: string]: number
  }
  dailyBreakdown: {
    [date: string]: number
  }
  entries: TimeEntry[]
}