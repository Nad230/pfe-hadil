"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts"
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Calendar, 
  Users, 
  Target,
  ArrowUp,
  ArrowRight,
  ArrowDown
} from "lucide-react"
import { Project, Milestone, Task } from "@/lib/types/project-planner"
import { format, differenceInDays } from "date-fns"
import { useEffect, useState } from "react"
import Cookies from "js-cookie";



interface ProjectProgressProps {
  project: Project
}
interface TasksStats {
  totalTasks: number;
  completedTasks: number;
  activeTasks: number;
  ideaTasks: number;
  inProgressTasks: number;
  pausedTasks: number;
  planningTasks: number;
  lowPriorityTasks: number;
  mediumPriorityTasks: number;
  highPriorityTasks: number;
  progress: string;
}

interface TimeSpent {
  timeElapsedPercentage: number;
  daysRemaining: number;
  totalDurationDays: number;
}

interface TimeStats {
  estimatedTime: number;
  actualTime: number;
}

interface TeamStats {
  count: number;
  members: Array<{
    user: {
      fullname: string;
    };
  }>;
}
interface MilestonesStats {
  totalMilestones: number
  completedMilestones: number
  activeMilestones: number
  ideaMilestones: number
  inProgressMilestones: number
  pausedMilestones: number
  planningMilestones: number
}

