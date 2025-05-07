"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Play, Pause, StopCircle, Clock, Calendar, Target, Brain, Plus, Flag } from "lucide-react"
import Cookies from "js-cookie"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { formatDuration, formatTime } from "@/lib/utils/time"
import { AnimatePresence, motion } from "framer-motion"
import TimerToast from "@/components/time-tracker/TimerToast"
import { useTimerStore } from "../../lib/stores/useTimerStore"
import { useTimerControls } from "@/hooks/useTimerControls"
interface Project {
  id: string
  name: string
  color: string
}

interface Milestone {
  id: string
  name: string
  status: string
  projectId: string
  tasks?: Task[]
}

interface Task {
  id: string
  name: string
  milestoneId?: string
  projectId: string
}
interface TimeEntry {
  id: string;
  projectId: string;
  taskId: string;
  description: string;
  startTime: string;
  endTime: string | null;
  totalTime: number | null;
  project: {
    id: string;
    name: string;
  };
  task: {
    id: string;
    title: string;
  };
}

export default function TimeTracker() {
  const [isRunning, setIsRunning] = useState(false)
  const [duration, setDuration] = useState(0)
  const [selectedProject, setSelectedProject] = useState("")
  const [selectedMilestone, setSelectedMilestone] = useState("")
  const [selectedTask, setSelectedTask] = useState("")
  const [description, setDescription] = useState("")
  const [taskSearch, setTaskSearch] = useState("")
  const [open, setOpen] = useState(false)
  const [timeEntryId, setTimeEntryId] = useState<string | null>(null)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [projects, setProjects] = useState<Project[]>([])
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([])
const [loadingTimeEntries, setLoadingTimeEntries] = useState(true)
const { startTimer, stopTimer } = useTimerControls()
// Add this effect to fetch time entries
useEffect(() => {
  const fetchTimeEntries = async () => {
    try {
      const response = await fetch("http://localhost:3000/time-entry", {
        headers: { Authorization: `Bearer ${Cookies.get("token")}` }
      })
      const data = await response.json()
      setTimeEntries(data)
    } catch (error) {
      console.error("Error fetching time entries:", error)
    } finally {
      setLoadingTimeEntries(false)
    }
  }
  
  fetchTimeEntries()
}, [timeEntryId]) // Refresh when timeEntryId changes

// Add these formatting functions
const formatTime = (isoString: string | null) => {
  if (!isoString) return "Ongoing"
  const date = new Date(isoString)
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

const formatTotalTime = (totalTime: number | null) => {
  if (totalTime === null || totalTime < 0) return "N/A"
  if (totalTime < 60) return `${totalTime} min`
  const hours = Math.floor(totalTime / 60)
  const minutes = totalTime % 60
  return minutes === 0 ? `${hours} hr` : `${hours} hr ${minutes} min`
}


  // Fetch projects
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch("http://localhost:3000/projects", {
          headers: { Authorization: `Bearer ${Cookies.get("token")}` }
        })
        const data = await response.json()
        setProjects(data)
      } catch (error) {
        console.error("Error fetching projects:", error)
      }
    }
    fetchProjects()
  }, [])

  // Fetch milestones when project selected
  useEffect(() => {
    const fetchMilestones = async () => {
      if (!selectedProject) return
      try {
        const response = await fetch(`http://localhost:3000/milestones/project/${selectedProject}`, {
          headers: { Authorization: `Bearer ${Cookies.get("token")}` }
        })
        const data = await response.json()
        setMilestones(data)
      } catch (error) {
        console.error("Error fetching milestones:", error)
      }
    }
    fetchMilestones()
  }, [selectedProject])

  // Fetch tasks when milestone selected
  useEffect(() => {
    if (!selectedMilestone) return
    const milestone = milestones.find(m => m.id === selectedMilestone)
    setTasks(milestone?.tasks || [])
  }, [selectedMilestone, milestones])

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isRunning) {
      interval = setInterval(() => setDuration(prev => prev + 1), 1000)
    }
    return () => clearInterval(interval)
  }, [isRunning])

  // Current time updater
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  const handleStart = async () => {
    if (!selectedProject || !selectedTask) return
    
    try {
      const response = await fetch("http://localhost:3000/time-entry/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("token")}`
        },
        body: JSON.stringify({
          projectId: selectedProject,
          taskId: selectedTask,
          description: description.trim() || "No description"
        })
      })
      const data = await response.json()
      setTimeEntryId(data.id)
      setIsRunning(true)
      startTimer()

    } catch (error) {
      console.error("Error starting timer:", error)
    }
  }

  const handleStop = async () => {
    if (!timeEntryId) return
    
    try {
      await fetch(`http://localhost:3000/time-entry/${timeEntryId}/stop`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${Cookies.get("token")}` }
      })
      setIsRunning(false)
      setDuration(0)
      setTimeEntryId(null)
      stopTimer()

    } catch (error) {
      console.error("Error stopping timer:", error)
    }
  }

  const getMilestoneStatus = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'in_progress': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <>
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4h 23m</div>
            <Progress value={54} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23h 45m</div>
            <Progress value={59} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Focus Score</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85%</div>
            <Progress value={85} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Billable Hours</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">92%</div>
            <Progress value={92} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger>
                <SelectValue placeholder="Select Project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map(project => (
                  <SelectItem key={project.id} value={project.id}>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full" style={{ backgroundColor: project.color }} />
                      {project.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select 
              value={selectedMilestone} 
              onValueChange={setSelectedMilestone}
              disabled={!selectedProject}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Milestone" />
              </SelectTrigger>
              <SelectContent>
                {milestones.map(milestone => (
                  <SelectItem key={milestone.id} value={milestone.id}>
                    <div className="flex items-center gap-2">
                      <Flag className="h-4 w-4" />
                      {milestone.name}
                      <span className={cn("ml-auto px-2 py-1 rounded text-xs", getMilestoneStatus(milestone.status))}>
                        {milestone.status.replace('_', ' ')}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start">
                {tasks.find(t => t.id === selectedTask)?.name || "Select Task"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0">
              <Command>
                <CommandInput 
                  placeholder="Search tasks..." 
                  value={taskSearch}
                  onValueChange={setTaskSearch}
                />
                <CommandList>
                  <CommandGroup>
                    {tasks
                      .filter(task => 
                        task.name.toLowerCase().includes(taskSearch.toLowerCase())
                      )
                      .map(task => (
                        <CommandItem 
                          key={task.id} 
                          value={task.id}
                          onSelect={() => {
                            setSelectedTask(task.id)
                            setOpen(false)
                          }}
                        >
                          {task.name}
                        </CommandItem>
                      ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          <Input
            placeholder="Add notes"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className="flex items-center justify-between">
            <motion.div 
              className="text-4xl font-mono font-bold"
              animate={{ scale: isRunning ? [1, 1.05, 1] : 1 }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              {formatDuration(duration)}
            </motion.div>
            
            <div className="flex gap-2">
              <AnimatePresence mode="wait">
                {!isRunning ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                  >
                    <Button
                      size="lg"
                      onClick={handleStart}
                      disabled={!selectedProject || !selectedTask}
                    >
                      <Play className="mr-2 h-5 w-5" />
                      Start
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex gap-2"
                  >
                    <Button size="lg" variant="outline" onClick={() => setIsRunning(false)}>
                      <Pause className="h-5 w-5" />
                    </Button>
                    <Button size="lg" variant="destructive" onClick={handleStop}>
                      <StopCircle className="h-5 w-5" />
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
  <CardHeader>
    <CardTitle>Recent Time Entries</CardTitle>
  </CardHeader>
  <CardContent className="space-y-4">
    {loadingTimeEntries ? (
      <p>Loading entries...</p>
    ) : timeEntries.length > 0 ? (
      timeEntries.map((entry) => {
        const project = projects.find(p => p.id === entry.projectId)
        const task = tasks.find(t => t.id === entry.taskId)

        return (
          <div
            key={entry.id}
            className="flex justify-between items-center p-4 rounded-lg bg-muted/50"
          >
            <div>
              <div className="font-medium">
                {project?.name || "Unknown Project"}
              </div>
              <div className="text-sm text-muted-foreground">
                {task?.name || "Unknown Task"} - {entry.description}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-muted-foreground">
                {formatTime(entry.startTime)} - {formatTime(entry.endTime)}
              </div>
              <div className="font-mono">
                {formatTotalTime(entry.totalTime)}
              </div>
            </div>
          </div>
        )
      })
    ) : (
      <p>No time entries found.</p>
    )}
  </CardContent>
</Card>
    </div>
    <TimerToast 
      isRunning={isRunning} 
      duration={duration}
      onStop={handleStop}
    />
  </>
  )
}