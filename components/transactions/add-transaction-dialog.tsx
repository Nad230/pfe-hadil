"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Plus, ArrowDown, ArrowUp } from "lucide-react"
import { TransactionForm } from "./transaction-form"
import { Transaction } from "@/lib/types"

interface AddTransactionDialogProps {
  onTransactionAdd: (transaction: Transaction) => void
}

export function AddTransactionDialog({ onTransactionAdd }: AddTransactionDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState("select-type") // "select-type", "expenses", "income"
  const [transactionType, setTransactionType] = useState<"expense" | "income" | null>(null)

  const handleSubmit = (transaction: Transaction) => {
    onTransactionAdd({
      ...transaction,
      type: transactionType || "expense"
    })
    resetAndClose() // This will close the dialog
  }

  const resetAndClose = () => {
    setStep("select-type")
    setTransactionType(null)
    setOpen(false)
  }

  const handleTypeSelect = (type: "expense" | "income") => {
    if (type === "expense") {
      // Push to expenses page for expense type
      router.push("/expenses")
      setOpen(false)
    } else {
      // Open income form in dialog for income type
      setTransactionType(type)
      setStep("income")
    }
  }

  const goBack = () => {
    setStep("select-type")
    setTransactionType(null)
  }

  const renderDialogContent = () => {
    switch (step) {
      case "select-type":
        return (
          <>
            <DialogHeader>
              <DialogTitle>Add New Transaction</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4 py-4">
              <Button 
                className="flex justify-between items-center"
                variant="outline" 
                onClick={() => handleTypeSelect("expense")}
              >
                <div className="flex items-center">
                  <ArrowUp className="mr-2 h-4 w-4 text-red-500" />
                  <span>Add New Expense</span>
                </div>
              </Button>
             
            </div>
          </>
        )
      case "expenses":
        return (
          <>
            <DialogHeader>
              <DialogTitle>Add New Expense</DialogTitle>
            </DialogHeader>
            <TransactionForm 
              onSubmit={handleSubmit} 
              transactionType="expense" 
              onCancel={goBack}
            />
          </>
        )
      case "income":
        return (
          <>
            <DialogHeader>
              <DialogTitle>Add New Income</DialogTitle>
            </DialogHeader>
            <TransactionForm 
              onSubmit={handleSubmit} 
              transactionType="income" 
              onCancel={goBack}
            />
          </>
        )
      default:
        return null
    }
  }

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      if (!newOpen) {
        resetAndClose()
      } else {
        setOpen(true)
      }
    }}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Transaction
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        {renderDialogContent()}
      </DialogContent>
    </Dialog>
  )
}