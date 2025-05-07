"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Calendar } from "lucide-react"
import type { Habit } from "@/lib/types/habits"

interface WeeklyHeatmapProps {
  habits: Habit[]
  weeks?: number
}

interface DayData {
  date: Date
  count: number
  intensity: number
  habits: { name: string; completed: boolean }[]
}

export function WeeklyHeatmap({ habits, weeks = 12 }: WeeklyHeatmapProps) {
  const [heatmapData, setHeatmapData] = useState<DayData[][]>([])

  useEffect(() => {
    if (!habits || habits.length === 0) {
      setHeatmapData([])
      return
    }

    const data = generateHeatmapData(habits, weeks)
    setHeatmapData(data)
  }, [habits, weeks])

  const generateHeatmapData = (habits: Habit[], weeks: number): DayData[][] => {
    // Créer un tableau pour stocker les données de chaque jour
    const days: DayData[] = []

    // Calculer la date de début (nombre de semaines dans le passé)
    const today = new Date()
    const startDate = new Date()
    startDate.setDate(today.getDate() - weeks * 7)

    // Créer un objet pour chaque jour
    for (let i = 0; i < weeks * 7; i++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i)

      days.push({
        date: new Date(date),
        count: 0,
        intensity: 0,
        habits: [],
      })
    }

    // Remplir les données avec les complétions d'habitudes
    habits.forEach((habit) => {
      const completions = habit.completions || []

      completions.forEach((completion) => {
        const completionDate = new Date(completion.date)
        completionDate.setHours(0, 0, 0, 0)

        const dayIndex = days.findIndex((day) => {
          const d = new Date(day.date)
          d.setHours(0, 0, 0, 0)
          return d.getTime() === completionDate.getTime()
        })

        if (dayIndex >= 0) {
          if (completion.completed) {
            days[dayIndex].count++
          }

          days[dayIndex].habits.push({
            name: habit.name,
            completed: completion.completed,
          })
        }
      })
    })

    // Calculer l'intensité (0-4) pour chaque jour
    const maxCount = Math.max(...days.map((day) => day.count), 1)
    days.forEach((day) => {
      day.intensity = Math.min(4, Math.floor((day.count / maxCount) * 5))
    })

    // Organiser les jours en semaines
    const weeksData: DayData[][] = []
    for (let i = 0; i < weeks; i++) {
      weeksData.push(days.slice(i * 7, (i + 1) * 7))
    }

    return weeksData
  }

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getIntensityClass = (intensity: number): string => {
    switch (intensity) {
      case 0:
        return "bg-gray-100 dark:bg-gray-800"
      case 1:
        return "bg-green-100 dark:bg-green-900/30"
      case 2:
        return "bg-green-200 dark:bg-green-800/40"
      case 3:
        return "bg-green-300 dark:bg-green-700/50"
      case 4:
        return "bg-green-500 dark:bg-green-600"
      default:
        return "bg-gray-100 dark:bg-gray-800"
    }
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center">
          <Calendar className="mr-2 h-5 w-5 text-indigo-500" />
          Habit Heatmap
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex mb-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, i) => (
            <div key={day} className="flex-1 text-center text-xs text-gray-500">
              {day}
            </div>
          ))}
        </div>

        <div className="space-y-1">
          {heatmapData.map((week, weekIndex) => (
            <div key={weekIndex} className="flex">
              {week.map((day, dayIndex) => (
                <TooltipProvider key={dayIndex}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex-1 aspect-square m-0.5">
                        <div className={`w-full h-full rounded-sm ${getIntensityClass(day.intensity)}`}></div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="text-sm font-medium">{formatDate(day.date)}</div>
                      <div className="text-xs text-gray-500 mb-1">
                        {day.count} {day.count === 1 ? "completion" : "completions"}
                      </div>
                      {day.habits.length > 0 ? (
                        <div className="space-y-1 max-w-[200px]">
                          {day.habits.map((habit, i) => (
                            <div key={i} className="flex items-center text-xs">
                              <div
                                className={`w-2 h-2 rounded-full mr-1 ${habit.completed ? "bg-green-500" : "bg-red-500"}`}
                              ></div>
                              <span className="truncate">{habit.name}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-xs text-gray-500">No habits tracked</div>
                      )}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          ))}
        </div>

        <div className="flex items-center justify-end mt-4">
          <div className="text-xs text-gray-500 mr-2">Less</div>
          {[0, 1, 2, 3, 4].map((intensity) => (
            <div key={intensity} className={`w-3 h-3 rounded-sm mx-0.5 ${getIntensityClass(intensity)}`}></div>
          ))}
          <div className="text-xs text-gray-500 ml-2">More</div>
        </div>
      </CardContent>
    </Card>
  )
}
