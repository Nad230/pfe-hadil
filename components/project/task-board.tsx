"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Play, Plus } from "lucide-react"
import { TaskColumn } from "./task-column"
import { Task, TaskStatus } from "@/lib/types/project"
import { useTimerControls } from "@/hooks/useTimerControls"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import Cookies from "js-cookie"
import { useParams } from "next/navigation"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface TaskBoardProps {
  milestoneId: string
  onBack: () => void
}

export function TaskBoard({ milestoneId, onBack }: TaskBoardProps) {
  const params = useParams()
  const projectId = params.id as string
  const [tasks, setTasks] = useState<Task[]>([])
  const [milestone, setMilestone] = useState<any>(null)
  const { startTimer } = useTimerControls()
const [trackingTask, setTrackingTask] = useState<Task | null>(null)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [newTask, setNewTask] = useState<Partial<Task>>({
    name: "",
    description: "",
    status: "todo",
    priority: "medium",
    startDate: "",
    dueDate: ""
  })
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [projectData, setProjectData] = useState<any>(null)
  const [teamMembers, setTeamMembers] = useState<any[]>([])
  const [isAddingTeamMember, setIsAddingTeamMember] = useState(false)
  const [searchedUser, setSearchedUser] = useState<any>(null)
const [selectedAssignees, setSelectedAssignees] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
const [currentUser, setCurrentUser] = useState<any>(null)
const isOwner = currentUser?.sub === projectData?.userId
  const columns: TaskStatus[] = ["todo", "doing", "done"]
  const [editingTask, setEditingTask] = useState<Task | null>(null)



// Add these handlers
const handleEditTask = (task: Task) => {
  setEditingTask(task)
  setSelectedAssignees(task.assignedToIds || []);
  setNewTask({
    name: task.name,
    description: task.description,
    status: task.status,
    priority: task.priority,
    startDate: task.startDate ? new Date(task.startDate).toISOString().split('T')[0] : "",
    dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : "",
  })
}



useEffect(() => {
  const fetchCurrentUser = async () => {
    const token = Cookies.get("token")
    if (!token) return
    
    try {
      const response = await fetch("http://localhost:3000/auth/me", {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await response.json()
      setCurrentUser(data)
    } catch (error) {
      console.error("Error fetching current user:", error)
    }
  }
  fetchCurrentUser()
}, [])
const handleUpdateTask = async () => {
  if (!editingTask) return

  try {
    const token = Cookies.get("token")
    
    // Format dates for Prisma
    const formattedStartDate = newTask.startDate 
      ? new Date(newTask.startDate).toISOString() 
      : undefined
    
    const formattedDueDate = newTask.dueDate 
      ? new Date(newTask.dueDate).toISOString() 
      : undefined
    
    const response = await fetch(`http://localhost:3000/tasks/${editingTask.id}`, {
      method: 'PATCH',
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        ...newTask,
        startDate: formattedStartDate,
        dueDate: formattedDueDate,
  assignedToIds: selectedAssignees  // Changed from assignedToId
      })
    })

    if (!response.ok) throw new Error("Failed to update task")
    
    setRefreshTrigger(prev => prev + 1)
    setEditingTask(null)
    setNewTask({
      name: "",
      description: "",
      status: "todo",
      priority: "medium",
      startDate: "",
      dueDate: ""
    })
setSelectedAssignees([])
  } catch (error) {
    console.error("Error updating task:", error)
  }
}

const handleDeleteTask = async (taskId: string) => {
  try {
    const token = Cookies.get("token")
    const response = await fetch(`http://localhost:3000/tasks/${taskId}`, {
      method: 'DELETE',
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      }
    })

    if (!response.ok) throw new Error("Failed to delete task")
    
    setRefreshTrigger(prev => prev + 1)
  } catch (error) {
    console.error("Error deleting task:", error)
  }
}

  useEffect(() => {
    const fetchProjectAndTeam = async () => {
      try {
        const token = Cookies.get("token")
        const projectResponse = await fetch(`http://localhost:3000/projects/${projectId}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        const projectData = await projectResponse.json()
        setProjectData(projectData)

        if (projectData.team) {
          const members = await Promise.all(
            projectData.team.members.map(async (member: any) => {
              const userResponse = await fetch(`http://localhost:3000/auth/${member.userId}`, {
                headers: { Authorization: `Bearer ${token}` }
              })
              return userResponse.json()
            })
          )
          setTeamMembers(members)
        }
      } catch (error) {
        console.error("Error fetching project or team members:", error)
      }
    }

    if (projectId) fetchProjectAndTeam()
  }, [projectId, refreshTrigger])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = Cookies.get('token')
        
        const milestoneResponse = await fetch(
          `http://localhost:3000/milestones/${milestoneId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        const milestoneData = await milestoneResponse.json()
        setMilestone(milestoneData)

        const tasksResponse = await fetch(
          `http://localhost:3000/tasks/project/${projectId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        const tasksData = await tasksResponse.json()
        
        const filteredTasks = tasksData.filter((task: Task) => 
          task.milestoneId === milestoneId
        )
        setTasks(filteredTasks)
      } catch (error) {
        console.error('Error loading data:', error)
      }
    }

    if (projectId && milestoneId) fetchData()
  }, [projectId, milestoneId, refreshTrigger])

  // User search handler
  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    try {
      const token = Cookies.get("token")
      const response = await fetch(
        `http://localhost:3000/auth/search?name=${encodeURIComponent(searchQuery)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      const data = await response.json()

      if (!response.ok) {
        setErrorMessage("No users found")
        setSearchedUser(null)
        return
      }

      setSearchedUser(data)
      setErrorMessage("")
    } catch (error) {
      setErrorMessage("An error occurred. Please try again.")
    }
  }

  // Add team member handler
  const handleAddTeamMember = async () => {
    if (!searchedUser) return
    try {
      const token = Cookies.get("token")
      const response = await fetch(
        `http://localhost:3000/team/${projectData.team.id}/add-member`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ userId: searchedUser.id }),
        }
      )

      if (!response.ok) throw new Error("Failed to add member")
      
      // Refresh team members
      const projectResponse = await fetch(`http://localhost:3000/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const updatedProject = await projectResponse.json()
      
      if (updatedProject.team) {
        const updatedMembers = await Promise.all(
          updatedProject.team.members.map(async (member: any) => {
            const userResponse = await fetch(`http://localhost:3000/auth/${member.userId}`, {
              headers: { Authorization: `Bearer ${token}` }
            })
            return userResponse.json()
          })
        )
        setTeamMembers(updatedMembers)
      }

      setIsAddingTeamMember(false)
      setSearchedUser(null)
      setSearchQuery("")
    } catch (error) {
      console.error("Error adding member:", error)
      alert("Failed to add member")
    }
  }

  // User chip component
  // Replace the current UserChip with:
