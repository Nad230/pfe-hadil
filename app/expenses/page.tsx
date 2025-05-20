"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Label } from "@/components/ui/label"
import { CalendarIcon, Lightbulb, Plus, ArrowRight } from "lucide-react"
import { format } from "date-fns"
import { toast } from "sonner"
import { mockCategories } from "@/lib/mock-data"
import Cookies from "js-cookie"
import { useTranslation } from "@/components/context/translation-context"; // ✅ Import Translation Hook

const recurrenceOptions = [
  { value: "one-time", label: "One-Time" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
]
const suggestions = [
  { title: "Milk", amount: 1, expensesType: "personal", recurrence: "daily" },
  { title: "Internet", amount: 50, expensesType: "business", recurrence: "monthly" },
  { title: "Cleaning", amount: 10, expensesType: "personal", recurrence: "weekly" },
]

export default function AddExpensePage() {
  const [title, setTitle] = useState("")
  const [amount, setAmount] = useState("")
  const [category, setCategory] = useState("")
  const [date, setDate] = useState<Date>(new Date())
  const [recurrence, setRecurrence] = useState("one-time")
  const [startDate, setStartDate] = useState<Date>(new Date())
  const [endDate, setEndDate] = useState<Date | undefined>()
  const [notes, setNotes] = useState("")
  const [isRecurring, setIsRecurring] = useState(false)
  const [expensesType, setExpensesType] = useState("")
  const { t } = useTranslation();

const [customExpensesType, setCustomExpensesType] = useState("");

  const handleSuggestionClick = (suggestion: typeof suggestions[0]) => {
    setTitle(suggestion.title)
    setAmount(suggestion.amount.toString())
    setExpensesType(suggestion.expensesType)
    setRecurrence(suggestion.recurrence)
    setIsRecurring(suggestion.recurrence !== "one-time")
    toast.success(`Filled in ${suggestion.title} expense details`)
  }

  const calculateMonthlyTotal = () => {
    const amt = parseFloat(amount) || 0
    switch (recurrence) {
      case "daily":
        return amt * 30
      case "weekly":
        return amt * 4
      case "monthly":
        return amt
      default:
        return amt
    }
  }

 
  
  const handleSubmit = async () => {
    // Validate required fields
    if (!title || !amount || !expensesType || !date) {
      toast.error("Please fill in all required fields");
      return;
    }
  
    // Validate recurring requirements
    if (isRecurring) {
      if (!startDate) {
        toast.error("Please select a start date for recurring expense");
        return;
      }
      if (recurrence === "one-time") {
        toast.error("Please select a valid recurrence pattern");
        return;
      }
    }
  
    // Get token from cookies
    const token = Cookies.get("token");
    if (!token) {
      toast.error("You must be logged in to add an expense");
      return;
    }
  
    // Prepare API request body
    const expenseData: any = {
      title,
      amount: parseFloat(amount),
      type: expensesType === "other" ? customExpensesType : expensesType,
      date: date.toISOString(),
      repeat: isRecurring,
    }
  
    if (isRecurring) {
      expenseData.repeatType = recurrence
      expenseData.startDate  = startDate.toISOString()
      expenseData.endDate    = endDate!.toISOString()
    }
  
    try {
      const response = await fetch('http://localhost:3000/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Cookies.get("token")}`
        },
        body: JSON.stringify(expenseData)
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to add expense')
      }
  
      // Success handling
      toast.success("Expense added successfully!")
      
      // Reset form fields
      setTitle("")
      setAmount("")
      setExpensesType("")
      setNotes("")
      setIsRecurring(false)
      setRecurrence("one-time")
      setDate(new Date())
      setStartDate(new Date())
      setEndDate(undefined)
  
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred while adding the expense'
      toast.error(message)
    }
  }
  
  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">{t("Add Expense")}</h1>
            <p className="text-muted-foreground">
              {t("Track your business costs like a pro")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Lightbulb className="h-5 w-5 text-yellow-500" />
                </Button>
              </PopoverTrigger>
              <PopoverContent>
                {t("You can automate daily/weekly/monthly expenses to save time and ensure consistent tracking.")}
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-[2fr,1fr]">
          {/* Main Form */}
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6 space-y-6">
                <div className="space-y-4">
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">{t("Expense Title")}</Label>
                      <Input
                        id="title"
                        placeholder="e.g., Milk, Coffee Machine, Rent"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                      />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="amount">{t("Amount (in Dinars)")}</Label>
                        <Input
                          id="amount"
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
  <Label>{t("Expense Type")}</Label>
  <Select value={expensesType} onValueChange={setExpensesType}>
    <SelectTrigger>
      <SelectValue placeholder="Select type" />
    </SelectTrigger>
   <SelectContent>
  <SelectItem value="personal">{t("Personal")}</SelectItem>
  <SelectItem value="business">{t("Business")}</SelectItem>
  <SelectItem value="other">{t("Other")}</SelectItem>
</SelectContent>
{expensesType === "other" && (
  <div className="space-y-2 mt-2">
    <Label htmlFor="custom-type">{t("Specify Type")}</Label>
    <Input
      id="custom-type"
      placeholder="e.g., Travel, Donation"
      value={customExpensesType}
      onChange={(e) => setCustomExpensesType(e.target.value)}
    />
  </div>
)}

  </Select>
</div>

                    </div>

                    <div className="space-y-2">
                      <Label>{t("Date")}</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date ? format(date, "PPP") : <span>{t("Pick a date")}</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={date}
                            onSelect={(date) => date && setDate(date)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="recurring">{t("Make it recurring?")}</Label>
                        <Switch
                          id="recurring"
                          checked={isRecurring}
                          onCheckedChange={setIsRecurring}
                        />
                      </div>

                      <AnimatePresence>
                        {isRecurring && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-4"
                          >
                            <div className="space-y-2">
                              <Label>{t("Recurrence Pattern")}</Label>
                              <Select value={recurrence} onValueChange={setRecurrence}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select pattern" />
                                </SelectTrigger>
                                <SelectContent>
                                  {recurrenceOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                      {option.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                              <div className="space-y-2">
                                <Label>{t("Start Date")}</Label>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <Button
                                      variant="outline"
                                      className="w-full justify-start text-left font-normal"
                                    >
                                      <CalendarIcon className="mr-2 h-4 w-4" />
                                      {startDate ? (
                                        format(startDate, "PPP")
                                      ) : (
                                        <span>{t("Pick a date")}</span>
                                      )}
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                      mode="single"
                                      selected={startDate}
                                      onSelect={(date) => date && setStartDate(date)}
                                      initialFocus
                                    />
                                  </PopoverContent>
                                </Popover>
                              </div>

                              <div className="space-y-2">
                                <Label>{t("End Date (Optional)")}</Label>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <Button
                                      variant="outline"
                                      className="w-full justify-start text-left font-normal"
                                    >
                                      <CalendarIcon className="mr-2 h-4 w-4" />
                                      {endDate ? (
                                        format(endDate, "PPP")
                                      ) : (
                                        <span>{t("Pick a date")}</span>
                                      )}
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                      mode="single"
                                      selected={endDate}
                                      onSelect={(date) => setEndDate(date)}
                                      initialFocus
                                    />
                                  </PopoverContent>
                                </Popover>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes">{t("Notes (Optional)")}</Label>
                      <Textarea
                        id="notes"
                        placeholder="Add any additional details about this expense..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button 
              size="lg" 
              className="w-full"
              onClick={handleSubmit}
            >
              <Plus className="mr-2 h-4 w-4" />
              {t("Add Expense")}
            </Button>
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            {/* Quick Suggestions */}
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-4">{t("Quick Add Suggestions")}</h3>
                <div className="space-y-2">
                  {suggestions.map((suggestion, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="w-full justify-between"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      <span>{suggestion.title}</span>
                      <span className="flex items-center text-muted-foreground">
                        {suggestion.amount}d
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Summary */}
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-4">{t("Expense Summary")}</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">{t("Amount:")}</span>
                    <span className="font-mono">{amount ? `${amount}d` : "-"}</span>
                  </div>
                  {isRecurring && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">{t("Monthly Total:")}</span>
                      <span className="font-mono">{calculateMonthlyTotal()}d</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">{t("ExpenseType:")}</span>
                    <span>{expensesType || "-"}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">{t("Recurrence:")}</span>
                    <span className="capitalize">{recurrence}</span>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t">
                  <p className="text-sm text-center text-muted-foreground italic">
                    {t("Every dinar counts 💸")}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>
    </div>
  )
}