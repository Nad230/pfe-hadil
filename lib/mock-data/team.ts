export interface TeamMember {
    id: string
    fullName: string
    email: string
    role: string
    avatar: string
    taskProgress: number
    activeTasks: number
    completedTasks: number
    stats: {
      totalHours: number
      totalComments: number
      completedMilestones: number
    }
    tasks: {
      id: string
      name: string
      description: string
      progress: number
      timeSpent: number // in hours
    }[]
    milestones: {
      name: string
      description: string
      completed: boolean
      completedAt?: string
    }[]
    recentActivity: {
      date: string
      description: string
      comment?: string
    }[]
  }
  
  export const mockTeamMembers: TeamMember[] = [
    {
      id: "1",
      fullName: "Sarah Chen",
      email: "sarah.chen@example.com",
      role: "Lead Developer",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
      taskProgress: 75,
      activeTasks: 3,
      completedTasks: 28,
      stats: {
        totalHours: 187,
        totalComments: 156,
        completedMilestones: 12
      },
      tasks: [
        {
          id: "1",
          name: "API Integration",
          description: "Implement new payment gateway API endpoints",
          progress: 80,
          timeSpent: 24
        },
        {
          id: "2",
          name: "Performance Optimization",
          description: "Optimize database queries for better performance",
          progress: 45,
          timeSpent: 16
        },
        {
          id: "3",
          name: "Code Review",
          description: "Review pull requests from team members",
          progress: 60,
          timeSpent: 8
        }
      ],
      milestones: [
        {
          name: "Payment System Upgrade",
          description: "Complete upgrade of payment processing system",
          completed: true,
          completedAt: "2024-03-15T00:00:00Z"
        },
        {
          name: "Database Migration",
          description: "Migrate to new database architecture",
          completed: true,
          completedAt: "2024-02-28T00:00:00Z"
        },
        {
          name: "Security Audit",
          description: "Conduct comprehensive security review",
          completed: false
        }
      ],
      recentActivity: [
        {
          date: "2024-03-19T10:30:00Z",
          description: "Completed API endpoint implementation",
          comment: "All tests passing, ready for review"
        },
        {
          date: "2024-03-18T15:45:00Z",
          description: "Code review for authentication module",
          comment: "Suggested improvements for error handling"
        },
        {
          date: "2024-03-17T09:15:00Z",
          description: "Started work on performance optimization"
        }
      ]
    },
    {
      id: "2",
      fullName: "Marcus Rodriguez",
      email: "marcus.rodriguez@example.com",
      role: "Frontend Developer",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
      taskProgress: 65,
      activeTasks: 4,
      completedTasks: 22,
      stats: {
        totalHours: 156,
        totalComments: 98,
        completedMilestones: 8
      },
      tasks: [
        {
          id: "4",
          name: "UI Redesign",
          description: "Implement new design system components",
          progress: 70,
          timeSpent: 32
        },
        {
          id: "5",
          name: "Accessibility Improvements",
          description: "Enhance accessibility across the platform",
          progress: 40,
          timeSpent: 12
        }
      ],
      milestones: [
        {
          name: "Design System Implementation",
          description: "Complete implementation of new design system",
          completed: true,
          completedAt: "2024-03-10T00:00:00Z"
        },
        {
          name: "Mobile Responsiveness",
          description: "Ensure full mobile compatibility",
          completed: false
        }
      ],
      recentActivity: [
        {
          date: "2024-03-19T11:20:00Z",
          description: "Updated component library documentation"
        },
        {
          date: "2024-03-18T14:30:00Z",
          description: "Fixed responsive layout issues",
          comment: "Resolved breakpoint inconsistencies"
        }
      ]
    },
    {
      id: "3",
      fullName: "Emma Watson",
      email: "emma.watson@example.com",
      role: "Product Designer",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
      taskProgress: 85,
      activeTasks: 2,
      completedTasks: 34,
      stats: {
        totalHours: 164,
        totalComments: 212,
        completedMilestones: 15
      },
      tasks: [
        {
          id: "6",
          name: "User Research",
          description: "Conduct user interviews and analysis",
          progress: 90,
          timeSpent: 28
        },
        {
          id: "7",
          name: "Design System Updates",
          description: "Update design tokens and documentation",
          progress: 60,
          timeSpent: 18
        }
      ],
      milestones: [
        {
          name: "User Research Phase 1",
          description: "Complete initial user research and analysis",
          completed: true,
          completedAt: "2024-03-12T00:00:00Z"
        },
        {
          name: "Design System Documentation",
          description: "Complete comprehensive design documentation",
          completed: true,
          completedAt: "2024-02-25T00:00:00Z"
        }
      ],
      recentActivity: [
        {
          date: "2024-03-19T09:45:00Z",
          description: "Completed user interview sessions",
          comment: "Gathered valuable insights for next iteration"
        },
        {
          date: "2024-03-18T13:15:00Z",
          description: "Updated design system documentation"
        }
      ]
    }
  ]