import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Play, Pause, StopCircle, Plus, Brain, Zap, Flag, Focus, Clock } from "lucide-react"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import Cookies from "js-cookie"
import { Progress } from "../ui/progress"
import { Badge } from "../ui/badge"
import { cn } from "@/lib/utils"
import { formatDuration, formatTime } from "@/lib/utils/time"

import { AnimatePresence, motion } from "framer-motion"

export function TimeTrackerTimer() {
  const [isRunning, setIsRunning] = useState(false)
  const [duration, setDuration] = useState(0)
  const [selectedProject, setSelectedProject] = useState<string>("")
  const [selectedTask, setSelectedTask] = useState<string>("")

  const [description, setDescription] = useState("")
  const [taskSearch, setTaskSearch] = useState("")
  const [open, setOpen] = useState(false)
  const [timeEntryId, setTimeEntryId] = useState<string | null>(null) // Stores created time entry ID
  const [currentTime, setCurrentTime] = useState(new Date())
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  interface Project {
    id: string;
    name: string;
  }

  const [projects, setProjects] = useState<Project[]>([])

  interface Task {
    id: string;
    projectId: string;
    name: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    milestoneId?: string; // Track the associated milestone
  }

  // Note: Updated Milestone type to include tasks.
  interface Milestone {
    id: string;
    projectId: string;
    name: string;
    status: string;
    dueDate: string;
    createdAt: string;
    updatedAt: string;
    tasks?: Task[]; // Nested tasks from the API response
  }

  const [milestones, setMilestones] = useState<Milestone[]>([])
const [selectedMilestone, setSelectedMilestone] = useState<string>("")
  const [tasks, setTasks] = useState<Task[]>([])
  const [allTasks, setAllTasks] = useState<Task[]>([]);


  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch("http://localhost:3000/projects", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
          credentials: "include",
        })
        if (!response.ok) {
          throw new Error("Failed to fetch projects")
        }
        const data = await response.json()
        setProjects(data)
      } catch (error) {
        console.error("Error fetching projects:", error)
      }
    }
    fetchProjects()
  }, [])

  // Fetch milestones (which include tasks) when a project is selected.
  useEffect(() => {
    const fetchMilestones = async () => {
      if (!selectedProject) {
        setMilestones([]);
        setTasks([]);
        return;
      }
      try {
        const response = await fetch(
          `http://localhost:3000/milestones/project/${selectedProject}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${Cookies.get("token")}`,
            },
            credentials: "include",
          }
        );
  
        if (!response.ok) throw new Error("Failed to fetch milestones");
  
        const data = await response.json();
        console.log("Fetched milestones data:", data);
  
        // Log tasks for each milestone if available
        data.forEach((milestone) => {
          console.log(
            `Milestone ${milestone.id} tasks:`,
            milestone.tasks || "No tasks found"
          );
        });
  
        setMilestones(data);
        // Reset tasks when project changes.
        setTasks([]);
      } catch (error) {
        console.error("Error fetching milestones:", error);
        setMilestones([]);
        setTasks([]);
      }
    };
    fetchMilestones();
  }, [selectedProject]);
  

 // Effect to update tasks when a milestone is selected.
// Update the useEffect that sets tasks when selectedMilestone changes
useEffect(() => {
  if (!selectedMilestone) {
    setTasks([]);
    return;
  }
  if (selectedMilestone === "all") {
    // Combine tasks from every milestone, filtering out invalid tasks
    const combinedTasks = milestones.flatMap((milestone) =>
      (milestone.tasks || [])
        .filter(Boolean) // Remove null/undefined tasks
        .map(task => ({
          ...task,
          milestoneId: milestone.id,
          projectId: milestone.projectId
        }))
    );
    console.log("Combined tasks from all milestones:", combinedTasks);
    setTasks(combinedTasks);
  } else {
    const milestone = milestones.find(m => m.id === selectedMilestone);
    if (milestone) {
      const milestoneTasks = (milestone.tasks || [])
        .filter(Boolean) // Remove null/undefined tasks
        .map(task => ({
          ...task,
          milestoneId: milestone.id,
          projectId: milestone.projectId
        }));
      console.log("Tasks for selected milestone:", milestoneTasks);
      setTasks(milestoneTasks);
    } else {
      setTasks([]);
    }
  }
}, [selectedMilestone, milestones]);


 
  const getProjectMilestones = (projectId: string) => {
    return milestones.filter(milestone => milestone.projectId === projectId)
  }
  
  const getMilestoneStatus = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-400'
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800/30 dark:text-yellow-400'
      case 'not_started':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-400'
    }
  }

  
  
  
  // Update filteredTasks calculation
 

 

  const handleStart = async () => {
    if (!selectedProject || !selectedTask) return;
  
    try {
      const response = await fetch("http://localhost:3000/time-entry/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
        credentials: "include",
        body: JSON.stringify({
          projectId: selectedProject,
          taskId: selectedTask,
          description: description.trim() || "No description",
        }),
      });
  
      if (!response.ok) {
        throw new Error("Failed to create time entry");
      }
  
      const data = await response.json();
      setTimeEntryId(data.id);
      setIsRunning(true);
      console.log("Time entry started:", data);
      console.log("isRunning:", isRunning); // Debugging log
    } catch (error) {
      console.error("Error starting time entry:", error);
    }
  };
  useEffect(() => {
    console.log("isRunning changed:", isRunning);
  }, [isRunning]);
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);
  
 
      

  const handlePause = () => {
    setIsRunning(false)
  }

  const handleStop = async () => {
    if (!timeEntryId) return;
  
    try {
      const response = await fetch(`http://localhost:3000/time-entry/${timeEntryId}/stop`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
        credentials: "include",
      });
  
      if (!response.ok) {
        throw new Error("Failed to stop time entry");
      }
  
      setIsRunning(false);
      setDuration(0);
      setDescription("");
      setTimeEntryId(null);
    } catch (error) {
      console.error("Error stopping time entry:", error);
    }
  };

  useEffect(() => {
    setSelectedTask("")
    setTaskSearch("")
    setSelectedMilestone("")
    setTasks([])
  }, [selectedProject])

 
  
  // Update the task creation handler
  const handleCreateTask = async () => {
    if (!selectedProject || !taskSearch.trim() || !selectedMilestone) return;
  
    try {
      const response = await fetch("http://localhost:3000/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
        body: JSON.stringify({
          name: taskSearch,
          milestoneId: selectedMilestone,
          projectId: selectedProject
        })
      });
  
      if (!response.ok) throw new Error("Failed to create task");
  
      const newTask = await response.json();
      setAllTasks(prev => [...prev, newTask]);
      setSelectedTask(newTask.id);
      setOpen(false);
      setTaskSearch("");
    } catch (error) {
      console.error("Error creating task:", error);
    }
  };
  

  const selectedTaskName = tasks.find((task) => task.id === selectedTask)?.name || "Select Task";


