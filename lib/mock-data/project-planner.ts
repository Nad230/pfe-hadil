import { Project, Milestone, Task, TeamMember } from "@/lib/types/project-planner"

export const mockTeamMembers: TeamMember[] = [
  {
    id: "1",
    name: "Alex Johnson",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    role: "Project Manager"
  },
  {
    id: "2",
    name: "Sam Taylor",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    role: "Developer"
  },
  {
    id: "3",
    name: "Jamie Smith",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
    role: "Designer"
  }
]

export const mockTasks: Task[] = [
  {
    id: "task-1",
    title: "Research market trends",
    description: "Analyze current market trends and competitor offerings",
    status: "completed",
    priority: "high",
    estimatedHours: 8,
    actualHours: 10,
    assignedTo: "1",
    startDate: "2024-03-01",
    dueDate: "2024-03-05",
    completedDate: "2024-03-05",
    createdAt: "2024-02-28",
    updatedAt: "2024-03-05"
  },
  {
    id: "task-2",
    title: "Create wireframes",
    description: "Design initial wireframes for key pages",
    status: "completed",
    priority: "high",
    estimatedHours: 12,
    actualHours: 14,
    assignedTo: "3",
    dependsOn: ["task-1"],
    startDate: "2024-03-06",
    dueDate: "2024-03-10",
    completedDate: "2024-03-11",
    createdAt: "2024-02-28",
    updatedAt: "2024-03-11"
  },
  {
    id: "task-3",
    title: "Develop prototype",
    description: "Create interactive prototype based on wireframes",
    status: "in_progress",
    priority: "medium",
    estimatedHours: 20,
    actualHours: 15,
    assignedTo: "2",
    dependsOn: ["task-2"],
    startDate: "2024-03-12",
    dueDate: "2024-03-20",
    createdAt: "2024-02-28",
    updatedAt: "2024-03-15"
  },
  {
    id: "task-4",
    title: "User testing",
    description: "Conduct user testing sessions with prototype",
    status: "not_started",
    priority: "medium",
    estimatedHours: 16,
    assignedTo: "1",
    dependsOn: ["task-3"],
    dueDate: "2024-03-30",
    createdAt: "2024-02-28",
    updatedAt: "2024-02-28"
  },
  {
    id: "task-5",
    title: "Create database schema",
    description: "Design and implement database structure",
    status: "in_progress",
    priority: "high",
    estimatedHours: 10,
    actualHours: 6,
    assignedTo: "2",
    startDate: "2024-03-05",
    dueDate: "2024-03-15",
    createdAt: "2024-02-28",
    updatedAt: "2024-03-10"
  },
  {
    id: "task-6",
    title: "Implement authentication",
    description: "Set up user authentication system",
    status: "not_started",
    priority: "high",
    estimatedHours: 12,
    assignedTo: "2",
    dependsOn: ["task-5"],
    dueDate: "2024-03-25",
    createdAt: "2024-02-28",
    updatedAt: "2024-02-28"
  },
  {
    id: "task-7",
    title: "Design visual identity",
    description: "Create logo, color scheme, and design system",
    status: "completed",
    priority: "medium",
    estimatedHours: 16,
    actualHours: 18,
    assignedTo: "3",
    startDate: "2024-03-01",
    dueDate: "2024-03-15",
    completedDate: "2024-03-14",
    createdAt: "2024-02-28",
    updatedAt: "2024-03-14"
  },
  {
    id: "task-8",
    title: "Create marketing materials",
    description: "Design promotional materials for launch",
    status: "not_started",
    priority: "low",
    estimatedHours: 12,
    assignedTo: "3",
    dependsOn: ["task-7"],
    dueDate: "2024-04-15",
    createdAt: "2024-02-28",
    updatedAt: "2024-02-28"
  }
]

export const mockMilestones: Milestone[] = [
  {
    id: "milestone-1",
    title: "Research & Planning",
    description: "Initial research and project planning phase",
    status: "completed",
    startDate: "2024-03-01",
    dueDate: "2024-03-05",
    completedDate: "2024-03-05",
    tasks: [mockTasks[0]],
    createdAt: "2024-02-28",
    updatedAt: "2024-03-05"
  },
  {
    id: "milestone-2",
    title: "Design Phase",
    description: "Create wireframes and visual identity",
    status: "completed",
    startDate: "2024-03-06",
    dueDate: "2024-03-15",
    completedDate: "2024-03-14",
    tasks: [mockTasks[1], mockTasks[6]],
    createdAt: "2024-02-28",
    updatedAt: "2024-03-14"
  },
  {
    id: "milestone-3",
    title: "Development - Core Features",
    description: "Implement core functionality and database",
    status: "in_progress",
    startDate: "2024-03-05",
    dueDate: "2024-03-25",
    tasks: [mockTasks[2], mockTasks[4], mockTasks[5]],
    createdAt: "2024-02-28",
    updatedAt: "2024-03-15"
  },
  {
    id: "milestone-4",
    title: "Testing & Refinement",
    description: "User testing and feature refinement",
    status: "not_started",
    startDate: "2024-03-26",
    dueDate: "2024-04-10",
    tasks: [mockTasks[3]],
    createdAt: "2024-02-28",
    updatedAt: "2024-02-28"
  },
  {
    id: "milestone-5",
    title: "Launch Preparation",
    description: "Final preparations for product launch",
    status: "not_started",
    startDate: "2024-04-11",
    dueDate: "2024-04-20",
    tasks: [mockTasks[7]],
    createdAt: "2024-02-28",
    updatedAt: "2024-02-28"
  }
]

export const mockProject: Project = {
  id: "project-1",
  name: "Mobile App Redesign",
  description: "Comprehensive redesign of our flagship mobile application",
  tags: ["Mobile", "UI/UX", "React Native"],
  mainGoal: "Improve user engagement and satisfaction through intuitive design",
  estimatedCompletionDate: "2024-04-20",
  milestones: mockMilestones,
  teamMembers: mockTeamMembers,
  createdAt: "2024-02-28",
  updatedAt: "2024-03-15"
}