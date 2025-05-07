"use client"

import { useState } from "react"
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronRight, ChevronDown, GripHorizontal, Clock, CheckCircle, Star } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface Task {
  id: string
  title: string
  duration: string
  status: "completed" | "in-progress" | "not-started"
  points: number
}

interface Chapter {
  id: string
  title: string
  tasks: Task[]
  expanded: boolean
}

export default function ChaptersPage() {
  const [chapters, setChapters] = useState<Chapter[]>([
    {
      id: "chapter-1",
      title: "Introduction to Programming",
      expanded: false,
      tasks: [
        {
          id: "task-1-1",
          title: "Setting Up Your Development Environment",
          duration: "30 mins",
          status: "completed",
          points: 100
        },
        {
          id: "task-1-2",
          title: "Basic Programming Concepts",
          duration: "45 mins",
          status: "in-progress",
          points: 150
        }
      ]
    },
    {
      id: "chapter-2",
      title: "Variables and Data Types",
      expanded: false,
      tasks: [
        {
          id: "task-2-1",
          title: "Understanding Variables",
          duration: "40 mins",
          status: "not-started",
          points: 120
        },
        {
          id: "task-2-2",
          title: "Working with Different Data Types",
          duration: "50 mins",
          status: "not-started",
          points: 180
        }
      ]
    }
  ])

  const handleDragEnd = (result: any) => {
    if (!result.destination) return

    const items = Array.from(chapters)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    setChapters(items)
  }

  const toggleChapter = (chapterId: string) => {
    setChapters(chapters.map(chapter => 
      chapter.id === chapterId 
        ? { ...chapter, expanded: !chapter.expanded }
        : chapter
    ))
  }

  const getStatusColor = (status: Task["status"]) => {
    switch (status) {
      case "completed":
        return "text-green-500"
      case "in-progress":
        return "text-blue-500"
      default:
        return "text-gray-500"
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Course Timeline</h1>
        <Button>Add Chapter</Button>
      </div>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />

        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="chapters">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-4"
              >
                {chapters.map((chapter, index) => (
                  <Draggable
                    key={chapter.id}
                    draggableId={chapter.id}
                    index={index}
                  >
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className="ml-4"
                      >
                        <Card className="p-4">
                          <div className="flex items-center gap-4">
                            <div {...provided.dragHandleProps}>
                              <GripHorizontal className="h-5 w-5 text-gray-500" />
                            </div>
                            <button
                              onClick={() => toggleChapter(chapter.id)}
                              className="flex items-center gap-2 flex-1"
                            >
                              {chapter.expanded ? (
                                <ChevronDown className="h-5 w-5" />
                              ) : (
                                <ChevronRight className="h-5 w-5" />
                              )}
                              <span className="font-semibold">{chapter.title}</span>
                            </button>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock className="h-4 w-4" />
                              <span>
                                {chapter.tasks.reduce((acc, task) => {
                                  const [mins] = task.duration.split(" ")
                                  return acc + parseInt(mins)
                                }, 0)} mins
                              </span>
                            </div>
                          </div>

                          <AnimatePresence>
                            {chapter.expanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="mt-4 pl-11 space-y-3"
                              >
                                {chapter.tasks.map((task) => (
                                  <div
                                    key={task.id}
                                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                                  >
                                    <div className="flex items-center gap-3">
                                      <CheckCircle 
                                        className={`h-5 w-5 ${getStatusColor(task.status)}`}
                                      />
                                      <span>{task.title}</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                        <Clock className="h-4 w-4" />
                                        <span>{task.duration}</span>
                                      </div>
                                      <div className="flex items-center gap-1 text-sm text-yellow-500">
                                        <Star className="h-4 w-4 fill-current" />
                                        <span>{task.points} pts</span>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </Card>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </div>
  )
}