const UserChip = ({ user }: { user: any }) => {
  const isSelected = selectedAssignees.includes(user.id);
  
  return (
    <div
      className={cn(
        "flex items-center rounded-full px-4 py-2 cursor-pointer transition-colors",
        isSelected
          ? "bg-blue-100 border-2 border-blue-500"
          : "bg-gray-100 hover:bg-gray-200"
      )}
      onClick={() => {
        setSelectedAssignees(prev => 
          prev.includes(user.id)
            ? prev.filter(id => id !== user.id) // Remove if exists
            : [...prev, user.id] // Add if new
        );
      }}
    >
      {user.profile_photo ? (
        <img
          src={user.profile_photo}
          className="h-6 w-6 rounded-full mr-2"
          alt={user.fullname}
        />
      ) : (
        <div className="h-6 w-6 rounded-full bg-gray-300 mr-2 flex items-center justify-center">
          {user.fullname?.[0]}
        </div>
      )}
      <span className="text-sm">{user.fullname}</span>
    </div>
  );
};
  // Assignment section component
  const AssignmentSection = () => (
    <div className="space-y-2">
      <label className="text-sm font-medium">Assign To</label>
      <div className="flex flex-wrap gap-2">
        {teamMembers.map((member) => (
          <UserChip key={member.id} user={member} />
        ))}
        {projectData?.team && (
          <button
            onClick={() => setIsAddingTeamMember(true)}
            className="flex items-center bg-blue-500 text-white rounded-full px-4 py-2 hover:bg-blue-600"
          >
            <Plus className="h-4 w-4 mr-1" /> Add Member
          </button>
        )}
      </div>
      {!projectData?.team && (
        <div className="text-gray-500 text-sm">
          Your project is currently solo. Add a team first to assign members.
        </div>
      )}
    </div>
  )

  // Add task handler
  const handleAddTask = async () => {
    if (!newTask.name) return

    try {
      const token = Cookies.get("token")
      
      // Format dates for Prisma - ensure we have valid ISO-8601 strings
      const formattedStartDate = newTask.startDate 
        ? new Date(newTask.startDate).toISOString() 
        : new Date().toISOString()
      
      const formattedDueDate = newTask.dueDate 
        ? new Date(newTask.dueDate).toISOString() 
        : null
      
      const response = await fetch('http://localhost:3000/tasks/create', {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...newTask,
          milestoneId,
  assignedToIds: selectedAssignees,  // Changed from assignedToId
          projectId,
          startDate: formattedStartDate,
          dueDate: formattedDueDate
        })
      })

      if (!response.ok) throw new Error('Failed to create task')
      
      setRefreshTrigger(prev => prev + 1)
      setShowAddDialog(false)
      setNewTask({
        name: "",
        description: "",
        status: "todo",
        priority: "medium",
        startDate: "",
        dueDate: ""
      })
