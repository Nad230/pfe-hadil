"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { BookOpen, Save, Calendar, ArrowRight, ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import type { Habit } from "@/lib/types/habits"

interface HabitJournalProps {
  habits: Habit[]
  onSaveJournal?: (date: string, content: string) => Promise<void>
  savedEntries?: Record<string, string>
}

export function HabitJournal({ habits, onSaveJournal, savedEntries = {} }: HabitJournalProps) {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0])
  const [journalContent, setJournalContent] = useState<string>(savedEntries[selectedDate] || "")
  const [saving, setSaving] = useState(false)

  // Generate date options for the last 7 days
  const dateOptions = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - i)
    return {
      value: date.toISOString().split("T")[0],
      label:
        i === 0
          ? "Today"
          : i === 1
            ? "Yesterday"
            : date.toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
              }),
    }
  })

  const handleSaveJournal = async () => {
    if (!onSaveJournal) return

    setSaving(true)
    try {
      await onSaveJournal(selectedDate, journalContent)
      toast.success("Journal entry saved", {
        description: "Your reflections have been recorded",
      })
    } catch (error) {
      toast.error("Failed to save journal", {
        description: "Please try again later",
      })
    } finally {
      setSaving(false)
    }
  }

  const navigateDate = (direction: "prev" | "next") => {
    const currentIndex = dateOptions.findIndex((option) => option.value === selectedDate)

    if (direction === "prev" && currentIndex < dateOptions.length - 1) {
      const newDate = dateOptions[currentIndex + 1].value
      setSelectedDate(newDate)
      setJournalContent(savedEntries[newDate] || "")
    } else if (direction === "next" && currentIndex > 0) {
      const newDate = dateOptions[currentIndex - 1].value
      setSelectedDate(newDate)
      setJournalContent(savedEntries[newDate] || "")
    }
  }

  // Get completed habits for the selected date
  const getCompletedHabitsForDate = (date: string) => {
    return habits.filter((habit) => {
      const completions = habit.completions || []
      return completions.some((c) => new Date(c.date).toISOString().split("T")[0] === date && c.completed)
    })
  }

  const completedHabits = getCompletedHabitsForDate(selectedDate)

  // Generate journal prompt based on completed habits
  const generatePrompt = () => {
    if (completedHabits.length === 0) {
      return "Reflect on your day. What challenges did you face with your habits? What will you do differently tomorrow?"
    }

    if (completedHabits.length === habits.length) {
      return "Congratulations on completing all your habits today! What made today successful? How can you maintain this momentum?"
    }

    return `You completed ${completedHabits.length} habits today. What went well? What could be improved? How did these habits impact your entrepreneurial goals?`
  }

  return (
    <Card className="shadow-lg border-none bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <BookOpen className="mr-2 h-5 w-5 text-indigo-500" />
            Habit Journal
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateDate("prev")}
              disabled={dateOptions.findIndex((option) => option.value === selectedDate) >= dateOptions.length - 1}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-md">
              <Calendar className="h-4 w-4 mr-2 text-gray-500" />
              <span className="text-sm">{dateOptions.find((option) => option.value === selectedDate)?.label}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateDate("next")}
              disabled={dateOptions.findIndex((option) => option.value === selectedDate) <= 0}
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {completedHabits.length > 0 ? (
          <div className="mb-4">
            <h3 className="text-sm font-medium mb-2">Completed Habits:</h3>
            <div className="flex flex-wrap gap-2">
              {completedHabits.map((habit) => (
                <motion.div
                  key={habit.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full text-sm"
                >
                  {habit.name}
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
            <p className="text-sm text-amber-700 dark:text-amber-300">
              No habits were completed on this day. Use this journal to reflect on challenges and plan for improvement.
            </p>
          </div>
        )}

        <div className="mb-3 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
          <p className="text-sm text-indigo-700 dark:text-indigo-300 italic">{generatePrompt()}</p>
        </div>

        <Textarea
          className="min-h-[200px] mb-4"
          placeholder="Write your reflections here..."
          value={journalContent}
          onChange={(e) => setJournalContent(e.target.value)}
        />

        <Button className="w-full bg-indigo-600 hover:bg-indigo-700" onClick={handleSaveJournal} disabled={saving}>
          {saving ? (
            <>Saving...</>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" /> Save Journal Entry
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
