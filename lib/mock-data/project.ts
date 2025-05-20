import { Project } from "../types/project"

export const mockProject: Project = {
  id: "1",
  name: "E-commerce Platform",
  description: "Build a modern e-commerce platform with advanced features",
  goal: "Launch MVP by Q2 2024",
  deadline: "2024-06-30T23:59:59Z",
  createdAt: "2024-03-01T00:00:00Z",
  updatedAt: "2024-03-01T00:00:00Z",
  milestones: [
    {
      id: "1",
      name: "Frontend Development",
      description: "Implement the user interface and client-side functionality",
      status: "in_progress",
      deadline: "2024-04-30T23:59:59Z",
      createdAt: "2024-03-01T00:00:00Z",
      updatedAt: "2024-03-01T00:00:00Z",
      tasks: [
        {
          id: "1",
          name: "Design System Setup",
          description: "Set up design tokens, components, and documentation",
          status: "done",
          estimatedHours: 16,
          createdAt: "2024-03-01T00:00:00Z",
          updatedAt: "2024-03-01T00:00:00Z",
        },
        {
          id: "2",
          name: "Product Catalog",
          description: "Implement product listing and filtering",
          status: "doing",
          estimatedHours: 24,
          createdAt: "2024-03-01T00:00:00Z",
          updatedAt: "2024-03-01T00:00:00Z",
        },
        {
          id: "3",
          name: "Shopping Cart",
          description: "Build shopping cart functionality",
          status: "todo",
          estimatedHours: 20,
          createdAt: "2024-03-01T00:00:00Z",
          updatedAt: "2024-03-01T00:00:00Z",
        }
      ]
    },
    {
      id: "2",
      name: "Backend Development",
      description: "Implement server-side functionality and APIs",
      status: "planned",
      deadline: "2024-05-31T23:59:59Z",
      createdAt: "2024-03-01T00:00:00Z",
      updatedAt: "2024-03-01T00:00:00Z",
      tasks: [
        {
          id: "4",
          name: "Database Schema",
          description: "Design and implement database schema",
          status: "todo",
          estimatedHours: 12,
          createdAt: "2024-03-01T00:00:00Z",
          updatedAt: "2024-03-01T00:00:00Z",
        },
        {
          id: "5",
          name: "Authentication",
          description: "Implement user authentication and authorization",
          status: "todo",
          estimatedHours: 16,
          createdAt: "2024-03-01T00:00:00Z",
          updatedAt: "2024-03-01T00:00:00Z",
        }
      ]
    }
  ]
}