"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Calendar, Target, CheckCircle2, Clock, ArrowRight } from "lucide-react"
import { format, addDays } from "date-fns"
import Cookies from "js-cookie"
import { toast } from "sonner"

interface BusinessPlan {
  stepByStep: string
  launchPlan: {
    week: string
    tasks: string[]
  }[]
}


interface Task {
  id: string
  title: string
  description: string
  deadline: Date
  completed: boolean
  weekNumber: number
}

export default function ActionPlanPage() {
  const [plan, setPlan] = useState<BusinessPlan | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [currentWeek, setCurrentWeek] = useState(1)
  const [loading, setLoading] = useState(true)
  const startDate = new Date()
  useEffect(() => {
    const fetchBusinessPlan = async () => {
      try {
        const token = Cookies.get("token");
        const response = await fetch("http://localhost:3000/business-plan/aiplan", {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
  
        if (!response.ok) throw new Error('Failed to fetch business plan');
        const data = await response.json();
  
        setPlan(data[0]); // <- fix here
        parseLaunchPlan(data[0].launchPlan); // <- fix here
      } catch (error) {
        console.error("Error fetching business plan:", error);
        toast.error("Failed to load business plan");
      } finally {
        setLoading(false);
      }
    };
  
    fetchBusinessPlan();
  }, []);
  
  function parseLaunchPlan(launchPlan: { week: string; tasks: string[] }[]) {
    const parsedTasks: Task[] = [];
    const startDate = new Date();
  
    launchPlan.forEach((weekData, weekIndex) => {
      const weekNumber = weekIndex + 1;
      weekData.tasks.forEach((taskTitle, taskIndex) => {
        parsedTasks.push({
          id: `week${weekNumber}-task${taskIndex}`,
          title: taskTitle,
          description: "",
          deadline: addDays(startDate, (weekNumber - 1) * 7 + taskIndex),
          completed: false,
          weekNumber: weekNumber
        });
      });
    });
  
    setTasks(parsedTasks);
  }
  
  

  const completedTasks = tasks.filter(task => task.completed).length
  const progress = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0

  const handleTaskToggle = (taskId: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ))
  }

  const getWeekStatus = (weekNum: number) => {
    const weekTasks = tasks.filter(task => task.weekNumber === weekNum)
    const completed = weekTasks.every(task => task.completed)
    const inProgress = weekTasks.some(task => task.completed)
    return { completed, inProgress }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 flex items-center justify-center">
        <div className="text-center">Loading your action plan...</div>
      </div>
    )
  }

  if (!plan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 flex items-center justify-center">
        <div className="text-center text-red-500">Failed to load business plan</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5">
      <div className="container max-w-5xl mx-auto py-12 px-4">
        {/* Header */}
        <div className="text-center space-y-4 mb-12">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold tracking-tight"
          >
            Your Custom Launch Plan 🚀
          </motion.h1>
          
          {/* Step-by-Step Guide */}
         

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center gap-2"
          >
            <Progress value={progress} className="w-64 h-3" />
            <p className="text-muted-foreground">
              {completedTasks} of {tasks.length} tasks completed
            </p>
          </motion.div>
        </div>

        {/* Timeline */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map(week => {
            const { completed, inProgress } = getWeekStatus(week)
            return (
              <motion.div
                key={week}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: week * 0.1 }}
                onClick={() => setCurrentWeek(week)}
                className={`
                  cursor-pointer rounded-lg p-4 border-2 transition-all
                  ${currentWeek === week ? 'border-primary bg-primary/5' : 'border-muted'}
                  ${completed ? 'bg-green-500/10' : inProgress ? 'bg-blue-500/10' : ''}
                `}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">Week {week}</span>
                  {completed && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                </div>
                <p className="text-sm text-muted-foreground">
                  {format(addDays(startDate, (week - 1) * 7), 'MMM d')} - {format(addDays(startDate, week * 7 - 1), 'MMM d')}
                </p>
              </motion.div>
            )
          })}
        </div>

        {/* Tasks */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentWeek}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-4"
          >
            {tasks
              .filter(task => task.weekNumber === currentWeek)
              .map((task) => (
                <Card key={task.id} className={task.completed ? 'bg-muted/50' : ''}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Checkbox
                        checked={task.completed}
                        onCheckedChange={() => handleTaskToggle(task.id)}
                        className="mt-1"
                      />
                      <div className="flex-1 space-y-1">
                        <h3 className={`font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                          {task.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {task.description}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>Due by {format(task.deadline, 'MMM d')}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={() => setCurrentWeek(prev => Math.max(1, prev - 1))}
            disabled={currentWeek === 1}
          >
            Previous Week
          </Button>
          <Button
            onClick={() => setCurrentWeek(prev => Math.min(4, prev + 1))}
            disabled={currentWeek === 4}
          >
            Next Week
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}