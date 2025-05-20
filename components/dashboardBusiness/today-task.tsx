"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Store, Loader2 } from "lucide-react"
import { motion } from "framer-motion"
import { toast } from "sonner"
import confetti from "canvas-confetti"
import { useEffect, useState } from "react"
import Cookies from "js-cookie"
import { useParams } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton"

interface Task {
  id: string
  title: string | null
  description: string
}

export function TodayTask() {
  const { startupPlanId } = useParams()
  const [task, setTask] = useState<Task | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCompleting, setIsCompleting] = useState(false)

  const cleanText = (text: string) => {
    return text
      .replace(/[\r\n]+/g, ' ')
      .replace(/[*\-]+/g, '')
      .replace(/\s+/g, ' ')
      .trim()
  }

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const token = Cookies.get("token")
        const response = await fetch(
          `http://localhost:3000/business-plan/startup/${startupPlanId}/todaytask`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        )

        if (!response.ok) throw new Error('Failed to fetch today\'s task')
        const data = await response.json()
        setTask(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load task')
      } finally {
        setLoading(false)
      }
    }

    fetchTask()
  }, [startupPlanId])

  const handleComplete = async () => {
    if (!task) return
    
    try {
      setIsCompleting(true)
      const token = Cookies.get("token")
      const response = await fetch(
        `http://localhost:3000/business-plan/startup/updateTask/${task.id}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ completed: true })
        }
      )

      if (!response.ok) throw new Error('Failed to update task')
      
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      })
      toast.success("Great job! Task completed! 🎉")
      setTask(null) // Remove completed task from view
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to complete task')
    } finally {
      setIsCompleting(false)
    }
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-4 text-destructive">
          Error: {error}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Today's Task
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {loading ? (
          <div className="flex items-start gap-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-6 w-[200px]" />
              <Skeleton className="h-4 w-[300px]" />
              <Skeleton className="h-4 w-[250px]" />
            </div>
          </div>
        ) : task ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-4"
          >
            <div className="rounded-full p-3 bg-blue-500/10 text-blue-500">
              <Store className="h-6 w-6" />
            </div>
            <div className="space-y-2 flex-1">
              {task.title && (
                <h3 className="text-xl font-semibold">
                  {cleanText(task.title)}
                </h3>
              )}
              <div className="text-muted-foreground">
                {task.description.split('\n').map((line, index) => (
                  <p key={index} className="mb-2">
                    {line.startsWith('-') ? '• ' + line.slice(1) : line}
                  </p>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          <p className="text-muted-foreground text-center py-4">
            No tasks for today - enjoy your day! 🌟
          </p>
        )}

        {task && (
          <Button 
            onClick={handleComplete}
            className="w-full bg-green-500 hover:bg-green-600"
            disabled={isCompleting}
          >
            {isCompleting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="mr-2 h-4 w-4" />
            )}
            Mark as Complete
          </Button>
        )}
      </CardContent>
    </Card>
  )
}