"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useRouter } from 'next/navigation'

const mockExpenses = [
  {
    id: "1",
    description: "Office Equipment",
    amount: 2000,
    date: "2024-03-19",
    category: "Equipment"
  },
  {
    id: "2",
    description: "Facebook Ads",
    amount: 500,
    date: "2024-03-18",
    category: "Marketing"
  },
  {
    id: "3",
    description: "Business License",
    amount: 300,
    date: "2024-03-17",
    category: "Licenses"
  }
]

export function ExpensesList() {
  const [expenses] = useState(mockExpenses)
  const router = useRouter()

  const handleAddExpense = () => {
    router.push('/expenses')
  }
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle>Recent Expenses</CardTitle>
        
        <Button size="sm"   onClick={handleAddExpense}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Expense
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {expenses.map((expense) => (
            <div
              key={expense.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div>
                <p className="font-medium">{expense.description}</p>
                <p className="text-sm text-muted-foreground">{expense.category}</p>
              </div>
              <div className="text-right">
                <p className="font-medium">${expense.amount}</p>
                <p className="text-sm text-muted-foreground">{expense.date}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}