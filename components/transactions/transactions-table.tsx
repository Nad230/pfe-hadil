"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatCurrency } from "@/lib/utils"
import { TransactionStatusBadge } from "./transaction-status"
import { TransactionActions } from "./transaction-actions"
import { useEffect, useState } from "react"
import Cookies from "js-cookie"

export interface Expense {
  id: string;
  title: string;
  amount: number;
  type: "business" | "personal";
  repeat: boolean;
  repeatType: "daily" | "weekly" | "monthly" | null;
  date: string;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
}

interface TransactionsTableProps {
  onEdit: (transaction: Expense) => void
  onDelete: (transaction: Expense) => void
}

export function TransactionsTable({ onEdit, onDelete }: TransactionsTableProps) {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchExpenses = async () => {
      const token = Cookies.get("token")
      try {
        const response = await fetch('http://localhost:3000/expenses', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        
        if (!response.ok) throw new Error('Failed to fetch expenses')
        const data = await response.json()
        setExpenses(data)
      } catch (error) {
        console.error("Error fetching expenses:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchExpenses()
  }, [])

  const getStatus = (expense: Expense) => {
    if (expense.repeat) return 'recurring'
    return 'completed'
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="relative overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Recurrence</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center">
                Loading...
              </TableCell>
            </TableRow>
          ) : expenses.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground">
                No expenses found
              </TableCell>
            </TableRow>
          ) : (
            expenses.map((expense) => (
              <TableRow key={expense.id}>
                <TableCell>{formatDate(expense.date)}</TableCell>
                <TableCell className="capitalize">{expense.type}</TableCell>
                <TableCell>{expense.title}</TableCell>
                <TableCell>
                  {expense.repeat
                    ? `${expense.repeatType}${expense.endDate ? ` until ${formatDate(expense.endDate)}` : ''}`
                    : 'One-time'}
                </TableCell>
                <TableCell>
                  <TransactionStatusBadge status={getStatus(expense)} />
                </TableCell>
                <TableCell className="text-right text-red-600 dark:text-red-400">
                  -{formatCurrency(expense.amount)}
                </TableCell>
                <TableCell>
                  <TransactionActions
                    transaction={expense}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}