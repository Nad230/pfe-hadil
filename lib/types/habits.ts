// Types for habit data
export interface Habit {
  id: string
  userId: string
  goalId?: string
  name: string
  type: "GoodHabit" | "BadHabit"
  description?: string
  weeklyTarget: number
  status: "NotStarted" | "InProgress" | "Paused" | "Completed"
  streak: number
  createdAt: string
  updatedAt: string
  completions?: HabitCompletion[]
  goal?: Goal
  badges?: Badge[]
}

export interface HabitCompletion {
  id: string
  habitId: string
  date: string
  completed: boolean
  notes?: string
}

export interface CreateHabitDto {
  name: string
  description?: string
  type: "GoodHabit" | "BadHabit"
  weeklyTarget?: number
  status?: "NotStarted" | "InProgress" | "Paused" | "Completed"
  goalId?: string
}

export interface Goal {
  id: string
  userId: string
  title: string
  description?: string
  deadline?: string
  status: "NotStarted" | "InProgress" | "Paused" | "Completed"
  createdAt: string
  updatedAt: string
}

export interface Badge {
  id: string
  habitId: string
  type: "Streak" | "Consistency" | "Achievement" | "Milestone"
  name: string
  description: string
  earnedAt: string
}

export interface DisciplineScore {
  score: number
  level: string
  nextLevel: string
  progress: number
}
