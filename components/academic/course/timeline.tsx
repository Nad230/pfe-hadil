"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ChevronRight, CheckCircle, Clock, Lock, Plus, Edit, X, Upload } from "lucide-react"
import { useState, useEffect } from "react"
import { CreateTaskDialog } from "../create-task-dialog"
import { useParams, useRouter } from "next/navigation"
import Cookies from "js-cookie"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { Label } from "@/components/ui/label"
import { useMascotStore } from "@/lib/stores/mascot-store"
interface Task {
  id: string
  title: string
  description: string
  deadline: string
  createdAt: string
  isClosed: boolean
  tags: string[]
  maxPoints: number | null
  courseId: string
  submissions: any[]
}

export function CourseTimeline({ setActiveTab }: { setActiveTab: (tab: string) => void }) {
  const [expandedTask, setExpandedTask] = useState<string | null>(null)
  const [showDialog, setShowDialog] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const params = useParams()
  const router = useRouter()
  const courseId = Array.isArray(params.id) ? params.id[0] : params.id
  const [submissionCounts, setSubmissionCounts] = useState<{ [key: string]: number }>({});
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [selectedUploadTask, setSelectedUploadTask] = useState<string | null>(null)
  const [fileToUpload, setFileToUpload] = useState<File | null>(null)
  const [uploadFileName, setUploadFileName] = useState("")
  useEffect(() => {
    const fetchSubmissionCounts = async () => {
      try {
        const token = Cookies.get("token");
        const counts: { [key: string]: number } = {};
        
        await Promise.all(tasks.map(async (task) => {
          const response = await fetch(
            `http://localhost:3000/files/count/${task.id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (response.ok) {
            const data = await response.json();
            counts[task.id] = data.count;
          }
        }));
        
        setSubmissionCounts(counts);
      } catch (error) {
        console.error("Error fetching submission counts:", error);
      }
    };
  
    if (tasks.length > 0) {
      fetchSubmissionCounts();
    }
  }, [tasks]);
  
  useEffect(() => {
    const fetchUserAndTasks = async () => {
      try {
        const token = Cookies.get("token")
        
        // Fetch current user
        const userResponse = await fetch('http://localhost:3000/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (!userResponse.ok) throw new Error('Failed to fetch user')
        const userData = await userResponse.json()
        setCurrentUserId(userData.sub)

        // Fetch tasks
        const tasksResponse = await fetch(
          `http://localhost:3000/academic/acadTask/${courseId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        if (!tasksResponse.ok) throw new Error('Failed to fetch tasks')
        const tasksData = await tasksResponse.json()
        setTasks(tasksData)
        console.log('userid',userData.sub,'createdby',tasksData)
      } catch (error) {
        console.error("Error:", error)
      } finally {
        setLoading(false)
      }
    }

    if (courseId) fetchUserAndTasks()
  }, [courseId])

  const getTaskStatus = (task: Task) => {
    if (task.isClosed) return 'closed'
    const now = new Date()
    const deadline = new Date(task.deadline)
    const createdAt = new Date(task.createdAt)
    const timeElapsed = now.getTime() - createdAt.getTime()
    const totalTime = deadline.getTime() - createdAt.getTime()
    
    if (now > deadline) return 'overdue'
    if (timeElapsed > totalTime / 2) return 'halfway'
    return 'new'
  }


  const handleUpdateTask = async (updatedData: { deadline: Date; isClosed: boolean }) => {
    if (!selectedTask) return

    try {
      const token = Cookies.get("token")
      const response = await fetch(
        `http://localhost:3000/academic/updateTask/${selectedTask.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            deadline: updatedData.deadline.toISOString(),
            isClosed: updatedData.isClosed
          })
        }
      )

      if (!response.ok) throw new Error('Failed to update task')

      setTasks(prev => prev.map(task =>
        task.id === selectedTask.id ? {
          ...task,
          deadline: updatedData.deadline.toISOString(),
          isClosed: updatedData.isClosed
        } : task
      ))

      setEditDialogOpen(false)
    } catch (error) {
      console.error('Error updating task:', error)
    }
  }

  const calculateProgress = (task: Task) => {
    const now = new Date()
    const deadline = new Date(task.deadline)
    const createdAt = new Date(task.createdAt)
    const totalTime = deadline.getTime() - createdAt.getTime()
    const timeElapsed = now.getTime() - createdAt.getTime()
    
    if (now > deadline) return 100
    return Math.min(100, (timeElapsed / totalTime) * 100)
  }

  const getStatusIcon = (task: Task) => {
    const status = getTaskStatus(task)
    switch (status) {
      case 'closed':
        return <Lock className="h-6 w-6 text-red-500" />
      case 'halfway':
      case 'overdue':
        return <Clock className="h-6 w-6 text-amber-500" />
      case 'new':
      default:
        return <CheckCircle className="h-6 w-6 text-green-500" />
    }
  }

  if (loading) return <div className="text-center p-8">Loading tasks...</div>


  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Task Management</h2>
          <p className="text-muted-foreground">Track and manage course tasks</p>
        </div>
        <Button onClick={() => setShowDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create New Task
        </Button>
        <CreateTaskDialog 
          open={showDialog}
          onOpenChange={setShowDialog}
        />
      </div>
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
  <DialogContent className="sm:max-w-[600px]">
    {selectedTask && (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center">
            <X className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Update Task</h2>
            <p className="text-muted-foreground">Modify task details</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Deadline</Label>
            <DatePicker
              selected={new Date(selectedTask.deadline)}
              onChange={(date) => setSelectedTask(prev => ({
                ...prev!,
                deadline: date?.toISOString() || prev!.deadline
              }))}
              showTimeSelect
              dateFormat="Pp"
              className="w-full p-2 border rounded-md"
            />
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <ToggleGroup
              type="single"
              value={selectedTask.isClosed ? "closed" : "open"}
              onValueChange={(value) => setSelectedTask(prev => ({
                ...prev!,
                isClosed: value === "closed"
              }))}
              className="grid grid-cols-2 gap-4"
            >
              <ToggleGroupItem value="open" className="h-24 flex-col gap-2">
                <CheckCircle className="h-6 w-6 text-green-500" />
                <span>Open</span>
              </ToggleGroupItem>
              <ToggleGroupItem value="closed" className="h-24 flex-col gap-2">
                <X className="h-6 w-6 text-red-500" />
                <span>Closed</span>
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          <Button 
            onClick={() => handleUpdateTask({
              deadline: new Date(selectedTask.deadline),
              isClosed: selectedTask.isClosed
            })}
            className="w-full"
          >
            Save Changes
          </Button>
        </div>
      </div>
    )}
  </DialogContent>
</Dialog>
      

      {tasks.map((task, index) => {
        const progress = calculateProgress(task)
        const status = getTaskStatus(task)
        const deadlineDate = new Date(task.deadline)
        const timeLeft = deadlineDate.getTime() - Date.now()
        const isCreator = currentUserId === task.createdById

        

        return (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={`
              overflow-hidden transition-all duration-300
              ${status === 'closed' ? "opacity-75 bg-muted/50" : ""}
              ${expandedTask === task.id ? "ring-2 ring-primary" : ""}
            `}>
              <div className="p-6">
                <div 
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => setExpandedTask(expandedTask === task.id ? null : task.id)}
                >
                  <div className="flex items-center gap-4">
  {getStatusIcon(task)}
  <div className="flex-1">
    <div className="flex items-center gap-2">
      <h3 className="text-lg font-semibold">{task.title}</h3>
      {isCreator && (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedTask(task);
            setEditDialogOpen(true);
          }}
        >
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </Button>
      )}
    </div>
    <p className="text-sm text-muted-foreground">{task.description}</p>
    <div className="flex gap-2 mt-1">
      {task.tags.map(tag => (
        <Badge key={tag} variant="outline">{tag}</Badge>
      ))}
    </div>
  </div>
</div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        Due: {deadlineDate.toLocaleDateString()}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {status === 'closed' ? 'Closed' : 
                         timeLeft > 0 ? `${Math.ceil(timeLeft / (1000 * 60 * 60 * 24))}d left` : 'Overdue'}
                      </div>
                    </div>
                    <ChevronRight className={`h-5 w-5 transition-transform ${expandedTask === task.id ? "rotate-90" : ""}`} />
                  </div>
                </div>

                <div className="mt-4">
                  <Progress value={progress} className="h-2" />
                </div>

                {expandedTask === task.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    transition={{ duration: 0.3 }}
                    className="mt-6 space-y-4"
                  >
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="space-y-1">
                        <div className="text-muted-foreground">Created At</div>
                        <div>{new Date(task.createdAt).toLocaleString()}</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-muted-foreground">Max Points</div>
                        <div>{task.maxPoints || 'N/A'}</div>

                        {isCreator && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="ml-auto"
                              onClick={() => console.log('Edit task', task.id)}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Task
                            </Button>
                          )}
                      </div>
                      <div className="space-y-1">
                        <div className="text-muted-foreground">Submissions</div>
                        <div>{submissionCounts[task.id] || 0}</div>
                        </div>
                      <div className="space-y-1">
          <div className="text-muted-foreground">Status</div>
          <div className="flex items-center gap-40">
            <Badge variant={status === 'closed' ? 'destructive' : 'default'}>
              {status.toUpperCase()}
            </Badge>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => router.push("/time-tracker")}
            >
              <Clock className="mr-2 h-4 w-4" />
              Track Time
            </Button>
            <Button 
      variant="outline" 
      size="sm"
      onClick={() => setActiveTab("resources")}
    >
  <Upload className="mr-2 h-4 w-4" />
  Sent your Work
    </Button>
          </div>
        </div>
      </div>
                    
                  

                    {task.submissions.length > 0 && (
                      <div className="pt-4 border-t">
                        <h4 className="font-medium mb-4">Submissions</h4>
                        {task.submissions.map(submission => (
                          <div key={submission.id} className="p-4 border rounded-lg mb-2">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-medium">{submission.studentName}</div>
                                <div className="text-sm text-muted-foreground">
                                  Submitted: {new Date(submission.submittedAt).toLocaleString()}
                                </div>
                              </div>
                              <Badge variant="outline">
                                {submission.initialPoints} points
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
              
            </Card>
          </motion.div>
        )
      })}
    </div>
  )
}