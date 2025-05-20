"use client"

import { useRouter } from "next/navigation"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TransactionsTable } from "@/components/transactions/transactions-table"
import { TransactionFilters } from "@/components/transactions/transaction-filters"
import { AddTransactionDialog } from "@/components/transactions/add-transaction-dialog"
import { EditTransactionDialog } from "@/components/transactions/edit-transaction-dialog"
import { DeleteTransactionDialog } from "@/components/transactions/delete-transaction-dialog"
import { Transaction, TransactionFilters as ITransactionFilters } from "@/lib/types"
import { toast } from "sonner"
import { TrendingUp, TrendingDown, DollarSign, Clock, Watch, ArrowUp, ArrowDown } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { RevenueChart } from "@/components/dashboard/revenue-chart"
import { AiInsights } from "@/components/dashboard/ai-insights"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import Cookies from "js-cookie"

interface FinancialStats {
  sales: {
    today: number
    month: number
    year: number
    allTime: number
  }
  profit: {
    today: number
    month: number
    year: number
    allTime: number
  }
  expense: {
    today: number
    month: number
    year: number
    allTime: number
  }
  timeStats?: {
    daily: number
    weekly: number
    monthly: number
    yearly: number
  }
}

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
interface TimeEntryStats {
  today: number;
  weekly: number;
  monthly: number;
  projectsTracked: number;
}


export default function TransactionsPage() {
  const [filters, setFilters] = useState<ITransactionFilters>(initialFilters)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedCard, setSelectedCard] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeStats, setTimeStats] = useState<TimeEntryStats | null>(null) // New state for time stats
  const [error, setError] = useState("")
  // Fix hook order at top of component
  const [projectType, setProjectType] = useState<"offline" | "online" | null>(null);
  const [loadingProjectType, setLoadingProjectType] = useState(false);
  const [stats, setStats] = useState<FinancialStats | null>(null);
  const router = useRouter()

 const fetchData = async () => {
  try {
    const token = Cookies.get("token");
    if (!token) {
      toast.error("Authentication required");
      return;
    }

    // Determine API endpoint based on project type
    const endpoint = projectType === "online" 
      ? "sale-digital/Allstats" 
      : "sales/Allstats";
    
    const response = await fetch(`http://localhost:3000/${endpoint}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();

    // Normalize data structure for both project types
    const normalizedData = projectType === "online"
      ? {
          sales: data.salesDigital,
          profit: data.profit,
          expense: data.expense
        }
      : data;

    setStats(normalizedData);
    setError("");
  } catch (err) {
    console.error("Fetch error:", err);
    setError("Failed to load financial data. Retrying...");
    setTimeout(fetchData, 5000);
  } finally {
    setLoading(false);
  }
};

  const fetchTimeStats = async () => {
    try {
      const token = Cookies.get("token")
      if (!token) {
        toast.error("Authentication required")
        return
      }

      const response = await fetch("http://localhost:3000/time-entry/stats", {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
      const data: TimeEntryStats = await response.json()
    console.log(data)
      setTimeStats(data)
    } catch (err) {
      console.error("Error fetching time stats:", err)
      toast.error("Failed to load time statistics")
    }
  }

 useEffect(() => {
  fetchTimeStats();
}, []);

useEffect(() => {
  if (projectType !== null) {
    fetchData();
  }
}, [projectType]);

  // Calculate derived values from stats
  const incomeChange = stats ? ((stats.sales.month - stats.sales.today) / stats.sales.today) * 100 || 0 : 0
  const expenseChange = stats ? ((stats.expense.month - stats.expense.today) / stats.expense.today) * 100 || 0 : 0
  const netProfit = stats?.profit.today || 0
  const marginPercentage = stats ? ((netProfit / stats.sales.today) * 100) || 0 : 0
  const totalIncome = stats?.sales.month || 0
  const totalExpenses = stats?.expense.month || 0
 

  // Transaction filtering and calculations
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



  useEffect(() => {
  const fetchProjectType = async () => {
    try {
      setLoadingProjectType(true);
      const token = Cookies.get("token");
      if (!token) {
        toast.error("Authentication required");
        return;
      }

      // First get user's sub
      const meResponse = await fetch("http://localhost:3000/auth/me", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!meResponse.ok) throw new Error("Failed to fetch user data");
      const { sub } = await meResponse.json();

      // Then get subscription details
      const subResponse = await fetch(`http://localhost:3000/auth/${sub}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!subResponse.ok) throw new Error("Failed to fetch subscription data");
      const { projectType } = await subResponse.json();

      setProjectType(projectType);
    } catch (error) {
      console.error("Error fetching project type:", error);
      toast.error("Failed to load project settings");
    } finally {
      setLoadingProjectType(false);
    }
  };

  fetchProjectType();
}, []);
  const getDailyData = (transactions: Transaction[]) => {
    const dailyData: Record<string, number> = {}
    transactions.forEach(t => {
      const date = new Date(t.date).toISOString().split('T')[0]
      dailyData[date] = (dailyData[date] || 0) + (t.type === 'income' ? t.amount : -t.amount)
    })
    return Object.entries(dailyData).map(([date, value]) => ({ date, value }))
  }

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

  if (loading || loadingProjectType) {
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
    </div>
  );
}

  if (!stats) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
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

