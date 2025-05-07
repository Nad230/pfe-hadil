"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TransactionsTable } from "@/components/transactions/transactions-table"
import { TransactionFilters } from "@/components/transactions/transaction-filters"
import { AddTransactionDialog } from "@/components/transactions/add-transaction-dialog"
import { EditTransactionDialog } from "@/components/transactions/edit-transaction-dialog"
import { DeleteTransactionDialog } from "@/components/transactions/delete-transaction-dialog"
import { mockTransactions } from "@/lib/mock-data"
import { Transaction, TransactionFilters as ITransactionFilters } from "@/lib/types"
import { toast } from "sonner"
import { motion } from "framer-motion"
import { TrendingUp, TrendingDown, DollarSign, Clock } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

const initialFilters: ITransactionFilters = {
  type: "all",
  category: "all",
  source: "all",
  status: "all",
  business: "all",
  dateRange: {
    from: undefined,
    to: undefined,
  },
}

export default function TransactionsPage() {
  const [filters, setFilters] = useState<ITransactionFilters>(initialFilters)
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  
  const filteredTransactions = transactions.filter((transaction) => {
    if (filters.type !== "all" && transaction.type !== filters.type) return false
    if (filters.category !== "all" && transaction.category.toLowerCase() !== filters.category) return false
    if (filters.source !== "all" && transaction.source.toLowerCase() !== filters.source) return false
    if (filters.status !== "all" && transaction.status !== filters.status) return false
    if (filters.business !== "all" && transaction.business.toLowerCase() !== filters.business.toLowerCase()) return false
    
    if (filters.dateRange.from || filters.dateRange.to) {
      const transactionDate = new Date(transaction.date)
      if (filters.dateRange.from && transactionDate < filters.dateRange.from) return false
      if (filters.dateRange.to && transactionDate > filters.dateRange.to) return false
    }
    
    return true
  })

  const totalRevenue = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  const profit = totalRevenue - totalExpenses
  const profitPercentage = ((profit / totalRevenue) * 100) || 0

  const handleAddTransaction = (transaction: Transaction) => {
    setTransactions((prev) => [transaction, ...prev])
    toast.success("Transaction added successfully")
  }

  const handleEditTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
    setIsEditDialogOpen(true)
  }

  const handleDeleteTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
    setIsDeleteDialogOpen(true)
  }

  const handleUpdateTransaction = (updatedTransaction: Transaction) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === updatedTransaction.id ? updatedTransaction : t))
    )
    toast.success("Transaction updated successfully")
  }

  const handleConfirmDelete = (transaction: Transaction) => {
    setTransactions((prev) => prev.filter((t) => t.id !== transaction.id))
    setIsDeleteDialogOpen(false)
    toast.success("Transaction deleted successfully")
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <motion.h1 
          className="text-4xl font-bold"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Your Business Journey
        </motion.h1>
        <motion.p 
          className="text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          See your progress, celebrate your wins 🏆
        </motion.p>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <motion.div 
                className="text-2xl font-bold text-green-600"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                {formatCurrency(totalRevenue)}
              </motion.div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
              <DollarSign className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <motion.div 
                className="text-2xl font-bold text-red-600"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                {formatCurrency(totalExpenses)}
              </motion.div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
              {profit >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
            </CardHeader>
            <CardContent>
              <motion.div 
                className={`text-2xl font-bold ${
                  profit >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
              >
                {formatCurrency(profit)}
              </motion.div>
              <p className="text-xs text-muted-foreground">
                {profit >= 0 ? "You're growing! 🚀" : "Room for improvement 💪"}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Hours Worked</CardTitle>
              <Clock className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <motion.div 
                className="text-2xl font-bold text-blue-600"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
              >
                156h
              </motion.div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Growth Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Growth Summary</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Weekly Growth</h3>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <span className="text-green-600">+15% in sales compared to last week</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Keep up the momentum! Your strategies are working 🎯
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Monthly Growth</h3>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <span className="text-green-600">+23% in revenue this month</span>
            </div>
            <p className="text-sm text-muted-foreground">
              You're on track for your best month yet! 🌟
            </p>
          </div>
        </CardContent>
      </Card>

      {/* AI Insights */}
      <Card className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-none">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🧠</span>
              <h3 className="text-lg font-semibold">AI Insights</h3>
            </div>
            <div className="space-y-2">
              <p className="text-sm">
                Based on your sales patterns, if you maintain this growth rate, you could see an additional {formatCurrency(profit * 0.2)} in revenue next month! 
              </p>
              <p className="text-sm text-muted-foreground">
                Pro tip: Your peak sales hours are between 2-4 PM. Consider running a happy hour promotion during slower periods.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions */}
      <div className="space-y-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight">Transactions</h2>
            <AddTransactionDialog onTransactionAdd={handleAddTransaction} />
          </div>
          <TransactionFilters 
            filters={filters} 
            onChange={setFilters}
            onReset={() => setFilters(initialFilters)}
          />
        </div>
        
        <Card>
          <CardContent className="pt-6">
            <TransactionsTable 
              transactions={filteredTransactions}
              onEdit={handleEditTransaction}
              onDelete={handleDeleteTransaction}
            />
          </CardContent>
        </Card>
      </div>

      <EditTransactionDialog
        transaction={selectedTransaction}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSubmit={handleUpdateTransaction}
      />

      <DeleteTransactionDialog
        transaction={selectedTransaction}
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
      />
    </div>
  )
}