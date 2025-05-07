// Types for habit completion tracking
export interface HabitCompletionRequest {
    habitId: string
    completed: boolean
    notes?: string
  }
  
  export interface HabitCompletionResponse {
    id: string
    habitId: string
    date: string
    completed: boolean
    notes?: string
  }
  