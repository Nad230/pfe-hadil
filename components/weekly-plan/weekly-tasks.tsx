"use client"

import { useState } from "react"
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Circle, Clock } from "lucide-react"

const mockTasks = [
  {
    id: "1",
    title: "Research competitors",
    status: "completed",
    day: "Monday"
  },
  {
    id: "2",
    title: "Create business plan draft",
    status: "pending",
    day: "Tuesday"
  },
  {
    id: "3",
    title: "Meet with potential suppliers",
    status: "pending",
    day: "Wednesday"
  }
]

export function WeeklyTasks() {
  const [tasks, setTasks] = useState(mockTasks)

  const handleDragEnd = (result: any) => {
    if (!result.destination) return
    
    const items = Array.from(tasks)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)
    
    setTasks(items)
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="tasks">
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="space-y-4"
          >
            {tasks.map((task, index) => (
              <Draggable key={task.id} draggableId={task.id} index={index}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className="flex items-center justify-between p-4 bg-card border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      {task.status === "completed" ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground" />
                      )}
                      <div>
                        <p className="font-medium">{task.title}</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {task.day}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const updatedTasks = tasks.map(t =>
                          t.id === task.id
                            ? { ...t, status: t.status === "completed" ? "pending" : "completed" }
                            : t
                        )
                        setTasks(updatedTasks)
                      }}
                    >
                      {task.status === "completed" ? "Undo" : "Complete"}
                    </Button>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  )
}