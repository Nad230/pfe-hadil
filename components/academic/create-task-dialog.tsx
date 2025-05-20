


"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command"
import { Calendar, BookOpen, Tag, Check, Flag, X, CheckCircle, AlertCircle } from "lucide-react"
import confetti from 'canvas-confetti'
import Cookies from 'js-cookie'
import { useMascotStore } from '@/lib/stores/mascot-store'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

interface CreateTaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface TaskData {
  title: string
  description: string
  deadline: Date | null
  tags: string[]
  isClosed: boolean
  maxPoints: number
  courseId: string
}

const mockCourses = [
  { id: "phy101", title: "Physics 101 🚀", code: "PHY-101" },
  { id: "math201", title: "Calculus II 📈", code: "MATH-201" },
  { id: "cs301", title: "Algorithms 💻", code: "CS-301" },
]

export function CreateTaskDialog({ open, onOpenChange }: CreateTaskDialogProps) {
  const [step, setStep] = useState(1)
  const { setMood, setIsVisible } = useMascotStore()
  const [taskData, setTaskData] = useState<TaskData>({
    title: "",
    description: "",
    deadline: null,
    tags: [],
    isClosed: false,
    maxPoints: 100,
    courseId: ""
  })
  const [courseSearch, setCourseSearch] = useState("")
  const [tagInput, setTagInput] = useState("")
  const [courses, setCourses] = useState<any[]>([])
  const [coursesLoading, setCoursesLoading] = useState(true)

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = Cookies.get("token")
        const response = await fetch("http://localhost:3000/academic/courses/by-me", {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (!response.ok) throw new Error("Failed to fetch courses")
        const data = await response.json()
        setCourses(data)
      } catch (error) {
        console.error("Error fetching courses:", error)
      } finally {
        setCoursesLoading(false)
      }
    }

    if (open) fetchCourses()
  }, [open])

  const handleNext = () => {
    if (step < 6) {
      setMood('happy', `Moving to step ${step + 1}!`)
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setMood('teaching', `Returning to step ${step - 1}`)
      setStep(step - 1)
    }
  }

  const handleCreateTask = async () => {
    try {
      const token = Cookies.get("token")
      const response = await fetch("http://localhost:3000/academic/acadTask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          ...taskData,
          deadline: taskData.deadline?.toISOString()
        })
      })

      if (!response.ok) throw new Error("Failed to create task")
      
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } })
      setMood('celebrating', 'Task created successfully! 🎉')
      setIsVisible(true)
      onOpenChange(false)
      setStep(1)
      setTaskData({
        title: "",
        description: "",
        deadline: null,
        tags: [],
        isClosed: false,
        maxPoints: 100,
        courseId: ""
      })
    } catch (err) {
      console.error("Error creating task:", err)
      setMood('error', 'Failed to create task 😢')
      setIsVisible(true)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] overflow-visible">
        <div className="relative min-h-[400px]">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Animated background elements remain same */}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="relative"
            >
              {/* Step 1: Title & Description */}
              {step === 1 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                      <Flag className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">Create New Task</h2>
                      <p className="text-muted-foreground">Start by naming your task</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Input
                      placeholder="Task title"
                      value={taskData.title}
                      onChange={(e) => setTaskData(prev => ({ ...prev, title: e.target.value }))}
                      className="text-lg"
                    />
                    <textarea
                      placeholder="Task description"
                      value={taskData.description}
                      onChange={(e) => setTaskData(prev => ({ ...prev, description: e.target.value }))}
                      className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Course Selection */}
              {step === 2 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <BookOpen className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">Select Course</h2>
                      <p className="text-muted-foreground">Choose related course</p>
                    </div>
                  </div>

                  <Command className="rounded-lg border shadow-md">
                    <CommandInput 
                      placeholder="Search courses..." 
                      value={courseSearch}
                      onValueChange={setCourseSearch}
                    />
                    <CommandList>
                      <CommandEmpty>No courses found</CommandEmpty>
                      <CommandGroup heading="Available Courses">
                        {coursesLoading ? (
                          <div className="p-4 text-center">Loading...</div>
                        ) : courses
                          .filter(course => 
                            course.title.toLowerCase().includes(courseSearch.toLowerCase()) ||
                            course.code.toLowerCase().includes(courseSearch.toLowerCase())
                          )
                          .map(course => (
                            <CommandItem
                              key={course.id}
                              onSelect={() => setTaskData(prev => ({
                                ...prev,
                                courseId: course.id
                              }))}
                              className="flex items-center gap-2 p-2"
                            >
                              <BookOpen className="h-4 w-4" />
                              <div>
                                <div className="font-medium">{course.title}</div>
                                <div className="text-sm text-muted-foreground">{course.code}</div>
                              </div>
                              {taskData.courseId === course.id && <Check className="ml-auto h-4 w-4" />}
                            </CommandItem>
                          ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </div>
              )}

              {/* Step 3: Deadline & Points */}
              {step === 3 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center">
                      <Calendar className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">Timeline & Scoring</h2>
                      <p className="text-muted-foreground">Set deadline and maximum points</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Deadline</Label>
                      <DatePicker
                        selected={taskData.deadline}
                        onChange={(date) => setTaskData(prev => ({ ...prev, deadline: date }))}
                        showTimeSelect
                        dateFormat="Pp"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Maximum Points</Label>
                      <Input
                        type="number"
                        value={taskData.maxPoints}
                        onChange={(e) => setTaskData(prev => ({
                          ...prev,
                          maxPoints: Number(e.target.value)
                        }))}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Tags */}
              {step === 4 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                      <Tag className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">Add Tags</h2>
                      <p className="text-muted-foreground">Organize with relevant tags</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add tag..."
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && tagInput.trim()) {
                            setTaskData(prev => ({
                              ...prev,
                              tags: [...prev.tags, tagInput.trim()]
                            }))
                            setTagInput("")
                          }
                        }}
                      />
                      <Button 
                        onClick={() => {
                          if (tagInput.trim()) {
                            setTaskData(prev => ({
                              ...prev,
                              tags: [...prev.tags, tagInput.trim()]
                            }))
                            setTagInput("")
                          }
                        }}
                      >
                        Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {taskData.tags.map(tag => (
                        <div
                          key={tag}
                          className="flex items-center gap-2 px-3 py-1 bg-accent rounded-full"
                        >
                          <span>{tag}</span>
                          <X
                            className="h-4 w-4 cursor-pointer"
                            onClick={() => setTaskData(prev => ({
                              ...prev,
                              tags: prev.tags.filter(t => t !== tag)
                            }))}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 5: Status */}
              {step === 5 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center">
                      <AlertCircle className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">Task Status</h2>
                      <p className="text-muted-foreground">Set task availability</p>
                    </div>
                  </div>

                  <ToggleGroup
                    type="single"
                    value={taskData.isClosed ? "closed" : "open"}
                    onValueChange={(value) => setTaskData(prev => ({
                      ...prev,
                      isClosed: value === "closed"
                    }))}
                    className="grid grid-cols-2 gap-4"
                  >
                    <ToggleGroupItem value="open" className="h-24 flex-col gap-2">
                      <CheckCircle className="h-6 w-6 text-green-500" />
                      <span>Open</span>
                    </ToggleGroupItem>
                    <ToggleGroupItem value="closed" className="h-24 flex-col gap-2">
                      <X className="h-6 w-6 text-red-500" />
                      <span>Closed</span>
                    </ToggleGroupItem>
                  </ToggleGroup>
                </div>
              )}

              {/* Step 6: Review */}
              {step === 6 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                      <CheckCircle className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">Review Task</h2>
                      <p className="text-muted-foreground">Confirm task details</p>
                    </div>
                  </div>

                  <div className="space-y-4 p-4 rounded-lg bg-accent">
                    <div className="space-y-1">
                      <h3 className="text-xl font-bold">{taskData.title}</h3>
                      <p className="text-muted-foreground">{taskData.description}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {taskData.deadline?.toLocaleDateString() || "No deadline"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Flag className="h-4 w-4" />
                        <span>Max points: {taskData.maxPoints}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        <span>
                          {courses.find(c => c.id === taskData.courseId)?.title || "No course selected"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4" />
                        <span>
                          {taskData.tags.join(", ") || "No tags"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="absolute bottom-0 left-0 right-0 flex justify-between pt-4">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={step === 1}
            >
              Back
            </Button>
            <Button
              onClick={step === 6 ? handleCreateTask : handleNext}
              disabled={
                (step === 1 && !taskData.title.trim()) ||
                (step === 2 && !taskData.courseId)
              }
              className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white"
            >
              {step === 6 ? 'Create Task 🚀' : 'Next'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}