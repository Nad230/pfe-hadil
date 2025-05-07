"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Edit2, Check, X, Plus, Tag, Target, Clock, Sparkles, Briefcase } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface ProjectOverviewProps {
  project: {
    name: string
    description: string
    tags: string[]
    mainGoal: string
    estimatedCompletionDate: string
  }
  onUpdate: (updatedProject: {
    CompletionDate: any
    name: string
    description: string
    tags: string[]
    mainGoal: string
    estimatedCompletionDate: string
  }) => void
}

export function ProjectOverview({ project, onUpdate }: ProjectOverviewProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedProject, setEditedProject] = useState(project)
  const [newTag, setNewTag] = useState("")

  const handleSave = () => {
    onUpdate(editedProject)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditedProject(project)
    setIsEditing(false)
  }

  const handleAddTag = () => {
    if (newTag.trim() && !editedProject.tags.includes(newTag.trim())) {
      setEditedProject({
        ...editedProject,
        tags: [...editedProject.tags, newTag.trim()]
      })
      setNewTag("")
    }
  }

  const handleRemoveTag = (tag: string) => {
    setEditedProject({
      ...editedProject,
      tags: editedProject.tags.filter(t => t !== tag)
    })
  }

  const tagColors = {
    Mobile: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    "UI/UX": "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
    "React Native": "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300",
    Web: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
    Design: "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300",
    Frontend: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
    Backend: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300",
  }

  const getTagColor = (tag: string) => {
    // @ts-ignore
    return tagColors[tag] || "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
  }
  const safeFormatDate = (dateString: string | undefined) => {
    if (!dateString) return "No date set";
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? "Invalid date" : format(date, "PPP");
  };

  return (
    <Card className="relative overflow-hidden border-none shadow-lg">
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
      <CardContent className="pt-8">
        <div className="flex justify-between items-start mb-4">
          <div className="space-y-1 flex-1">
            {isEditing ? (
              <Input
                value={editedProject.name}
                onChange={(e) => setEditedProject({ ...editedProject, name: e.target.value })}
                className="text-2xl font-bold border-2 border-indigo-200 focus:border-indigo-500 focus:ring-indigo-500 dark:border-indigo-800 dark:focus:border-indigo-600"
                placeholder="Project Name"
              />
            ) : (
              <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
                {project.name}
              </h2>
            )}
            
            <div className="flex flex-wrap gap-2 mt-2">
            {(isEditing ? editedProject.tags : project.tags || []).map((tag) => (
                <Badge key={tag} variant="secondary" className={`px-2 py-1 ${getTagColor(tag)}`}>
                  <Tag className="mr-1 h-3 w-3" />
                  {tag}
                  {isEditing && (
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </Badge>
              ))}
              {isEditing && (
                <div className="flex items-center gap-1">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    className="h-8 w-24 border-dashed border-indigo-300 dark:border-indigo-700"
                    placeholder="New tag"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleAddTag()
                      }
                    }}
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleAddTag}
                    className="h-8 w-8 p-0 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:text-indigo-300 dark:hover:bg-indigo-950"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
          
          <div>
            {isEditing ? (
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" onClick={handleCancel} className="flex items-center gap-1 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950">
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSave} className="flex items-center gap-1 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white">
                  <Check className="h-4 w-4" />
                  Save
                </Button>
              </div>
            ) : (
              <Button size="sm" variant="outline" onClick={() => setIsEditing(true)} className="border-indigo-200 hover:border-indigo-300 dark:border-indigo-800 dark:hover:border-indigo-700">
                <Edit2 className="mr-1 h-4 w-4 text-indigo-500" />
                Edit
              </Button>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-indigo-500" />
                Description
              </h3>
              {isEditing ? (
                <Textarea
                  value={editedProject.description}
                  onChange={(e) => setEditedProject({ ...editedProject, description: e.target.value })}
                  className="min-h-[100px] border-2 border-indigo-200 focus:border-indigo-500 focus:ring-indigo-500 dark:border-indigo-800 dark:focus:border-indigo-600"
                  placeholder="Project description"
                />
              ) : (
                <p className="text-sm p-3 bg-slate-50 rounded-lg border border-slate-100 dark:bg-slate-900 dark:border-slate-800">{project.description}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Target className="h-4 w-4 text-emerald-500" />
                Main Goal
              </h3>
              {isEditing ? (
                <Textarea
                  value={editedProject.mainGoal}
                  onChange={(e) => setEditedProject({ ...editedProject, mainGoal: e.target.value })}
                  className="min-h-[80px] border-2 border-indigo-200 focus:border-indigo-500 focus:ring-indigo-500 dark:border-indigo-800 dark:focus:border-indigo-600"
                  placeholder="Main project goal"
                />
              ) : (
                <p className="text-sm p-3 bg-emerald-50 rounded-lg border border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-900/30">{project.mainGoal}</p>
              )}
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-500" />
                Estimated Completion Date
              </h3>
              {isEditing ? (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal border-2 border-indigo-200 focus:border-indigo-500 focus:ring-indigo-500 dark:border-indigo-800 dark:focus:border-indigo-600",
                        !editedProject.estimatedCompletionDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 text-amber-500" />
                      {editedProject.estimatedCompletionDate ? (
                        format(new Date(editedProject.estimatedCompletionDate), "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={editedProject.estimatedCompletionDate ? new Date(editedProject.estimatedCompletionDate) : undefined}
                      onSelect={(date) => 
                        setEditedProject({ 
                          ...editedProject, 
                          estimatedCompletionDate: date ? date.toISOString() : "" 
                        })
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              ) : (
                <div className="flex items-center gap-2 text-sm p-3 bg-amber-50 rounded-lg border border-amber-100 dark:bg-amber-900/20 dark:border-amber-900/30">
  <CalendarIcon className="h-4 w-4 text-amber-500" />
  {safeFormatDate(project.estimatedCompletionDate)}
</div>
              )}
            </div>
            
            <div className="mt-6 p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg shadow-sm border border-indigo-100 dark:from-indigo-950/30 dark:to-purple-950/30 dark:border-indigo-900/30">
              <h3 className="font-medium mb-4 flex items-center gap-2 text-indigo-700 dark:text-indigo-300">
                <Sparkles className="h-5 w-5 text-indigo-500" />
                Project Status
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-indigo-700 dark:text-indigo-300 font-medium">Progress</span>
                  <span className="font-medium text-indigo-700 dark:text-indigo-300">35%</span>
                </div>
                <div className="w-full h-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" style={{ width: "35%" }} />
                </div>
                <div className="flex justify-between text-sm text-indigo-600/70 dark:text-indigo-400/70">
                  <span>Started: {format(new Date("2024-03-01"), "MMM d")}</span>
                  <span>Due: {safeFormatDate(project.estimatedCompletionDate)}</span>
                  </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}