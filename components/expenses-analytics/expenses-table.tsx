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
import { formatCurrency, formatDate } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

interface Expense {
  id: string
  title: string
  amount: number
  type: string
  repeat: boolean
  repeatType: string | null
  date: string
  createdAt: string
}

interface ExpensesTableProps {
  data: Expense[]
  dateRange: DateRange
}

export function ExpensesTable({ data, dateRange }: ExpensesTableProps) {
  const [search, setSearch] = useState("")

  const filteredData = data.filter(expense => {
    const expenseDate = new Date(expense.date)
    const matchesDate = (!dateRange.from || expenseDate >= dateRange.from) &&
                       (!dateRange.to || expenseDate <= dateRange.to)
    
    const searchTerm = search.toLowerCase()
    const matchesSearch = search === "" ||
      expense.title.toLowerCase().includes(searchTerm) ||
      expense.type.toLowerCase().includes(searchTerm)

    return matchesDate && matchesSearch
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Input
          placeholder="Search by title or type..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Recurring</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24">
                  No expenses found
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell>{formatDate(expense.date)}</TableCell>
                  <TableCell className="font-medium">{expense.title}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{expense.type}</Badge>
                  </TableCell>
                  <TableCell>
                    {expense.repeat ? (
                      <Badge variant="secondary">{expense.repeatType}</Badge>
                    ) : (
                      'One-time'
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(expense.amount)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}