setSelectedAssignees([])
    } catch (error) {
      console.error('Error adding task:', error)
    }
  }
  
  const handleDragEnd = async (task: Task, newStatus: TaskStatus) => {
    const originalTasks = [...tasks]
    
    // Optimistic update
    setTasks(prev => prev.map(t => 
      t.id === task.id ? { ...t, status: newStatus } : t
    ))

    try {
      const token = Cookies.get("token")
      const response = await fetch(`http://localhost:3000/tasks/${task.id}`, {
        method: 'PATCH',
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus })
      })

      if (!response.ok) throw new Error("Status update failed")
      
      // Refresh after delay to ensure consistency
      setTimeout(() => setRefreshTrigger(prev => prev + 1), 500)
    } catch (error) {
      console.error("Error updating task:", error)
      setTasks(originalTasks)
    }
  }

 

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold">
              {milestone?.name || "Loading milestone..."}
            </h2>
            <p className="text-muted-foreground">
              {milestone?.description || "Milestone description"}
            </p>
          </div>
        </div>
        {isOwner && (
    <Button onClick={() => setShowAddDialog(true)}>
      <Plus className="mr-2 h-4 w-4" />
      Add Task
    </Button>
  )}
      </div>

      {tasks.length === 0 ? (
        <div className="text-center text-muted-foreground py-8">
          🎯 Create your first task
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-6">
          <AnimatePresence>
           {columns.map(status => (
  <TaskColumn
    key={status}
    status={status}
    tasks={tasks.filter(t => t.status === status)}
    onDragEnd={handleDragEnd}
    onEdit={isOwner ? handleEditTask : undefined}
    onDelete={isOwner ? handleDeleteTask : undefined}
    onTaskClick={(task) => setTrackingTask(task)}
  />
))}
          </AnimatePresence>
        </div>
      )}

      // Add this dialog component near other dialogs in your JSX
<Dialog open={!!trackingTask} onOpenChange={(open) => !open && setTrackingTask(null)}>
  <DialogContent className="sm:max-w-[425px]">
    <DialogHeader>
      <DialogTitle>Track Task</DialogTitle>
    </DialogHeader>
    <div className="grid gap-4 py-4">
      <p className="text-sm text-muted-foreground">
        Start tracking time for "{trackingTask?.name}"?
      </p>
      <div className="flex justify-end gap-2 mt-4">
        <Button 
          variant="outline" 
          onClick={() => setTrackingTask(null)}
        >
          Cancel
        </Button>
        <Button
          onClick={() => {
            if (trackingTask) {
              startTimer(
                projectId,
                trackingTask.id,
                `Working on ${trackingTask.name}`
              )
              setTrackingTask(null)
              toast.success("Timer started!")
            }
          }}
        >
          <Play className="mr-2 h-4 w-4" />
          Start Tracking
        </Button>
      </div>
    </div>
  </DialogContent>
