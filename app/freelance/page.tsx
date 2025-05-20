"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useTimerControls } from "@/hooks/useTimerControls"

import { 
  Folder,
  CheckCircle2,
  Clock,
  Users,
  Plus,
  Play,
  FileText,
  BarChart,
  Calendar,
  Timer,
  Wallet,
  TrendingUp,
  ClipboardList
} from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import Cookies from "js-cookie"
import { Progress } from "@/components/ui/progress"
import { ProjectTracker } from "@/components/freelance/project-tracker"
import { TaskManager } from "@/components/freelance/task-manager"
import { InvoiceManager } from "@/components/freelance/invoice-manager"
import { PortfolioShowcase } from "@/components/freelance/portfolio-showcase"
import { ProposalWriter } from "@/components/freelance/proposal-writer"
import { TimeTracker } from "@/components/freelance/time-tracker"
import { ClientHub } from "@/components/freelance/client-hub"
import { Dialog,DialogContent,DialogHeader,DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"
export default function ProjectDashboard() {
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    teamMembers: 0,
    tasksCompleted: 0,
    monthlyGrowth: 0,
  });

  const { startTimer } = useTimerControls()
const [trackingTask, setTrackingTask] = useState<Task | null>(null)
  const [currentTasks, setCurrentTasks] = useState<Task[]>([]);

 interface Task {
  id: string
  name: string
  dueDate: string
  progress: number
  status: string
  milestone?: {
    id: string
    name: string
    dueDate: string
    progress: number
    project: {
      id: string // Add project ID
      name: string
    }
  }
}

  const projectStats = [
    {
      title: "Total Projects",
      icon: Folder,
      color: "text-blue-500",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
      value: stats.totalProjects,
      growth: "+5.2%"
    },
    {
      title: "Active Projects",
      icon: Clock,
      color: "text-amber-500",
      bgColor: "bg-amber-100 dark:bg-amber-900/20",
      value: stats.activeProjects,
      growth: "+2.1%"
    },
    {
      title: "Completed",
      icon: CheckCircle2,
      color: "text-green-500",
      bgColor: "bg-green-100 dark:bg-green-900/20",
      value: stats.completedProjects,
      growth: "+8.7%"
    },
    {
      title: "Team Members",
      icon: Users,
      color: "text-purple-500",
      bgColor: "bg-purple-100 dark:bg-purple-900/20",
      value: stats.teamMembers,
      growth: "+1.3%"
    }
  ];

  const fetchStats = async () => {
    try {
      const response = await fetch("http://localhost:3000/projects/stats", {
        headers: { Authorization: `Bearer ${Cookies.get("token")}` },
      });

      if (!response.ok) throw new Error("Failed to fetch stats");
      
      const data = await response.json();
      setStats({
        totalProjects: data.totalProjects,
        activeProjects: data.activeProjects,
        completedProjects: data.completedProjects,
        teamMembers: data.teamMembers,
        tasksCompleted: data.tasksCompleted,
        monthlyGrowth: data.monthlyGrowth
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };
const fetchCurrentTasks = async () => {
  try {
    const response = await fetch("http://localhost:3000/tasks/current_task", {
      headers: { Authorization: `Bearer ${Cookies.get("token")}` },
    });

    if (!response.ok) throw new Error("Failed to fetch current tasks");
    
    const data = await response.json();
    
    const tasks = Array.isArray(data) ? data : [data];
    
    setCurrentTasks(tasks.map((task: any) => ({
      id: task.id,
      name: task.name,
      dueDate: task.dueDate,
      progress: task.progress,
      status: task.status,
      milestone: {
        id: task.milestone.id,
        project: {
          id: task.milestone.project.id,
          name: task.milestone.project.name
        },
        dueDate: task.milestone.dueDate,
        progress: task.milestone.progress
      }
    })));
  } catch (error) {
    console.error("Error fetching tasks:", error);
  }
};
  useEffect(() => {
    fetchStats();
    fetchCurrentTasks();
  }, []);


  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Project Dashboard</h1>
          <p className="text-muted-foreground">Manage your development projects and tasks</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </div>

      {/* Project Statistics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {projectStats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <Badge variant="outline" className="text-green-500">
                    {stat.growth}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <h2 className="font-semibold">{stat.title}</h2>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2">
       {/* Quick Actions */}
<Card>
  <CardHeader>
    <CardTitle>Quick Actions</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="grid grid-cols-2 gap-4">
      <Link href="freelance/portfolio" className="w-full">
        <Button variant="outline" className="w-full h-24 flex flex-col gap-2">
          <Folder className="h-6 w-6" />
          <span>Projects</span>
        </Button>
      </Link>
      <Link href="freelance/timetracker" className="w-full">
        <Button variant="outline" className="w-full h-24 flex flex-col gap-2">
          <Timer className="h-6 w-6" />
          <span>Track Time</span>
        </Button>
      </Link>
      <Link href="freelance/clients" className="w-full">
        <Button variant="outline" className="w-full h-24 flex flex-col gap-2">
          <Users className="h-6 w-6" />
          <span>Clients</span>
        </Button>
      </Link>
      <Link href="freelance/invoices" className="w-full">
        <Button variant="outline" className="w-full h-24 flex flex-col gap-2">
          <Wallet className="h-6 w-6" />
          <span>Invoices</span>
        </Button>
      </Link>
    </div>
  </CardContent>
</Card>

        {/* Current Tasks */}
        <div className="space-y-6">
       <Card>
  <CardHeader>
    <CardTitle>Current Tasks</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="space-y-4">
      {currentTasks.map((task) => (
        <motion.div 
          key={task.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 cursor-pointer"
          onClick={() => setTrackingTask(task)}
        >
          <div className="flex-1">
            <p className="font-medium">{task.name}</p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{new Date(task.dueDate).toLocaleDateString()}</span>
              <Badge variant="outline">{task.status}</Badge>
            </div>
          </div>
          <div className="w-24">
            <Progress value={task.progress} className="h-2" />
            <span className="text-xs text-muted-foreground">{task.progress}%</span>
          </div>
        </motion.div>
      ))}
    </div>
  </CardContent>
</Card>


        {/* Project Milestones */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4" />
              Project Milestones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {currentTasks.map((task) => (
                task.milestone && (
                  <div key={task.milestone.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{task.milestone.name}</h3>
                          <Badge variant="outline">
                            {task.milestone.project.name}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Due:</span>
                            <span className="ml-2">
                              {new Date(task.milestone.dueDate).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-bold">{task.milestone.progress}%</span>
                      </div>
                    </div>
                    <Progress value={task.milestone.progress} className="mt-3 h-2" />
                  </div>
                )
              ))}
              {currentTasks.every(task => !task.milestone) && (
                <div className="text-center p-4 text-muted-foreground">
                  No active milestones
                </div>
              )}
            </div>
          </CardContent>
        </Card>
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
        trackingTask.milestone.project.id, // Directly use milestone project ID
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
      </div>
    </div>
    </div>
  )
}