// Fix the filteredTasks calculation
const filteredTasks = (tasks || [])
  .filter(task => 
    task && // Ensure task exists
    (selectedMilestone === "all" || task.milestoneId === selectedMilestone) &&
    (taskSearch
      ? task.name?.toLowerCase().includes(taskSearch.toLowerCase())
      : true)
  )
  .slice(0, taskSearch ? undefined : 3);

useEffect(() => {
  console.log("Filtered tasks:", filteredTasks);
}, [filteredTasks]);

return (
  <Card className="relative overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
    <CardContent className="relative pt-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Time Tracker</h2>
        </div>
        <motion.div
          animate={{ scale: isRunning ? [1, 1.1, 1] : 1 }}
          transition={{ repeat: isRunning ? Infinity : 0, duration: 2 }}
          className="text-sm text-muted-foreground"
        >
          {formatTime(currentTime)}
        </motion.div>
      </div>

      <div className="grid gap-4">
        <div className="grid gap-4 md:grid-cols-3">
          <Select value={selectedProject} onValueChange={setSelectedProject}>
            <SelectTrigger>
              <SelectValue placeholder="Select Project" />
            </SelectTrigger>
            <SelectContent>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: project.color }} />
                    {project.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedMilestone} onValueChange={setSelectedMilestone} disabled={!selectedProject}>
            <SelectTrigger>
              <SelectValue placeholder="Select Milestone" />
            </SelectTrigger>
            <SelectContent>
              {milestones.map((milestone) => (
                <SelectItem key={milestone.id} value={milestone.id}>
                  <div className="flex items-center gap-2">
                    <Flag className="h-4 w-4 text-muted-foreground" />
                    <span>{milestone.name}</span>
                    <Badge variant="secondary" className={cn("ml-auto", getMilestoneStatus(milestone.status))}>
                      {milestone.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Popover open={open} onOpenChange={setOpen}>
  <PopoverTrigger asChild>
    <Button variant="outline" role="combobox" aria-expanded={open} disabled={!selectedProject} className="justify-between">
      {selectedTaskName}
    </Button>
  </PopoverTrigger>
  <PopoverContent className="p-0" side="bottom" align="start">
    <Command>
      <CommandInput
        placeholder="Search or create task..."
        value={taskSearch}
        onValueChange={setTaskSearch}
      />
      <CommandList>
        {filteredTasks.length === 0 && taskSearch ? (
          <CommandEmpty className="py-2">
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={handleCreateTask}
            >
              <Plus className="mr-2 h-4 w-4" />
              Create "{taskSearch}"
            </Button>
          </CommandEmpty>
        ) : (
          <CommandGroup>
            {filteredTasks.map((task) => (
              <CommandItem
                key={task.id}
                value={task.name}
                onSelect={() => {
                  setSelectedTask(task.id)
                  setOpen(false)
                }}
                // Add these keyboard event handlers
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setSelectedTask(task.id)
                    setOpen(false)
                  }
                }}
                // Ensure the item is focusable
                tabIndex={0}
              >
                {task.name}
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </Command>
  </PopoverContent>
</Popover>
        </div>
        <Input placeholder="What are you working on?" value={description} onChange={(e) => setDescription(e.target.value)} className="bg-white/50 backdrop-blur-sm dark:bg-white/5" />

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <motion.div className="text-3xl font-mono tabular-nums" animate={{ scale: isRunning ? [1, 1.02, 1] : 1 }} transition={{ repeat: isRunning ? Infinity : 0, duration: 1 }}>
              {formatDuration(duration)}
            </motion.div>

            <div className="flex items-center gap-2">
              <AnimatePresence mode="wait">
                {!isRunning ? (
                  <motion.div key="start" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}>
                    <Button onClick={handleStart} disabled={!selectedProject || !selectedTask} size="lg" className="bg-green-600 hover:bg-green-700">
                      <Play className="mr-2 h-4 w-4" />
                      Start
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div key="controls" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="flex gap-2">
                    <Button onClick={handlePause} size="lg" variant="outline">
                      <Pause className="mr-2 h-4 w-4" />
                      Pause
                    </Button>
                    <Button onClick={handleStop} size="lg" variant="destructive">
                      <StopCircle className="mr-2 h-4 w-4" />
                      Stop
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <Progress value={((duration % 3600) / 3600) * 100} className="h-1" />
        </div>
      </div>
    </CardContent>
  </Card>
)
}