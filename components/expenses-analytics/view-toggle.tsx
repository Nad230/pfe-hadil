"use client"

import { CalendarDays, CalendarRange, Calendar } from "lucide-react"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

interface ViewToggleProps {
  value: 'year' | 'month' | 'day'
  onValueChange: (value: 'year' | 'month' | 'day') => void
}

export function ViewToggle({ value, onValueChange }: ViewToggleProps) {
  return (
    <ToggleGroup type="single" value={value} onValueChange={onValueChange}>
      <ToggleGroupItem value="year" aria-label="Year view">
        <CalendarRange className="h-4 w-4 mr-2" />
        Year
      </ToggleGroupItem>
      <ToggleGroupItem value="month" aria-label="Month view">
        <Calendar className="h-4 w-4 mr-2" />
        Month
      </ToggleGroupItem>
      <ToggleGroupItem value="day" aria-label="Day view">
        <CalendarDays className="h-4 w-4 mr-2" />
        Day
      </ToggleGroupItem>
    </ToggleGroup>
  )
}