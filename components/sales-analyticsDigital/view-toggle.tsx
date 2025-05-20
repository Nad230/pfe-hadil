"use client"

import { CalendarDays, CalendarRange, Calendar } from "lucide-react"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { cn } from "@/lib/utils"

interface ViewToggleProps {
  value: 'year' | 'month' | 'day'
  onValueChange: (value: 'year' | 'month' | 'day') => void
}

export function ViewToggle({ value, onValueChange }: ViewToggleProps) {
  return (
    <ToggleGroup 
      type="single" 
      value={value} 
      onValueChange={(value: string) => {
        if (value === 'year' || value === 'month' || value === 'day') {
          onValueChange(value)
        }
      }}
      className="bg-muted/50 p-1 rounded-lg"
    >
      <ToggleGroupItem 
        value="year" 
        aria-label="Year view"
        className={cn(
          "px-3 py-1.5 data-[state=on]:bg-background data-[state=on]:shadow-sm",
          "hover:bg-muted/30 transition-colors"
        )}
      >
        <CalendarRange className="h-4 w-4 mr-2" aria-hidden="true" />
        <span>Year</span>
      </ToggleGroupItem>
      
      <ToggleGroupItem 
        value="month" 
        aria-label="Month view"
        className={cn(
          "px-3 py-1.5 data-[state=on]:bg-background data-[state=on]:shadow-sm",
          "hover:bg-muted/30 transition-colors"
        )}
      >
        <Calendar className="h-4 w-4 mr-2" aria-hidden="true" />
        <span>Month</span>
      </ToggleGroupItem>
      
      <ToggleGroupItem 
        value="day" 
        aria-label="Day view"
        className={cn(
          "px-3 py-1.5 data-[state=on]:bg-background data-[state=on]:shadow-sm",
          "hover:bg-muted/30 transition-colors"
        )}
      >
        <CalendarDays className="h-4 w-4 mr-2" aria-hidden="true" />
        <span>Day</span>
      </ToggleGroupItem>
    </ToggleGroup>
  )
}