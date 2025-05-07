"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Play, StopCircle } from "lucide-react"
import { AddWorkerDialog } from "./add-worker-dialog"
import { formatDuration } from "@/lib/utils/time"

interface Worker {
  id: string
  name: string
  role?: string
  avatar?: string
  isWorking: boolean
  startTime?: Date
  duration: number
}

const mockWorkers: Worker[] = [
  {
    id: "1",
    name: "Sarah Chen",
    role: "Barista",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    isWorking: false,
    duration: 0
  },
  {
    id: "2",
    name: "Marcus Kim",
    role: "Server",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    isWorking: false,
    duration: 0
  }
]

export function TeamShift() {
  const [workers, setWorkers] = useState<Worker[]>(mockWorkers)
  const [showAddDialog, setShowAddDialog] = useState(false)

  const handleStartShift = (workerId: string) => {
    setWorkers(prev => prev.map(worker => {
      if (worker.id === workerId) {
        return {
          ...worker,
          isWorking: true,
          startTime: new Date(),
          duration: 0
        }
      }
      return worker
    }))
  }

  const handleStopShift = (workerId: string) => {
    setWorkers(prev => prev.map(worker => {
      if (worker.id === workerId) {
        return {
          ...worker,
          isWorking: false,
          startTime: undefined
        }
      }
      return worker
    }))
  }

  const handleAddWorker = (worker: Omit<Worker, "id" | "isWorking" | "duration">) => {
    const newWorker: Worker = {
      ...worker,
      id: crypto.randomUUID(),
      isWorking: false,
      duration: 0
    }
    setWorkers(prev => [...prev, newWorker])
    setShowAddDialog(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Track Your Team's Shifts</h2>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Worker
        </Button>
      </div>

      <div className="space-y-4">
        <AnimatePresence>
          {workers.map((worker) => (
            <motion.div
              key={worker.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0">
                      {worker.avatar ? (
                        <img
                          src={worker.avatar}
                          alt={worker.name}
                          className="w-12 h-12 rounded-full"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-lg font-semibold">
                            {worker.name[0]}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <h3 className="font-semibold">{worker.name}</h3>
                      {worker.role && (
                        <p className="text-sm text-muted-foreground">
                          {worker.role}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <Badge
                        variant={worker.isWorking ? "default" : "secondary"}
                      >
                        {worker.isWorking ? "Working" : "Not working"}
                      </Badge>

                      {!worker.isWorking ? (
                        <Button
                          variant="outline"
                          className="gap-2"
                          onClick={() => handleStartShift(worker.id)}
                        >
                          <Play className="h-4 w-4" />
                          Start Shift
                        </Button>
                      ) : (
                        <Button
                          variant="destructive"
                          className="gap-2"
                          onClick={() => handleStopShift(worker.id)}
                        >
                          <StopCircle className="h-4 w-4" />
                          Stop Shift
                        </Button>
                      )}
                    </div>
                  </div>

                  {worker.isWorking && worker.startTime && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 pt-4 border-t"
                    >
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Started at {worker.startTime.toLocaleTimeString()}
                        </span>
                        <span>
                          Time worked: {formatDuration(worker.duration)}
                        </span>
                      </div>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>

        {workers.length === 0 && (
          <div className="text-center py-12 bg-muted/50 rounded-lg">
            <p className="text-muted-foreground">
              No workers added yet. Add your first team member!
            </p>
          </div>
        )}
      </div>

      <AddWorkerDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSubmit={handleAddWorker}
      />
    </div>
  )
}