<motion.div
  initial={{ opacity: 0, y: -20 }}
  animate={{ opacity: 1, y: 0 }}
  className="grid gap-4 md:grid-cols-4"
>
  {/* Total Income Card */}
<Card onClick={() => {
  if (loadingProjectType) {
    toast.info("Loading project settings...");
    return;
  }
  
  if (!projectType) {
    toast.error("Project type not available");
    return;
  }

  router.push(projectType === "offline" 
    ? "/sales-analytics" 
    : "/sales-analyticsDigital");
}}>    <CardContent className="pt-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Monthly Income</p>
          <p className="text-2xl font-bold text-green-600">
            {formatCurrency(stats?.sales?.month || 0)}
          </p>
          <div className="flex items-center gap-1 text-sm">
            {stats?.sales?.month > stats?.sales?.today ? (
              <ArrowUp className="h-4 w-4 text-green-500" />
            ) : (
              <ArrowDown className="h-4 w-4 text-red-500" />
            )}
            <span className={stats?.sales?.month > stats?.sales?.today ? "text-green-500" : "text-red-500"}>
              {Math.abs(stats?.sales?.month - stats?.sales?.today || 0).toFixed(2)}%
            </span>
          </div>
        </div>
        <div className="p-3 bg-green-100 rounded-full">
          <TrendingUp className="h-5 w-5 text-green-600" />
        </div>
      </div>
    </CardContent>
  </Card>

  {/* Total Expenses Card */}
<Card onClick={() => router.push("/expenses-analytics")}>
    <CardContent className="pt-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Monthly Expenses</p>
          <p className="text-2xl font-bold text-red-600">
            {formatCurrency(stats?.expense?.month || 0)}
          </p>
          <div className="flex items-center gap-1 text-sm">
            {stats?.expense?.month > stats?.expense?.today ? (
              <ArrowUp className="h-4 w-4 text-red-500" />
            ) : (
              <ArrowDown className="h-4 w-4 text-green-500" />
            )}
            <span className={stats?.expense?.month > stats?.expense?.today ? "text-red-500" : "text-green-500"}>
              {Math.abs(stats?.expense?.month - stats?.expense?.today || 0).toFixed(2)}%
            </span>
          </div>
        </div>
        <div className="p-3 bg-red-100 rounded-full">
          <TrendingDown className="h-5 w-5 text-red-600" />
        </div>
      </div>
    </CardContent>
  </Card>

  {/* Net Profit Card */}
