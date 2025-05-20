"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Play, Pause, StopCircle, Clock, Calendar, Target, Brain, Plus, Flag, ArrowUpRight, ChevronDown } from "lucide-react"

import { toast } from "sonner"
import Cookies from "js-cookie"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { formatDuration, formatTime } from "@/lib/utils/time"
import { AnimatePresence, motion } from "framer-motion"
import TimerToast from "@/components/time-tracker/TimerToast"
import { useTimerStore } from "@/lib/stores/useTimerStore"
import { useTimerControls } from "@/hooks/useTimerControls"

interface Project {
  id: string
  name: string
  color: string
}

interface TimeEntryStats {
  today: number;
  weekly: number;
  monthly: number;
  projectsTracked: number;
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
interface User {
  id: string;
  sub?: string;  // Only present in current user response
  fullname: string;  // Lowercase 'n' to match API
  profile_photo: string;  // Underscore to match API
  email?: string;
}


interface TimeEntry {
  id: string;
  projectId: string;
  userId:string;
  taskId: string;
  description: string;
  startTime: string;
  notes: string | null;
  endTime: string | null;
  totalTime: number | null;
  duration: number;
  project: {
    id: string;
    name: string;
  };
  task: {
    id: string;
    name: string;
  };
}

export default function TimeTracker() {
  // Use the global timer store
  const { isRunning, isPaused, startTime, pausedDuration } = useTimerStore()
  
  // Get timer controls
  const { startTimer, pauseTimer, resumeTimer, stopTimer, timeEntryId } = useTimerControls()
  
  // Local state for timer display
  const [duration, setDuration] = useState(0)
  
  // Other state
  const [selectedProject, setSelectedProject] = useState("")
  const [selectedMilestone, setSelectedMilestone] = useState("")
  const [selectedTask, setSelectedTask] = useState("")
  const [description, setDescription] = useState("")
  const [taskSearch, setTaskSearch] = useState("")
  const [open, setOpen] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [projects, setProjects] = useState<Project[]>([])
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([])
  const [isSendingNote, setIsSendingNote] = useState(false)
  const [expandedEntries, setExpandedEntries] = useState<Set<string>>(new Set())
  const [stats, setStats] = useState<TimeEntryStats>({
    today: 0,
    weekly: 0,
    monthly: 0,
    projectsTracked: 0
  })
  const [loadingTimeEntries, setLoadingTimeEntries] = useState(true)
const [currentUser, setCurrentUser] = useState<User | null>(null);
const [fetchedUsers, setFetchedUsers] = useState<Record<string, User>>({});
  // Update timer display based on startTime and paused state
  useEffect(() => {
    let interval: NodeJS.Timeout
    
    if (isRunning && startTime && !isPaused) {
      // Initial calculation
      setDuration(Math.floor((Date.now() - startTime) / 1000) + (pausedDuration || 0))
      
      // Update every second
      interval = setInterval(() => {
        setDuration(Math.floor((Date.now() - startTime) / 1000) + (pausedDuration || 0))
      }, 1000)
    } else if (isPaused) {
      // If paused, show the frozen duration
      setDuration(pausedDuration || 0)
    } else if (!isRunning) {
      setDuration(0)
    }
    
    return () => clearInterval(interval)
  }, [isRunning, startTime, isPaused, pausedDuration])

  // Current time updater
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  // Toggle entry expansion
  const toggleEntryExpansion = (entryId: string) => {
    setExpandedEntries(prev => {
      const newSet = new Set(prev)
      newSet.has(entryId) ? newSet.delete(entryId) : newSet.add(entryId)
      return newSet
    })
  }

  // Add note to time entry
  const handleAppendNote = async () => {
    setIsSendingNote(true)
    if (!timeEntryId || !description.trim()) return
  
    try {
      const response = await fetch(`http://localhost:3000/time-entry/${timeEntryId}/add-note`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
        body: JSON.stringify({ note: description }),
      })
  
      if (!response.ok) throw new Error("Failed to send note")
      
      // Update local state to reflect new note
      setTimeEntries(prev => prev.map(entry => 
        entry.id === timeEntryId 
          ? { 
              ...entry, 
              notes: entry.notes 
                ? `${entry.notes}\n${description}`  // Append new note with newline
                : description                       // First note
            }
          : entry
      ))
  
      toast.success("Note added!")
      setDescription("")
  
    } catch (error) {
      console.error(error)
      toast.error("Could not send note")
    } finally {
      setIsSendingNote(false)
    }
  }

  // Fetch time entries
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

