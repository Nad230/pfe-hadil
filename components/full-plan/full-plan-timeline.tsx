"use client"
import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Circle, ChevronDown, ChevronUp, Loader2 } from "lucide-react"
import { useParams } from "next/navigation"
import { toast } from "sonner"
import Cookies from "js-cookie"
import { Skeleton } from "@/components/ui/skeleton"

interface Task {
  id: string
  dayNumber: string
  title: string
  description: string
  completed: boolean
  plannedDate: null | string
}

interface WeekSummary {
  id: string
  weekNumber: number
  summary: string
}

interface GroupedTasks {
  week: number
  title: string
  tasks: Task[]
}

interface FullPlanTimelineProps {
  startupPlanId: string
}

export function FullPlanTimeline({ startupPlanId }: FullPlanTimelineProps) {
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [groupedTasks, setGroupedTasks] = useState<GroupedTasks[]>([])
  const [weekSummaries, setWeekSummaries] = useState<WeekSummary[]>([])
  const [pendingTaskIds, setPendingTaskIds] = useState<Set<string>>(new Set())

  const cleanText = (text: string) => {
    return text
      .replace(/[\r\n]+/g, ' ')
      .replace(/[*\-]+/g, '')
      .replace(/\s+/g, ' ')
      .trim()
  }


  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        const token = Cookies.get("token")
        
        // Fetch tasks and calendar data in parallel
        const [tasksResponse, calendarResponse] = await Promise.all([
          fetch(
            `http://localhost:3000/business-plan/startup/${startupPlanId}/tasks`,
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            }
          ),
          fetch(
            `http://localhost:3000/business-plan/startup/${startupPlanId}/calendar`,
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            }
          )
        ])

        if (!tasksResponse.ok || !calendarResponse.ok) {
          throw new Error('Failed to fetch data')
        }

        const tasks: Task[] = await tasksResponse.json()
        const summaries: WeekSummary[] = await calendarResponse.json()
        
        organizeTasksByWeek(tasks)
        setWeekSummaries(summaries)
      } catch (error) {
        console.error("Error fetching data:", error)
        setError(error instanceof Error ? error.message : 'Failed to load data')
        toast.error("Failed to load plan data")
      } finally {
        setLoading(false)
      }
    }

    startupPlanId && fetchData()
  }, [startupPlanId])

  const organizeTasksByWeek = (tasks: Task[]) => {
    const weekMap = new Map<number, Task[]>()

    const getWeekNumber = (dayStr: string): number => {
      // Extract the first day number from ranges like "5–8"
      const firstDay = parseInt(dayStr.split(/[–-]/)[0])
      return Math.floor((firstDay - 1) / 7) + 1
    }

    tasks.forEach(task => {
      const week = getWeekNumber(task.dayNumber)
      if (!weekMap.has(week)) weekMap.set(week, [])
      weekMap.get(week)?.push(task)
    })

    const sortedWeeks = Array.from(weekMap.entries())
      .sort(([a], [b]) => a - b)
      .map(([week, tasks]) => ({
        week,
        title: `Week ${week}`,
        tasks: tasks.sort((a, b) => 
          parseInt(a.dayNumber.split(/[–-]/)[0]) - 
          parseInt(b.dayNumber.split(/[–-]/)[0])
        )
      }))

    setGroupedTasks(sortedWeeks)
  }


  const toggleTask = async (taskId: string) => {
    if (pendingTaskIds.has(taskId)) return

    setPendingTaskIds(prev => new Set(prev).add(taskId))

    const currentTask = groupedTasks
      .flatMap(week => week.tasks)
      .find(task => task.id === taskId)

    if (!currentTask) {
      setPendingTaskIds(prev => {
        const next = new Set(prev)
        next.delete(taskId)
        return next
      })
      return
    }

    const newCompleted = !currentTask.completed

    // Optimistic update
    setGroupedTasks(prev => prev.map(week => ({
      ...week,
      tasks: week.tasks.map(task => 
        task.id === taskId ? { ...task, completed: newCompleted } : task
      )
    })))

    try {
      const token = Cookies.get("token")
      const response = await fetch(
        `http://localhost:3000/business-plan/startup/updateTask/${taskId}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ completed: newCompleted })
        }
      )

      if (!response.ok) throw new Error('Failed to update task')
    } catch (err) {
      // Revert on error
      setGroupedTasks(prev => prev.map(week => ({
        ...week,
        tasks: week.tasks.map(task => 
          task.id === taskId ? { ...task, completed: currentTask.completed } : task
        )
      })))
      toast.error(err instanceof Error ? err.message : 'Failed to update task')
    } finally {
      setPendingTaskIds(prev => {
        const next = new Set(prev)
        next.delete(taskId)
        return next
      })
    }
  }


  const toggleExpand = (taskId: string) => {
    setExpandedTasks(prev => {
      const newSet = new Set(prev)
      newSet.has(taskId) ? newSet.delete(taskId) : newSet.add(taskId)
      return newSet
    })
  }
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center p-8 text-destructive">
        Error: {error}
      </div>
    )
  }

  if (groupedTasks.length === 0) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        No tasks found for this plan
      </div>
    )
  }return (
    <div className="space-y-8">
      {groupedTasks.map((weekGroup) => {
        const weekSummary = weekSummaries.find(
          summary => summary.weekNumber === weekGroup.week
        )?.summary
  
        return (
          <Card key={weekGroup.week} className="p-6 bg-background/95 backdrop-blur">
            <div className="space-y-4">
              {/* Week header remains unchanged */}
              <div className="space-y-3 ml-12">
                {weekGroup.tasks.map((task) => (
                  <div
                    key={`${weekGroup.week}-${task.id}`}
                    className="bg-muted/20 rounded-lg overflow-hidden transition-all hover:bg-muted/30"
                  >
                    <div className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        {/* Moved expand/collapse button to left */}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground/80 hover:text-foreground"
                          onClick={() => toggleExpand(task.id)}
                        >
                          {expandedTasks.has(task.id) ? (
                            <ChevronUp className="h-4 w-4 animate-rotate-up" />
                          ) : (
                            <ChevronDown className="h-4 w-4 animate-rotate-down" />
                          )}
                        </Button>
                        <div className="space-y-1">
                          <span className={`text-sm font-medium ${
                            task.completed 
                              ? "text-muted-foreground/60 line-through" 
                              : "text-foreground/80"
                          }`}>
                            Day {task.dayNumber}
                          </span>
                          {task.title && (
                            <p className="text-sm font-semibold text-foreground/90">
                              {task.title}
                            </p>
                          )}
                        </div>
                      </div>
                      {/* Moved checkmark to right with loading state */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="hover:bg-primary/10"
                        onClick={() => toggleTask(task.id)}
                        disabled={pendingTaskIds.has(task.id)}
                      >
                        {pendingTaskIds.has(task.id) ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : task.completed ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500 animate-pop" />
                        ) : (
                          <Circle className="h-5 w-5 text-muted-foreground/80" />
                        )}
                      </Button>
                    </div>
  
                    {expandedTasks.has(task.id) && (
                    <div className="p-4 pt-0">
                      <div className="text-sm font-medium text-foreground/80 border-l-2 border-primary/40 pl-3 space-y-2">
                        {task.description.split('\n').map((line, index) => (
                          <p key={index} className="leading-relaxed">
                            {line.replace(/^\s*-\s*/, '• ')}
                          </p>
                        ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )}