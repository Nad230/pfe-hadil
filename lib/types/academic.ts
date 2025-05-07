"use client"

export interface Task {
  id: string
  title: string
  description: string
  deadline: string
  isGroupTask: boolean
  points: number
  createdBy: {
    id: string
    name: string
    role: "teacher" | "student"
  }
}

export interface TaskSubmission {
  id: string
  studentId: string
  studentName: string
  avatar: string
  status: "pending" | "completed"
  points?: number
  rating?: number
  submittedAt: string
  file: string
}