<Card onClick={() => router.push("/profit-analytics")}>
    <CardContent className="pt-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Monthly Profit</p>
          <p className={`text-2xl font-bold ${(stats?.profit?.month || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(stats?.profit?.month || 0)}
          </p>
          <div className="flex items-center gap-1 text-sm">
            <span className="text-muted-foreground">
              Margin: {((stats?.profit?.month / stats?.sales?.month) * 100 || 0).toFixed(1)}%
            </span>
          </div>
        </div>
        <div className={`p-3 ${(stats?.profit?.month || 0) >= 0 ? 'bg-green-100' : 'bg-red-100'} rounded-full`}>
          <DollarSign className={`h-5 w-5 ${(stats?.profit?.month || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`} />
        </div>
      </div>
    </CardContent>
  </Card>

  {/* Active Hours Card */}
  <Card onClick={() => router.push("/time-entries-analytics")}>
    <CardContent className="pt-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Monthly Hours</p>
          <p className="text-2xl font-bold text-purple-600">
{timeStats?.monthly !== undefined ? `${Math.round(timeStats.monthly)}h` : 'N/A'}
          </p>
          <div className="flex items-center gap-1 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              Daily: {timeStats?.today !== undefined ? `${Math.round(timeStats.today)}h` : 'N/A'}
            </span>
          </div>
        </div>
        <div className="p-3 bg-purple-100 rounded-full">
          <Watch className="h-5 w-5 text-purple-600" />
        </div>
      </div>
    </CardContent>
  </Card>
</motion.div>
      {/* Detailed Card Views */}
      <AnimatePresence>
        {selectedCard && (
          <Dialog open={!!selectedCard} onOpenChange={() => setSelectedCard(null)}>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>
                  {selectedCard === 'income' && 'Income Analysis'}
                  {selectedCard === 'expenses' && 'Expense Analysis'}
                  {selectedCard === 'profit' && 'Profit Analysis'}
                  {selectedCard === 'deductions' && 'Deductions Analysis'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                {/* Daily Trend Chart */}
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={getDailyData(filteredTransactions)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis tickFormatter={(value) => formatCurrency(value)} />
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#2dd4bf" 
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Period Comparisons */}
                <div className="grid grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <h3 className="font-semibold mb-2">Today</h3>
                      <p className="text-2xl font-bold">
                        {formatCurrency(getDailyData(filteredTransactions).slice(-1)[0]?.value || 0)}
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <h3 className="font-semibold mb-2">This Month</h3>
                      <p className="text-2xl font-bold">
                        {formatCurrency(selectedCard === 'income' ? incomeChange.current : 
                          selectedCard === 'expenses' ? expenseChange.current : netProfit)}
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <h3 className="font-semibold mb-2">Last Month</h3>
                      <p className="text-2xl font-bold">
                        {formatCurrency(selectedCard === 'income' ? incomeChange.previous :
                          selectedCard === 'expenses' ? expenseChange.previous : 
                          incomeChange.previous - expenseChange.previous)}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* What-If Analysis */}
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="font-semibold mb-4">What-If Analysis</h3>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        If you increase prices by 10%:
                        {formatCurrency(totalIncome * 1.1)} potential monthly income
                      </p>
                      <p className="text-sm text-muted-foreground">
                        If you reduce expenses by 10%:
                        {formatCurrency(totalExpenses * 0.9)} potential monthly expenses
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>

      {/* Charts and Insights */}
      <div className="grid gap-6 md:grid-cols-[2fr,1fr]">
        <RevenueChart data={[{
          month: new Date().toISOString(),
          totalIncome: stats.sales.month,
          netIncome: stats.profit.month
        }]} />
        <AiInsights />
      </div>

      {/* Filters and Table */}
      <div className="space-y-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
            <AddTransactionDialog onTransactionAdd={handleAddTransaction} />
          </div>
          <TransactionFilters 
            filters={filters} 
            onChange={setFilters}
            onReset={() => setFilters(initialFilters)}
          />
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>All Transactions</CardTitle>
          </CardHeader>
          <CardContent>
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