"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
  CalendarIcon, 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  ChevronDown,
  ChevronRight,
  ArrowUp,
  ArrowRight,
  ArrowDown,
  ListChecks
} from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Milestone, Task, TaskPriority, TaskStatus } from "@/lib/types/project-planner"
import { mockTeamMembers } from "@/lib/mock-data/project-planner"
import Cookies from "js-cookie"
import { PencilLine, MessageSquare } from "lucide-react" // Add new icons

interface TaskBreakdownProps {
  teamType: "team" | "solo"; // Add teamType prop

  milestones: Milestone[]
  onUpdate: (milestones: Milestone[]) => void
}

export function TaskBreakdown({ milestones, onUpdate,teamType }: TaskBreakdownProps) {
  const [expandedMilestone, setExpandedMilestone] = useState<string | null>(null)
  const [showAddTaskDialog, setShowAddTaskDialog] = useState(false)
  const [selectedMilestone, setSelectedMilestone] = useState<string | null>(null)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [user, setUser] = useState<any>(null)
    const [currentUser, setCurrentUser] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState("")
  const [newTask, setNewTask] = useState<Partial<Task>>({
    title: "",
    description: "",
    status: "not_started",
    priority: "medium",
    type: "feature",
    comments: []
  });
  const handleTypeChange = (value: string) => {
    setShowCustomType(value === "other");
    setNewTask({
      ...newTask,
      type: value as TaskType,
      customType: value === "other" ? "" : undefined
    });
  };
  const handleAddComment = () => {
    if (newComment.trim()) {
      setNewTask(prev => ({
        ...prev,
        comments: [...(prev.comments || []), newComment.trim()]
      }));
      setNewComment("");
    }
  };
  type TaskType = "feature" | "bug" | "research" | "documentation" | "other"
  const [activeTab, setActiveTab] = useState<"basic" | "advanced">("basic");
  const [newComment, setNewComment] = useState("");
  const [showCustomType, setShowCustomType] = useState(false);
  useEffect(() => {
      const fetchCurrentUser = async () => {
        const token = Cookies.get("token");
        if (!token) return;
        
        try {
          const response = await fetch("http://localhost:3000/auth/me", {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await response.json();
          setCurrentUser(data);
        } catch (error) {
          console.error("Error fetching current user:", error);
        }
      };
      fetchCurrentUser();
    }, []);
  
  const handleSearch = async () => {
      if (!searchQuery.trim()) return;
      try {
        const token = Cookies.get("token");
        if (!token) throw new Error("No authentication token found");
  
        const response = await fetch(`http://localhost:3000/auth/${searchQuery}`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });
  
        if (!response.ok) {
          setUser(null);
          setErrorMessage("No user found with this ID.");
          return;
        }
  
        const data = await response.json();
        setUser(data);
        setErrorMessage("");
      } catch (error) {
        console.error("Error fetching user:", error);
        setErrorMessage("An error occurred. Please try again.");
      }
    };
  

  const handleAddTask = async () => {
    if (!newTask.title || !selectedMilestone) return
    
    const token = Cookies.get("token")
    if (!token) {
      console.error("Authentication token not found")
      return
    }

    try {
      const response = await fetch('http://localhost:3000/tasks/create', {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          milestoneId: selectedMilestone,
          name: newTask.title,
          description: newTask.description,
          status: newTask.status,
          priority: newTask.priority,
          assignedToId: newTask.assignedToId,
          estimatedTime: newTask.estimatedTime, // Add this line
          type:newTask.type,

          assignedBy: currentUser.id,
          startDate: newTask.startDate,
          dueDate: newTask.dueDate
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to create task')
      }

      const createdTask = await response.json()

      const updatedMilestones = milestones.map(milestone => {
        if (milestone.id === selectedMilestone) {
          return {
            ...milestone,
            tasks: [...milestone.tasks, createdTask],
            updatedAt: new Date().toISOString()
          }
        }
        return milestone
      })

      onUpdate(updatedMilestones)
      setNewTask({
        title: "",
        description: "",
        status: "not_started",
        priority: "medium",
      })
      setShowAddTaskDialog(false)
    } catch (error) {
      console.error('Error adding task:', error)
    }
  }

  const handleUpdateTask = async () => {
    if (!editingTask || !selectedMilestone) return
    
    const token = Cookies.get("token")
    if (!token) {
      console.error("Authentication token not found")
      return
    }

    try {
      const response = await fetch(`http://localhost:3000/tasks/${editingTask.id}`, {
        method: 'PATCH',
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editingTask.title,
          description: editingTask.description,
          status: editingTask.status,
          priority: editingTask.priority,
          estimatedTime: newTask.estimatedTime, // Add this line
          assignedTo: editingTask.assignedTo,
          assignedBy: currentUser.id,
          startDate: editingTask.startDate,
          dueDate: editingTask.dueDate
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to update task')
      }

      const updatedTask = await response.json()

      const updatedMilestones = milestones.map(milestone => {
        if (milestone.id === selectedMilestone) {
          return {
            ...milestone,
            tasks: milestone.tasks.map(task => 
              task.id === updatedTask.id 
                ? { ...updatedTask, updatedAt: new Date().toISOString() } 
                : task
            ),
            updatedAt: new Date().toISOString()
          }
        }
        return milestone
      })

      onUpdate(updatedMilestones)
      setEditingTask(null)
    } catch (error) {
      console.error('Error updating task:', error)
    }
  }

  const handleDeleteTask = async (milestoneId: string, taskId: string) => {
    const token = Cookies.get("token")
    if (!token) {
      console.error("Authentication token not found")
      return
    }

    try {
      const response = await fetch(`http://localhost:3000/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to delete task')
      }

      const updatedMilestones = milestones.map(milestone => {
        if (milestone.id === milestoneId) {
          return {
            ...milestone,
            tasks: milestone.tasks.filter(task => task.id !== taskId),
            updatedAt: new Date().toISOString()
          }
        }
        return milestone
      })

      onUpdate(updatedMilestones)
    } catch (error) {
      console.error('Error deleting task:', error)
    }
  }
  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-emerald-500" />
      case "in_progress":
        return <Clock className="h-4 w-4 text-blue-500" />
      case "not_started":
        return <AlertCircle className="h-4 w-4 text-slate-400" />
    }
  }

  const getPriorityIcon = (priority: TaskPriority) => {
    switch (priority) {
      case "high":
        return <ArrowUp className="h-4 w-4 text-red-500" />
      case "medium":
        return <ArrowRight className="h-4 w-4 text-amber-500" />
      case "low":
        return <ArrowDown className="h-4 w-4 text-emerald-500" />
    }
  }

  const getPriorityBadge = (priority: TaskPriority) => {
    switch (priority) {
      case "high":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-300 dark:border-red-900/30">
            <ArrowUp className="mr-1 h-3 w-3" />
            High
          </Badge>
        )
      case "medium":
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-900/30">
            <ArrowRight className="mr-1 h-3 w-3" />
            Medium
          </Badge>
        )
      case "low":
        return (
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-900/30">
            <ArrowDown className="mr-1 h-3 w-3" />
            Low
          </Badge>
        )
    }
  }

  const getStatusBadge = (status: TaskStatus) => {
    switch (status) {
      case "completed":
        return (
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-900/30">
            <CheckCircle className="mr-1 h-3 w-3" />
            Completed
          </Badge>
        )
      case "in_progress":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-900/30">
            <Clock className="mr-1 h-3 w-3" />
            In Progress
          </Badge>
        )
      case "not_started":
        return (
          <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800">
            <AlertCircle className="mr-1 h-3 w-3" />
            Not Started
          </Badge>
        )
    }
  }

  const getTeamMemberName = (id?: string) => {
    if (!id) return "Unassigned"
    const member = mockTeamMembers.find(m => m.id === id)
    return member ? member.name : "Unknown"
  }

  const getTaskDependencies = (task: Task, milestoneId: string) => {
    if (!task.dependsOn || task.dependsOn.length === 0) return null
    
    const milestone = milestones.find(m => m.id === milestoneId)
    if (!milestone) return null
    
    const dependencies = task.dependsOn.map(depId => {
      const depTask = milestone.tasks.find(t => t.id === depId)
      return depTask ? depTask.title : "Unknown Task"
    })
    
    return dependencies.join(", ")
  }

  return (
    <div className="space-y-6">
      {milestones.map(milestone => (
        <Card key={milestone.id} className="border-none shadow-lg overflow-hidden">
          <CardHeader className="py-4 px-6 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border-b border-indigo-100 dark:border-indigo-900/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 rounded-full bg-white dark:bg-slate-800 shadow-sm hover:shadow"
                  onClick={() => setExpandedMilestone(
                    expandedMilestone === milestone.id ? null : milestone.id
                  )}
                >
                  {expandedMilestone === milestone.id ? (
                    <ChevronDown className="h-4 w-4 text-indigo-500" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-indigo-500" />
                  )}
                </Button>
                <CardTitle className="text-lg flex items-center gap-2">
                  {milestone.name}
                  {getStatusBadge(milestone.status)}
                </CardTitle>
              </div>
              
              <Button
                size="sm"
                className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
                onClick={() => {
                  setSelectedMilestone(milestone.id)
                  setShowAddTaskDialog(true)
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Task
              </Button>
            </div>
          </CardHeader>
          
          {expandedMilestone === milestone.id && (
            <CardContent className="p-0">
              {milestone.tasks.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 dark:bg-slate-900/50 text-muted-foreground">
                  <ListChecks className="h-12 w-12 mx-auto mb-3 text-slate-300 dark:text-slate-700" />
                  <p>No tasks added to this milestone yet</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-4 border-indigo-200 hover:border-indigo-300 text-indigo-600 hover:text-indigo-700 dark:border-indigo-800 dark:hover:border-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                    onClick={() => {
                      setSelectedMilestone(milestone.id)
                      setShowAddTaskDialog(true)
                    }}
                  >
                    <Plus className="mr-1 h-4 w-4" />
                    Add First Task
                  </Button>
                </div>
              ) : (
                <div className="rounded-b-lg overflow-hidden">
                  <Table>
                    <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
                      <TableRow>
                        <TableHead>Task</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Assigned To</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Est. Hours</TableHead>
                        <TableHead className="w-[100px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {milestone.tasks.map(task => (
                        <TableRow key={task.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                          <TableCell>
                            <div>
                              <div className="font-medium">{task.title}</div>
                              {task.description && (
                                <div className="text-sm text-muted-foreground mt-1">
                                  {task.description}
                                </div>
                              )}
                              {task.dependsOn && task.dependsOn.length > 0 && (
                                <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                  <span className="font-medium">Depends on:</span> {getTaskDependencies(task, milestone.id)}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(task.status)}</TableCell>
                          <TableCell>{getPriorityBadge(task.priority)}</TableCell>
                         
                          <TableCell>
                            {task.assignedTo ? (
                              <div className="flex items-center gap-1 text-sm">
                                <CalendarIcon className="h-3 w-3 text-amber-500" />
                                {format(new Date(task.assignedTo), "MMM d, yyyy")}
                              </div>
                            ) : "-"}
                          </TableCell>
                          <TableCell>
                          {task.dueDate ? (
                              <div className="flex items-center gap-1 text-sm">
                                <CalendarIcon className="h-3 w-3 text-amber-500" />
                                {format(new Date(task.dueDate), "MMM d, yyyy")}
                              </div>
                            ) : "-"}
                            
                          </TableCell>
                          <TableCell>
                          {task.estimatedTime ? (
                              <div className="flex items-center gap-1 text-sm">
                                <Clock className="h-3 w-3 text-blue-500" />
                                {task.estimatedTime}h
                              </div>
                            ) : "-"}
                             </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                variant="ghost"
                                className="h-8 w-8 p-0 rounded-full text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:text-indigo-300 dark:hover:bg-indigo-950"
                                onClick={() => {
                                  setSelectedMilestone(milestone.id)
                                  setEditingTask(task)
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost"
                                className="h-8 w-8 p-0 rounded-full text-red-500 hover:text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950"
                                onClick={() => handleDeleteTask(milestone.id, task.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          )}
        </Card>
      ))}
      
      <Dialog open={showAddTaskDialog} onOpenChange={setShowAddTaskDialog}>
      <DialogContent className="max-w-2xl">
    <DialogHeader>
      <DialogTitle>{editingTask ? "Edit Task" : "Add New Task"}</DialogTitle>
    </DialogHeader>
    <div className="flex gap-4 mb-6">
      <Button
        variant={activeTab === "basic" ? "secondary" : "ghost"}
        onClick={() => setActiveTab("basic")}
        className={cn("w-1/2", activeTab === "basic" && "border-2 border-indigo-500")}
      >
        Basic Info
      </Button>
      <Button
        variant={activeTab === "advanced" ? "secondary" : "ghost"}
        onClick={() => setActiveTab("advanced")}
        className={cn("w-1/2", activeTab === "advanced" && "border-2 border-indigo-500")}
      >
        Additional Settings
      </Button>
    </div>

    <div className="space-y-4 py-4">
      {activeTab === "basic" ? (
        <>
          <div className="space-y-2">
            <label className="text-sm font-medium">Title</label>
            <Input
              value={newTask.title || ""}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              placeholder="Task title"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              value={newTask.description || ""}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              placeholder="Describe this task"
            />
          </div><div className="space-y-2">
                            <label className="text-sm font-medium">Estimated Time (hours)</label>
                            <Input
                              type="number"
                              value={newTask.estimatedTime}
                              onChange={e => setNewTask({
                                ...newTask,
                                estimatedTime: Number(e.target.value)
                              })}
                            />
                          
                        </div>
          

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select
                value={newTask.status || "not_started"}
                onValueChange={value => setNewTask({...newTask, status: value as TaskStatus})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not_started">Not Started</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Priority</label>
              <Select
                value={newTask.priority || "medium"}
                onValueChange={value => setNewTask({...newTask, priority: value as TaskPriority})}
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
        </>
      ) : (
        <>
          <div className="space-y-2">
            <label className="text-sm font-medium">Task Type</label>
            <Select 
              value={newTask.type || "feature"} 
              onValueChange={handleTypeChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select task type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="feature">Feature</SelectItem>
                <SelectItem value="bug">Bug Fix</SelectItem>
                <SelectItem value="research">Research</SelectItem>
                <SelectItem value="documentation">Documentation</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            {showCustomType && (
              <Input
                placeholder="Enter custom task type"
                value={newTask.customType || ""}
                onChange={(e) => setNewTask({...newTask, customType: e.target.value})}
                className="mt-2"
              />
            )}
          </div>

          {teamType === "team" && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Assign To</label>
              <div className="flex gap-2">
                <Input
                  placeholder="Search user by ID"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button onClick={handleSearch}>Search</Button>
              </div>
              {/* ... keep existing assign to UI */}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">Comments</label>
            <div className="flex gap-2">
              <Input
                placeholder="Add a comment"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <Button onClick={handleAddComment}>Add</Button>
            </div>
            <div className="space-y-2 mt-2">
              {newTask.comments?.map((comment, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-slate-50 rounded">
                  <MessageSquare className="h-4 w-4 text-slate-400" />
                  <span className="text-sm">{comment}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
  <div className="space-y-2">
    <label className="text-sm font-medium">Start Date (Optional)</label>
    <input
      type="date"
      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      value={newTask.startDate ? new Date(newTask.startDate).toISOString().split('T')[0] : ''}
      onChange={(e) => setNewTask({
        ...newTask,
        startDate: e.target.value ? new Date(e.target.value).toISOString() : undefined
      })}
    />
  </div>
  
  <div className="space-y-2">
    <label className="text-sm font-medium">Due Date (Optional)</label>
    <input
      type="date"
      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      value={newTask.dueDate ? new Date(newTask.dueDate).toISOString().split('T')[0] : ''}
      onChange={(e) => setNewTask({
        ...newTask,
        dueDate: e.target.value ? new Date(e.target.value).toISOString() : undefined
      })}
    />
  </div>
</div>
        </>
      )}

      <Button 
        onClick={editingTask ? handleUpdateTask : handleAddTask}
        className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
      >
        {editingTask ? "Update Task" : "Add Task"}
      </Button>
    </div>
  </DialogContent>
      </Dialog>
      
      <Dialog open={!!editingTask} onOpenChange={(open) => !open && setEditingTask(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          {editingTask && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={editingTask.title}
                  onChange={(e) => setEditingTask({ 
                    ...editingTask, 
                    title: e.target.value 
                  })}
                  className="border-indigo-200 focus:border-indigo-500 focus:ring-indigo-500 dark:border-indigo-800 dark:focus:border-indigo-700"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={editingTask.description || ""}
                  onChange={(e) => setEditingTask({ 
                    ...editingTask, 
                    description: e.target.value 
                  })}
                  className="border-indigo-200 focus:border-indigo-500 focus:ring-indigo-500 dark:border-indigo-800 dark:focus:border-indigo-700"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <Select 
                    value={editingTask.status} 
                    onValueChange={(value) => 
                      setEditingTask({ 
                        ...editingTask, 
                        status: value as TaskStatus,
                        completedDate: value === "completed" ? new Date().toISOString() : editingTask.completedDate
                      })
                    }
                  >
                    <SelectTrigger className="border-indigo-200 focus:border-indigo-500 focus:ring-indigo-500 dark:border-indigo-800 dark:focus:border-indigo-700">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="not_started" className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-slate-400" />
                        <span>Not Started</span>
                      </SelectItem>
                      <SelectItem value="in_progress" className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-blue-500" />
                        <span>In Progress</span>
                      </SelectItem>
                      <SelectItem value="completed" className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                        <span>Completed</span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Priority</label>
                  <Select 
                    value={editingTask.priority} 
                    onValueChange={(value) => 
                      setEditingTask({ 
                        ...editingTask, 
                        priority: value as TaskPriority 
                      })
                    }
                  >
                    <SelectTrigger className="border-indigo-200 focus:border-indigo-500 focus:ring-indigo-500 dark:border-indigo-800 dark:focus:border-indigo-700">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low" className="flex items-center gap-2">
                        <ArrowDown className="h-4 w-4 text-emerald-500" />
                        <span>Low</span>
                      </SelectItem>
                      <SelectItem value="medium" className="flex items-center gap-2">
                        <ArrowRight className="h-4 w-4 text-amber-500" />
                        <span>Medium</span>
                      </SelectItem>
                      <SelectItem value="high" className="flex items-center gap-2">
                        <ArrowUp className="h-4 w-4 text-red-500" />
                        <span>High</span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Start Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal border-indigo-200 hover:border-indigo-300 dark:border-indigo-800 dark:hover:border-indigo-700",
                          !editingTask.startDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4 text-indigo-500" />
                        {editingTask.startDate ? (
                          format(new Date(editingTask.startDate), "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={editingTask.startDate ? new Date(editingTask.startDate) : undefined}
                        onSelect={(date) => 
                          setEditingTask({ 
                            ...editingTask, 
                            startDate: date ? date.toISOString() : undefined 
                          })
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Due Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal border-indigo-200 hover:border-indigo-300 dark:border-indigo-800 dark:hover:border-indigo-700",
                          !editingTask.dueDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4 text-amber-500" />
                        {editingTask.dueDate ? (
                          format(new Date(editingTask.dueDate), "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={editingTask.dueDate ? new Date(editingTask.dueDate) : undefined}
                        onSelect={(date) => 
                          setEditingTask({ 
                            ...editingTask, 
                            dueDate: date ? date.toISOString() : undefined 
                          })
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Estimated Hours</label>
                  <Input
                    type="number"
                    min="0"
                    step="0.5"
                    value={editingTask.estimatedTime?.toString() || ""}
                    onChange={(e) => setEditingTask({ 
                      ...editingTask, 
                      estimatedTime: e.target.value ? parseFloat(e.target.value) : undefined 
                    })}
                    className="border-indigo-200 focus:border-indigo-500 focus:ring-indigo-500 dark:border-indigo-800 dark:focus:border-indigo-700"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Actual Hours</label>
                  <Input
                    type="number"
                    min="0"
                    step="0.5"
                    value={editingTask.actualHours?.toString() || ""}
                    onChange={(e) => setEditingTask({ 
                      ...editingTask, 
                      actualHours: e.target.value ? parseFloat(e.target.value) : undefined 
                    })}
                    className="border-indigo-200 focus:border-indigo-500 focus:ring-indigo-500 dark:border-indigo-800 dark:focus:border-indigo-700"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Assigned To</label>
                <Select 
                  value={editingTask.assignedTo || ""} 
                  onValueChange={(value) => 
                    setEditingTask({ 
                      ...editingTask, 
                      assignedTo: value || undefined 
                    })
                  }
                >
                  <SelectTrigger className="border-indigo-200 focus:border-indigo-500 focus:ring-indigo-500 dark:border-indigo-800 dark:focus:border-indigo-700">
                    <SelectValue placeholder="Select team member" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Unassigned">Unassigned</SelectItem>
                    {mockTeamMembers.map(member => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Dependencies</label>
                <Select 
                  value={editingTask.dependsOn?.[0] || ""} 
                  onValueChange={(value) => 
                    setEditingTask({ 
                      ...editingTask, 
                      dependsOn: value ? [value] : undefined 
                    })
                  }
                >
                  <SelectTrigger className="border-indigo-200 focus:border-indigo-500 focus:ring-indigo-500 dark:border-indigo-800 dark:focus:border-indigo-700">
                    <SelectValue placeholder="Select dependency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {selectedMilestone && milestones
                      .find(m => m.id === selectedMilestone)?.tasks
                      .filter(task => task.id !== editingTask.id)
                      .map(task => (
                        <SelectItem key={task.id} value={task.id}>
                          {task.title}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex justify-end gap-2 mt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setEditingTask(null)}
                  className="border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleUpdateTask}
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
                >
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}