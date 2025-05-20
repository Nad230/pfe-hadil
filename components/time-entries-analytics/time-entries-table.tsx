"use client"

import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { DateRange } from "react-day-picker"
import { formatDecimalHours, formatDuration } from "@/lib/utils/time"

interface TimeEntry {
  id: string
  startTime: string
  endTime: string | null
  duration: number | null
  project: {
    name: string
  }
  task: {
    name: string
  }
  notes: string | null
  status: string
}

interface TimeEntriesTableProps {
  data: TimeEntry[]
  dateRange: DateRange
}

export function TimeEntriesTable({ data, dateRange }: TimeEntriesTableProps) {
  const [search, setSearch] = useState("")

  const filteredData = data.filter(entry => {
    const entryDate = new Date(entry.startTime)
    const matchesDate = (!dateRange.from || entryDate >= dateRange.from) &&
                       (!dateRange.to || entryDate <= dateRange.to)
    
    const searchTerm = search.toLowerCase()
    const matchesSearch = search === "" ||
      entry.project.name.toLowerCase().includes(searchTerm) ||
      entry.task.name.toLowerCase().includes(searchTerm) ||
      entry.notes?.toLowerCase().includes(searchTerm)

    return matchesDate && matchesSearch
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Input
          placeholder="Search entries..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Start Time</TableHead>
              <TableHead>Project</TableHead>
              <TableHead>Task</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  No time entries found
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>{formatDuration(entry.startTime)}</TableCell>
                  <TableCell>{entry.project.name}</TableCell>
                  <TableCell>{entry.task.name}</TableCell>
<TableCell>
  {entry.duration ? 
   formatDecimalHours(entry.duration) : 
   'In Progress'}
</TableCell>                 <TableCell className="capitalize">{entry.status}</TableCell>
                  <TableCell>{entry.notes || '-'}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}