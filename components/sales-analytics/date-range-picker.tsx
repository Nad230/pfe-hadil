"use client"

import { useState, useEffect } from "react"
import { format, startOfDay, endOfDay, startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DateRangePickerProps {
  view: 'year' | 'month' | 'day'
  dateRange: DateRange
  onDateRangeChange: (range: DateRange) => void
  className?: string
}

export function DateRangePicker({
  view,
  dateRange,
  onDateRangeChange,
  className,
}: DateRangePickerProps) {
  const [internalDate, setInternalDate] = useState<Date | undefined>(new Date())

  useEffect(() => {
    if (!dateRange.from) return
    
    // Adjust date to start of period when view changes
    let newDate = dateRange.from
    switch (view) {
      case 'year':
        newDate = startOfYear(newDate)
        break
      case 'month':
        newDate = startOfMonth(newDate)
        break
      case 'day':
        newDate = startOfDay(newDate)
        break
    }
    
    setInternalDate(newDate)
  }, [view])

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return

    let from: Date
    let to: Date
    
    switch (view) {
      case 'year':
        from = startOfYear(date)
        to = endOfYear(date)
        break
      case 'month':
        from = startOfMonth(date)
        to = endOfMonth(date)
        break
      case 'day':
      default:
        from = startOfDay(date)
        to = endOfDay(date)
        break
    }

    onDateRangeChange({ from, to })
    setInternalDate(date)
  }

  const formatDisplayDate = () => {
    if (!dateRange.from) return "Select date"
    
    switch (view) {
      case 'year':
        return format(dateRange.from, "yyyy")
      case 'month':
        return format(dateRange.from, "MMM yyyy")
      case 'day':
        return format(dateRange.from, "MMM dd, yyyy")
      default:
        return "Select date"
    }
  }

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-[240px] justify-start text-left font-normal",
              !dateRange.from && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {formatDisplayDate()}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={internalDate}
            onSelect={handleDateSelect}
            initialFocus
            defaultMonth={dateRange.from}
            numberOfMonths={view === 'year' ? 12 : 1}
            month={view === 'year' ? new Date(dateRange.from?.getFullYear() || new Date().getFullYear(), 0) : undefined}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}