export function ProjectProgress({ project }: ProjectProgressProps) {

  const [projectProgress, setProjectProgress] = useState(0)












  const [tasksStats, setTasksStats] = useState<TasksStats>({
    totalTasks: 0,
    completedTasks: 0,
    activeTasks: 0,
    ideaTasks: 0,
    inProgressTasks: 0,
    pausedTasks: 0,
    planningTasks: 0,
    lowPriorityTasks: 0,
    mediumPriorityTasks: 0,
    highPriorityTasks: 0,
    progress:"0%"
  })
  
  const [milestonesStats, setMilestonesStats] = useState<MilestonesStats>({
    totalMilestones: 0,
    completedMilestones: 0,
    activeMilestones: 0,
    ideaMilestones: 0,
    inProgressMilestones: 0,
    pausedMilestones: 0,
    planningMilestones: 0
  })

  const [timeSpent, setTimeSpent] = useState<TimeSpent>({
    timeElapsedPercentage: 0,
      daysRemaining: 0,
      totalDurationDays: 0,
  })
  const [timeStats, setTimeStats] = useState<TimeStats | null>(null);
  const [deadlines, setDeadlines] = useState<Task[]>([]);

const [teamStats, setTeamStats] = useState<TeamStats>({
  count: 0,
  members: []
});


useEffect(() => {
  const fetchData = async () => {
    try {
      const token = Cookies.get("token");
      const headers = {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      };

      // Create array of essential fetches that only need project.id
      const essentialFetches = [
        fetch(`http://localhost:3000/tasks/stats/${project.id}`, { headers }),
        fetch(`http://localhost:3000/milestones/stats/${project.id}`, { headers }),
        fetch(`http://localhost:3000/projects/time_spent/${project.id}`, { headers }),
        fetch(`http://localhost:3000/tasks/time_stats/${project.id}`, { headers }),
        fetch(`http://localhost:3000/tasks/deadlines/${project.id}`, { headers }),
        fetch(`http://localhost:3000/projects/progress/${project.id}`, { headers }),
      ];

      // Add team fetch ONLY if team exists
      if (project?.team?.id) {
        essentialFetches.push(
          fetch(`http://localhost:3000/team/active/${project.team.id}`, { headers })
        );
      }

      const [
        tasksRes,
        milestonesRes,
        timeRes,
        timeStatsRes,
        deadlinesRes,
        projectProgressRes,
        teamRes, // This will be undefined if no team
      ] = await Promise.all(essentialFetches);

      // Handle responses
      const tasksData = await tasksRes.json();
      const milestonesData = await milestonesRes.json();
      const timeData = await timeRes.json();
      const timeStatsData = await timeStatsRes.json();
      const deadlinesData = await deadlinesRes.json();
      const projectProgressData = await projectProgressRes.json();
      
      // Only handle team data if we fetched it
      const teamData = teamRes ? await teamRes.json() : { count: 0, members: [] };

      // Update state
      setTasksStats(tasksData);
      setMilestonesStats(milestonesData);
      setTimeSpent(timeData);
      setTimeStats(timeStatsData);
      setDeadlines(deadlinesData);
      setProjectProgress(projectProgressData);
      setTeamStats(teamData);

    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  fetchData();
}, [project.id]); // Removed team.id from dependencies









  // Calculate overall project progress
  const totalTasks = project.milestones.reduce((acc, milestone) => acc + milestone.tasks.length, 0)
  const completedTasks = project.milestones.reduce(
    (acc, milestone) => acc + milestone.tasks.filter(task => task.status === "completed").length,
    0
  )
  const inProgressTasks = project.milestones.reduce(
    (acc, milestone) => acc + milestone.tasks.filter(task => task.status === "in_progress").length,
    0
  )
  const notStartedTasks = project.milestones.reduce(
    (acc, milestone) => acc + milestone.tasks.filter(task => task.status === "not_started").length,
    0
  )
  
  
  // Calculate milestone progress
  const milestoneProgress = project.milestones.map(milestone => {
    const total = milestone.tasks.length
    const completed = milestone.tasks.filter(task => task.status === "completed").length
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0
    
    return {
      name: milestone.title,
      progress,
      total,
      completed
    }
  })
  
  // Calculate task priority distribution
  const highPriorityTasks = project.milestones.reduce(
    (acc, milestone) => acc + milestone.tasks.filter(task => task.priority === "high").length,
    0
  )
  const mediumPriorityTasks = project.milestones.reduce(
    (acc, milestone) => acc + milestone.tasks.filter(task => task.priority === "medium").length,
    0
  )
  const lowPriorityTasks = project.milestones.reduce(
    (acc, milestone) => acc + milestone.tasks.filter(task => task.priority === "low").length,
    0
  )
  
  const priorityData = [
    { name: "High", value: highPriorityTasks, color: "#ef4444" },
    { name: "Medium", value: mediumPriorityTasks, color: "#f59e0b" },
    { name: "Low", value: lowPriorityTasks, color: "#10b981" }
  ]
  
  // Calculate task status distribution
  const statusData = [
    { name: "Completed", value: completedTasks, color: "#10b981" },
    { name: "In Progress", value: inProgressTasks, color: "#3b82f6" },
    { name: "Not Started", value: notStartedTasks, color: "#6b7280" }
  ]
  
  // Calculate time metrics
  const startDate = new Date(project.milestones[0]?.startDate || new Date())
  const endDate = new Date(project.estimatedCompletionDate)
  const today = new Date()
  
  const totalDays = differenceInDays(endDate, startDate)
  const elapsedDays = differenceInDays(today, startDate)
  const remainingDays = differenceInDays(endDate, today)
  
  const timeProgress = totalDays > 0 ? Math.round((elapsedDays / totalDays) * 100) : 0
  
  // Calculate estimated vs actual hours
  const totalEstimatedHours = project.milestones.reduce(
    (acc, milestone) => acc + milestone.tasks.reduce(
      (taskAcc, task) => taskAcc + (task.estimatedHours || 0),
      0
    ),
    0
  )
  
  const totalActualHours = project.milestones.reduce(
    (acc, milestone) => acc + milestone.tasks.reduce(
      (taskAcc, task) => taskAcc + (task.actualHours || 0),
      0
    ),
    0
  )
  
  const hoursData = [
    { name: "Estimated", hours: totalEstimatedHours },
    { name: "Actual", hours: totalActualHours }
  ]
  
  // Calculate upcoming deadlines
  const upcomingDeadlines = project.milestones
    .flatMap(milestone => 
      milestone.tasks.map(task => ({
        ...task,
        milestoneName: milestone.title
      }))
    )
    .filter(task => 
      task.dueDate && 
      task.status !== "completed" && 
      differenceInDays(new Date(task.dueDate), today) <= 7 &&
      differenceInDays(new Date(task.dueDate), today) >= 0
    )
    .sort((a, b) => 
      new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime()
    )
    .slice(0, 5)

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-4">
      <Card>
  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
    <CardTitle className="text-sm font-medium">Project Progress</CardTitle>
    <Target className="h-4 w-4 text-muted-foreground" />
  </CardHeader>
  <CardContent>
    <div className="text-2xl font-bold">{projectProgress}%</div>
    <Progress value={projectProgress} className="mt-2" />
    <p className="text-xs text-muted-foreground mt-2">
      {tasksStats.completedTasks} of {tasksStats.totalTasks} tasks completed
    </p>
  </CardContent>
</Card>

        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Time Elapsed</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{timeSpent.timeElapsedPercentage}%</div>
            <Progress value={timeSpent.timeElapsedPercentage} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {timeSpent.daysRemaining} days remaining
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Milestones</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {milestonesStats.completedMilestones}/{milestonesStats.totalMilestones}
            </div>
            <div className="flex gap-2 mt-2">
              {project.milestones.map((milestone, index) => (
                <div 
                  key={index}
                  className={`h-2 flex-1 rounded-full ${
                    milestone.status === "completed" 
                      ? "bg-green-500" 
                      : milestone.status === "in_progress"
                        ? "bg-blue-500"
                        : "bg-gray-200 dark:bg-gray-700"
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {milestonesStats.activeMilestones} in progress
            </p>
          </CardContent>
        </Card>

        
        {/* Team Members Card */}
<Card>
  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
    <CardTitle className="text-sm font-medium">Team Members</CardTitle>
    <Users className="h-4 w-4 text-muted-foreground" />
  </CardHeader>
  <CardContent>
    <div className="text-2xl font-bold">
      {teamStats?.count || 0}
    </div>
    <div className="flex -space-x-2 mt-2">
      {(teamStats?.members || []).slice(0, 5).map((member, index) => (
        <div 
          key={index}
          className="w-8 h-8 rounded-full border-2 border-background bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold"
          title={member.user.fullname}
        >
          {member.user.fullname.charAt(0)}
        </div>
      ))}
    </div>
    {!project?.team && (
      <p className="text-xs text-muted-foreground mt-2">
        No team assigned to this project
      </p>
    )}
  </CardContent>
</Card>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Milestone Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={milestoneProgress}
                  layout="vertical"
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis dataKey="name" type="category" width={150} />
                  <Tooltip 
                    formatter={(value, name) => [`${value}%`, 'Progress']}
                    labelFormatter={(value) => `Milestone: ${value}`}
                  />
                  <Bar dataKey="progress" fill="hsl(var(--chart-1))" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
  <CardHeader>
    <CardTitle>Task Distribution</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="grid grid-cols-2 gap-4">
      {/* Status-Based Task Distribution */}
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={[
                { name: "Completed", value: tasksStats?.completedTasks || 0, color: "#4CAF50" },
                { name: "Active", value: tasksStats?.activeTasks || 0, color: "#2196F3" },
                { name: "Idea", value: tasksStats?.ideaTasks || 0, color: "#FFC107" },
                { name: "In Progress", value: tasksStats?.inProgressTasks || 0, color: "#FF5722" },
                { name: "Paused", value: tasksStats?.pausedTasks || 0, color: "#9E9E9E" },
                { name: "Planning", value: tasksStats?.planningTasks || 0, color: "#673AB7" },
              ]}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {[
                "#4CAF50", "#2196F3", "#FFC107", "#FF5722", "#9E9E9E", "#673AB7"
              ].map((color, index) => (
                <Cell key={`cell-${index}`} fill={color} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => [`${value} tasks`, "Count"]} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Priority-Based Task Distribution */}
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={[
                { name: "Low Priority", value: tasksStats?.lowPriorityTasks || 0, color: "#03A9F4" },
                { name: "Medium Priority", value: tasksStats?.mediumPriorityTasks || 0, color: "#FFC107" },
                { name: "High Priority", value: tasksStats?.highPriorityTasks || 0, color: "#D32F2F" },
              ]}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {[
                "#03A9F4", "#FFC107", "#D32F2F"
              ].map((color, index) => (
                <Cell key={`cell-${index}`} fill={color} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => [`${value} tasks`, "Count"]} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  </CardContent>
</Card>

      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Time Tracking</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
            {timeStats && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { name: "Estimated", hours: timeStats.estimatedTime },
                  { name: "Actual", hours: timeStats.actualTime }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="hours" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            )}

            </div>
            <div className="mt-4 text-sm">
            <div className="flex justify-between">
        <span>Estimated Hours:</span>
        <span className="font-medium">{timeStats?.estimatedTime ?? 'N/A'}</span>
        </div>
              <div className="flex justify-between">
                <span>Actual Hours:</span>
                <span className="font-medium">{timeStats?.actualTime?? 'N/A'}</span>
              </div>
              <div className="flex justify-between mt-2">
                <span>Difference:</span>
                <span className={`font-medium ${
                  timeStats?.actualTime?? 'N/A' > timeStats?.estimatedTime ?? 'N/A'
                    ? 'text-red-500' 
                    : 'text-green-500'
                }`}>
                  {timeStats?.actualTime?? 'N/A' > timeStats?.estimatedTime?? 'N/A' ? '+' : ''}
                  {timeStats?.actualTime?? 'N/A' - timeStats?.estimatedTime?? 'N/A'} hours
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card> 
  <CardHeader>
    <CardTitle>Upcoming Deadlines</CardTitle>
  </CardHeader>
  <CardContent>
    {upcomingDeadlines.length === 0 ? (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        No upcoming deadlines in the next 7 days
      </div>
    ) : (
      <div className="space-y-4">
        {upcomingDeadlines.map((task) => {
          const daysLeft = differenceInDays(new Date(task.dueDate), today);
          let urgencyColor = "text-green-500";
          if (daysLeft <= 1) urgencyColor = "text-red-500";
          else if (daysLeft <= 3) urgencyColor = "text-amber-500";

          return (
            <div key={task.id} className="flex items-start justify-between p-4 rounded-lg border">
              <div>
                <h4 className="font-medium">{task.name}</h4>

                <div className="flex items-center gap-2 mt-2">
                  {task.status === "In Progress" ? (
                    <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800">
                      <Clock className="mr-1 h-3 w-3" />
                      In Progress
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-800">
                      <AlertCircle className="mr-1 h-3 w-3" />
                      Not Started
                    </Badge>
                  )}

                  {task.priority === "HIGH" ? (
                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800">
                      <ArrowUp className="mr-1 h-3 w-3" />
                      High
                    </Badge>
                  ) : task.priority === "MEDIUM" ? (
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800">
                      <ArrowRight className="mr-1 h-3 w-3" />
                      Medium
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800">
                      <ArrowDown className="mr-1 h-3 w-3" />
                      Low
                    </Badge>
                  )}
                </div>
              </div>
              <div className={`text-right ${urgencyColor}`}>
                <div className="text-sm font-medium">
                  {format(new Date(task.dueDate), "MMM d")}
                </div>
                <div className="text-xs">
                  {daysLeft === 0 ? "Due today" : `${daysLeft} day${daysLeft !== 1 ? 's' : ''} left`}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    )}
  </CardContent>
</Card>

      </div>
    </div>
  )
}