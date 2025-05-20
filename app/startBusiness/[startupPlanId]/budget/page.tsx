"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BudgetOverview } from "@/components/budget/budget-overview"
import { ExpensesList } from "@/components/budget/expenses-list"
import { BudgetChart } from "@/components/budget/budget-chart"

export default function BudgetPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Budget Tracker</h1>
      </div>

      <div className="grid gap-8 md:grid-cols-[2fr,1fr]">
        <div className="space-y-8">
          <BudgetOverview />
          <BudgetChart />
        </div>
        <ExpensesList />
      </div>
    </div>
  )
}