'use client'

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { Coffee, DollarSign, Clock, Sparkles, X } from "lucide-react"
import { useState, useEffect } from "react"
import { formatCurrency } from "@/lib/utils"
import { DailyStats } from "@/components/dashboard/daily-stats"
import { RevenueChart } from "@/components/dashboard/revenue-chart"
import { AiAssistant } from "@/components/dashboard/ai-assistant"
import { mockMonthlyStats } from "@/lib/mock-data"
import { useRouter } from 'next/navigation'
import Cookies from "js-cookie"
import { ActivityOverview } from "@/components/dashboard/activity-overview"
import { AIInsightsReport } from "@/components/dashboard/ai-insights-report"
import { useTranslation } from "@/components/context/translation-context"; // ✅ Import Translation Hook
import { EndOfDayReport } from "@/components/dashboard/end-of-day-report"
function formatStat(value: number, type: 'time' | 'currency') {
  if (type === 'time') {
    const minutes = value * 100; // Convert decimal hours to minutes
    if (minutes >= 60) {
      const hours = minutes / 60;
      return `${hours.toFixed(1)}h`;
    }
    return `${Math.round(minutes)}m`;
  }
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday"
  ];

  
  interface ProjectData {
    projectName: string
    role: string
    location: string
    startHour: number
    endHour: number
  }
  // Currency formatting (Tunisian Dinar)
  const absoluteValue = Math.abs(value);
  const millimes = absoluteValue * 1000; // 1 dinar = 1000 millimes
  const isNegative = value < 0;

  if (millimes >= 1000) {
    const dinars = absoluteValue;
    // Handle decimal formatting with sign
    return `${isNegative ? '-' : ''}${dinars % 1 === 0 ? 
      dinars.toFixed(0) : 
      dinars.toFixed(1)}d`;
  }
  
  // Handle millimes formatting with sign
  return `${isNegative ? '-' : ''}${millimes.toFixed(0)}ml`;
}
export default function Home() {
  const { t } = useTranslation();
const [days] = useState([
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday"
]);
  const router = useRouter()
  const [todaySales, setTodaySales] = useState<number>(0)
  const [todayExpenses, setTodayExpenses] = useState<number>(0)
  const [todayHours, setTodayHours] = useState<number>(0) // New state for hours
  const [loading, setLoading] = useState<boolean>(true)
  const now = new Date()
  const tomorrow = new Date()
  tomorrow.setDate(now.getDate() + 1)
  tomorrow.setHours(0, 0, 0, 0)
  const [showAiInsights, setShowAiInsights] = useState(false)
  const [showEndOfDayReport, setShowEndOfDayReport] = useState(false)
  const [projectData, setProjectData] = useState<ProjectData | null>(null)
  const [profitId, setProfitId] = useState<string | null>(null)

  const activityData = {
    workHours: 8.5 * 3600, // Convert to seconds
    sales: 450.75,
    expenses: 125.30,
    notes: [
      {
        id: '1',
        text: 'Sold 24 Caramel Lattes - Best seller today!',
        time: '2:30 PM',
        type: 'sale'
      },
      {
        id: '2',
        text: 'Restocked coffee beans',
        time: '11:45 AM',
        type: 'expense'
      },
      {
        id: '3',
        text: 'Morning rush handled efficiently',
        time: '9:15 AM',
        type: 'work'
      },
      {
        id: '4',
        text: 'New seasonal menu items performing well',
        time: '3:20 PM',
        type: 'sale'
      }
    ]
  }


  const endOfDayStats = {
    hoursWorked: "8 hours 30 minutes",
    totalSales: 450.75,
    totalExpenses: 125.30,
    netProfit: 325.45,
    bestSeller: {
      name: "Caramel Latte",
      quantity: 24
    },
    performance: {
      percentage: 15,
      trend: "up"
    }
  }


  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        const token = Cookies.get("token")
        if (!token) return

        // Get user sub
        const meResponse = await fetch("http://localhost:3000/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        })
        const meData = await meResponse.json()
        const { sub } = meData

        // Get project data
        const projectResponse = await fetch(`http://localhost:3000/auth/${sub}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const projectData: ProjectData = await projectResponse.json()
        setProjectData(projectData)

        // Check current time against endHour
        const now = new Date()
        const currentHour = now.getHours()
        if (currentHour >= projectData.endHour) {
          setShowEndOfDayReport(true)
        }
      } catch (error) {
        console.error("Error fetching project data:", error)
      }
    }

    fetchProjectData()
  }, [])








  const timeoutDuration = tomorrow.getTime() - now.getTime() - 5000 // 5 seconds before midnight
  useEffect(() => {
    const fetchTodayData = async () => {
      try {
        const token = Cookies.get("token")
        if (!token) {
          console.warn("No token found")
          return
        }

        // Fetch all three endpoints in parallel
        const [salesResponse, expensesResponse, hoursResponse] = await Promise.all([
          fetch('http://localhost:3000/sales/todayTotal', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch('http://localhost:3000/expenses/today', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch('http://localhost:3000/time-entry/todayTotal', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ])

        // Handle responses
        if (!salesResponse.ok) throw new Error('Failed to fetch sales')
        if (!expensesResponse.ok) throw new Error('Failed to fetch expenses')
        if (!hoursResponse.ok) throw new Error('Failed to fetch work hours')

        // Parse all values as numbers
        const [sales, expenses, hours] = await Promise.all([
          salesResponse.text(),
          expensesResponse.text(),
          hoursResponse.text(),
        ])

        setTodaySales(Number(sales))
        console.log("the sales",(Number(sales)))
        setTodayExpenses(Number(expenses))
        setTodayHours(Number(hours))
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchTodayData()
    
  }, [])

  const todayStats = {
    sales: loading ? 0 : todaySales,
    expenses: loading ? 0 : todayExpenses,
    hoursWorked: loading ? 0 : todayHours,
    profit: loading ? 0 : todaySales - todayExpenses,
  }
  useEffect(() => {
  const updateProfit = async () => {
    if (!profitId) return;

    try {
      const token = Cookies.get("token");
      if (!token) return;

      await fetch(`http://localhost:3000/profit/${profitId}/amount`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          sales: todayStats.sales,
          expenses: todayStats.expenses,
          hoursWorked: todayStats.hoursWorked,
          profit: todayStats.profit
        }),
      });
    } catch (err) {
      console.error("Error updating profit:", err);
    }
  };

  updateProfit();
}, [todayStats.sales, todayStats.expenses, todayStats.hoursWorked, profitId]);

  return (
    <div className="space-y-8 max-w-[1200px] mx-auto">
      {/* Greeting & Quick Stats */}
      <div className="text-center space-y-2">
        <motion.h1
          className="text-4xl font-bold"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {t("Good morning")}, Ahmed! ☀️
        </motion.h1>
        <motion.p
          className="text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {t("Here's how your")} coffee shop {t("is doing today")}
        </motion.p>
      </div>
        {/* End of Day Report */}
        {showEndOfDayReport && (
        <EndOfDayReport stats={endOfDayStats} userName="Ahmed" />
      )}

      {/* AI Assistant */}
      <AiAssistant />



      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="fixed right-8 bottom-8 z-50"
      >
        <Button
          size="lg"
          className={`rounded-full w-16 h-16 p-0 transition-all duration-300 shadow-lg hover:shadow-xl ${
            showAiInsights ? 'bg-purple-600 hover:bg-purple-700' : 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600'
          }`}
          onClick={() => setShowAiInsights(!showAiInsights)}
        >
          <Sparkles className="h-8 w-8 text-white" />
        </Button>
      </motion.div>

      {/* AI Insights Panel */}
    {/* AI Insights Panel */}
<motion.div
  initial={false}
  animate={{
    x: showAiInsights ? 0 : '100%',
    opacity: showAiInsights ? 1 : 0,
  }}
  transition={{ type: "spring", damping: 20, stiffness: 200 }}
  className="fixed top-0 right-0 w-full max-w-2xl h-screen bg-background/95 backdrop-blur-sm shadow-2xl z-40"
>
  <div className="relative h-full overflow-auto">
    {/* Close button positioning */}
    <div className="absolute top-6 right-6 z-50"> {/* Changed from top-4 to top-6 */}
      <Button
        variant="ghost"
        size="icon"
        className="rounded-full bg-background/50 backdrop-blur-sm border shadow-sm hover:bg-background/80"
        onClick={() => setShowAiInsights(false)}
      >
        <X className="h-6 w-6" />
      </Button>
    </div>
    
    {/* Content with increased top padding */}
    <div className="p-6 pt-28"> {/* Changed from pt-16 to pt-24 for more space */}
      <AIInsightsReport />
    </div>
  </div>
</motion.div>


      {/* Daily Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <DollarSign className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-sm text-muted-foreground">{t("Sales")}</p>
              <p className="text-2xl font-bold">
                {formatStat(todayStats.sales, 'currency')}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <DollarSign className="h-8 w-8 text-red-600" />
            <div>
              <p className="text-sm text-muted-foreground">{t("Expenses")}</p>
              <p className="text-2xl font-bold">
                {formatStat(todayStats.expenses, 'currency')}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <Clock className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-sm text-muted-foreground">{t("Hours Worked")}</p>
              <p className="text-2xl font-bold">
                {formatStat(todayStats.hoursWorked, 'time')}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <Coffee className="h-8 w-8 text-purple-600" />
            <div>
              <p className="text-sm text-muted-foreground">{t("Profit")}</p>
              <p className="text-2xl font-bold">
                {formatStat(todayStats.profit, 'currency')}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-3 gap-4">
            <Button
              size="lg"
              onClick={() => router.push('/sales')}
              className="h-auto py-8 flex flex-col gap-2 bg-green-500/10 hover:bg-green-500/20 text-green-600"
            >
              <Coffee className="h-8 w-8" />
              <span>{t("New Sale")}</span>
            </Button>
            <Button
              size="lg"
              onClick={() => router.push('/shifts')}
              className="h-auto py-8 flex flex-col gap-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-600"
            >
              <Clock className="h-8 w-8" />
              <span>{t("Start Shift")}</span>
            </Button>
            <Button
              size="lg"
              onClick={() => router.push('/expenses')}
              className="h-auto py-8 flex flex-col gap-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-600"
            >
              <DollarSign className="h-8 w-8" />
              <span>{t("Add Expense")}</span>
            </Button>
          </div>
        </CardContent>
      </Card>
      <ActivityOverview data={activityData} />
      {/* Revenue Chart */}
    </div>
  )
}