  // Fetch stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("http://localhost:3000/time-entry/stats", {
          headers: { Authorization: `Bearer ${Cookies.get("token")}` }
        })
        const data = await response.json()
        setStats(data)
      } catch (error) {
        console.error("Error fetching stats:", error)
      }
    }
    
    fetchStats()
  }, [])

  // Format total time
  const formatTotalTime = (duration: number | null) => {
    if (duration === null || duration < 0 || isNaN(duration)) return "N/A"
    
    // Convert decimal hours to minutes
    const totalMinutes = Math.round(duration * 60)
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60
  
    if (hours === 0) return `${minutes} min`
    if (minutes === 0) return `${hours} hr`
    return `${hours} hr ${minutes} min`
  }

  // Format time
  const formatTimeDisplay = (isoString: string | null) => {
    if (!isoString) return "Ongoing"
    const date = new Date(isoString)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  // Handle start timer
  const handleStart = async () => {
    if (!selectedProject || !selectedTask) return
    await startTimer(selectedProject, selectedTask, description)
  }

  // Handle pause timer
  const handlePause = async () => {
    await pauseTimer()
  }

  // Handle resume timer
  const handleResume = async () => {
    await resumeTimer()
  }

  // Handle stop timer
  const handleStop = async () => {
    await stopTimer()
  }

  useEffect(() => {
  const fetchCurrentUser = async () => {
    try {
      const response = await fetch("http://localhost:3000/auth/me", {
        headers: { Authorization: `Bearer ${Cookies.get("token")}` }
      });
      const data = await response.json();
      setCurrentUser(data);
      console.log("me",data)
    } catch (error) {
      console.error("Error fetching current user:", error);
    }
  };
  fetchCurrentUser();
}, []);

// Fetch user details for time entries
useEffect(() => {
  const fetchUsers = async () => {
    const uniqueUserIds = Array.from(new Set(timeEntries.map(entry => entry.userId)));
    const users: Record<string, User> = {};
    
    for (const userId of uniqueUserIds) {
      if (!fetchedUsers[userId] && userId !== currentUser?.sub) {
        try {
          const response = await fetch(`http://localhost:3000/auth/${userId}`, {
            headers: { Authorization: `Bearer ${Cookies.get("token")}` }
          });
          users[userId] = await response.json();
          console.log(users)
        } catch (error) {
          console.error("Error fetching user:", userId, error);
          users[userId] = {
            id: userId,
            sub: userId,
            fullName: "Unknown User",
            profilePhoto: ""
          };
        }
      }
    }
    
    setFetchedUsers(prev => ({ ...prev, ...users }));
  };

  if (timeEntries.length > 0) {
    fetchUsers();
  }
}, [timeEntries]);

const getUserInfo = (userId: string) => {
  // Check both id and sub for current user match
  if (userId === currentUser?.id || userId === currentUser?.sub) {
    return {
      fullName: "Me",
      profilePhoto: currentUser.profile_photo || "/default-avatar.png"
    };
  }
  
  const user = fetchedUsers[userId];
  return {
    fullName: user?.fullname || "Loading...",
    profilePhoto: user?.profile_photo || "/default-avatar.png"
  };
};

  // Get milestone status
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
              <div className="text-2xl font-bold">
                {formatTotalTime(stats.today)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Week</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatTotalTime(stats.weekly)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatTotalTime(stats.monthly)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Projects Tracked</CardTitle>
              <Flag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.projectsTracked}
              </div>
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

            <div className="flex items-center gap-2">
              <Input
                placeholder="Add notes"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAppendNote()}
              />
                
              {isRunning && timeEntryId && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleAppendNote}
                  title="Send Note"
                  className="text-primary hover:text-primary/80"
                  disabled={!description.trim()}
                >
                  <ArrowUpRight className="h-5 w-5" />
                </Button>
              )}
            </div>

            <div className="flex items-center justify-between">
              <motion.div 
                className="text-4xl font-mono font-bold"
                animate={{ scale: isRunning && !isPaused ? [1, 1.05, 1] : 1 }}
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
                  ) : isPaused ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="flex gap-2"
                    >
                      <Button size="lg" onClick={handleResume}>
                        <Play className="mr-2 h-5 w-5" />
                        Resume
                      </Button>
                      <Button size="lg" variant="destructive" onClick={handleStop}>
                        <StopCircle className="h-5 w-5" />
                      </Button>
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="flex gap-2"
                    >
                      <Button size="lg" variant="outline" onClick={handlePause}>
                        <Pause className="mr-2 h-5 w-5" />
                        Pause
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
              timeEntries.map((entry) => (
                <div
                  key={entry.id}
                  className={`flex flex-col p-4 rounded-lg bg-muted/50 cursor-pointer transition-all ${
                    expandedEntries.has(entry.id) ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => toggleEntryExpansion(entry.id)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">
                        {entry.project?.name || "Unknown Project"}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {entry.task?.name || "Unknown Task"} - {entry.description}
                      </div>
                    </div>
      <div className="flex items-center gap-2">
  <img
    src={getUserInfo(entry.userId).profilePhoto}
    className="h-6 w-6 rounded-full"
    alt="User avatar"
    onError={(e) => {
      (e.target as HTMLImageElement).src = "/default-avatar.png";
    }}
  />
  <span className="text-sm">
    {getUserInfo(entry.userId).fullName}
  </span>
</div>

                    <div className="flex items-center gap-4">
                      <ChevronDown
                        className={`h-4 w-4 transform transition-transform ${
                          expandedEntries.has(entry.id) ? 'rotate-180' : ''
                        }`}
                      />
                      <div className="text-sm text-muted-foreground">
                        {formatTimeDisplay(entry.startTime)} - {formatTimeDisplay(entry.endTime)}
                      </div>
                      <div className="font-mono">
                        {formatTotalTime(entry.duration)}
                      </div>
                    </div>
                  </div>
                  
                  {expandedEntries.has(entry.id) && entry.notes && (
                    <div className="mt-2 pt-2 border-t border-muted">
                      <div className="text-sm font-medium text-muted-foreground mb-1">Notes:</div>
                      <div className="text-sm text-muted-foreground whitespace-pre-line">
                        {entry.notes}
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p>No time entries found.</p>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* TimerToast component shows the timer status */}
      <TimerToast />
    </>
  )
}