</Dialog>

<Dialog open={!!editingTask} onOpenChange={(open) => !open && setEditingTask(null)}>
  <DialogContent className="max-w-md">
    <DialogHeader>
      <DialogTitle>Edit Task</DialogTitle>
    </DialogHeader>
    <div className="space-y-4">
      <div className="space-y-2">
        <label>Title</label>
        <Input
          value={newTask.name}
          onChange={(e) => setNewTask({...newTask, name: e.target.value})}
          placeholder="Task title"
        />
      </div>
      
      <div className="space-y-2">
        <label>Description</label>
        <Textarea
          value={newTask.description}
          onChange={(e) => setNewTask({...newTask, description: e.target.value})}
          placeholder="Task description"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label>Status</label>
          <Select
            value={newTask.status}
            onValueChange={(value) => 
              setNewTask({...newTask, status: value as TaskStatus})
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todo">To Do</SelectItem>
              <SelectItem value="doing">In Progress</SelectItem>
              <SelectItem value="done">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <label>Priority</label>
          <Select
            value={newTask.priority}
            onValueChange={(value) => 
              setNewTask({...newTask, priority: value as any})
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
  <div className="space-y-2">
    <label>Start Date</label>
    <Input
      type="date"
      value={newTask.startDate || ""}
      onChange={(e) => setNewTask({...newTask, startDate: e.target.value})}
    />
  </div>
  <div className="space-y-2">
    <label>Due Date</label>
    <Input
      type="date"
      value={newTask.dueDate || ""}
      onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
    />
  </div>
</div>
       
      
      
      <AssignmentSection />

      <Button onClick={handleUpdateTask} className="w-full">
        Update Task
      </Button>
    </div>
  </DialogContent>
</Dialog>
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label>Title</label>
              <Input
                value={newTask.name}
                onChange={(e) => setNewTask({...newTask, name: e.target.value})}
                placeholder="Task title"
              />
            </div>
            
            <div className="space-y-2">
              <label>Description</label>
              <Textarea
                value={newTask.description}
                onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                placeholder="Task description"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label>Status</label>
                <Select
                  value={newTask.status}
                  onValueChange={(value) => 
                    setNewTask({...newTask, status: value as TaskStatus})
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todo">To Do</SelectItem>
                    <SelectItem value="doing">In Progress</SelectItem>
                    <SelectItem value="done">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label>Priority</label>
                <Select
                  value={newTask.priority}
                  onValueChange={(value) => 
                    setNewTask({...newTask, priority: value as any})
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
  <div className="space-y-2">
    <label>Start Date</label>
    <Input
      type="date"
      value={newTask.startDate || ""}
      onChange={(e) => setNewTask({...newTask, startDate: e.target.value})}
    />
  </div>
  <div className="space-y-2">
    <label>Due Date</label>
    <Input
      type="date"
      value={newTask.dueDate || ""}
      onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
    />
  </div>
</div>
            
            
            <AssignmentSection />

<Button onClick={handleAddTask} className="w-full">
  Create Task
</Button>
</div>
</DialogContent>
</Dialog>

{/* Add Team Member Dialog */}
<Dialog open={isAddingTeamMember} onOpenChange={setIsAddingTeamMember}>
<DialogContent>
<DialogHeader>
<DialogTitle>Add Team Member</DialogTitle>
</DialogHeader>
<div className="space-y-4">
<div className="flex gap-2">
  <Input
    placeholder="Search by full name"
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
  />
  <Button onClick={handleSearch}>Search</Button>
</div>
{errorMessage && (
  <div className="text-red-500 text-sm">{errorMessage}</div>
)}
{searchedUser && (
  <div className="p-2 border rounded-lg">
    <div className="flex items-center justify-between">
      <div>
        <p className="font-medium">{searchedUser.fullname}</p>
        <p className="text-sm text-gray-500">{searchedUser.email}</p>
      </div>
      <Button size="sm" onClick={handleAddTeamMember}>
        Add
      </Button>
    </div>
  </div>
)}
</div>
</DialogContent>
</Dialog>
</div>
)
}