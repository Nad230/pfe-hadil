"use client"

import { Card, CardContent } from "@/components/ui/card"
import { motion } from "framer-motion"
import { DollarSign, TrendingUp, Clock, PiggyBank } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { useTranslation } from "@/components/context/translation-context"

interface DailyStatsProps {
  stats: {
    sales: number
    expenses: number
    hoursWorked: number
    profit: number
  }
}

export function DailyStats({ stats }: DailyStatsProps) {
  const { t } = useTranslation()

  // 🔥 Notice: no `{ }` around t(...) here
  const items = [
    {
      label: t("Today's Sales"),
      value: formatCurrency(stats.sales),
      icon: DollarSign,
      color: "text-green-500",
      bg: "bg-green-500/10",
    },
    {
      label: t("Hours Worked"),
      value: `${stats.hoursWorked}h`,
      icon: Clock,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      label: t("Expenses"),
      value: formatCurrency(stats.expenses),
      icon: TrendingUp,
      color: "text-red-500",
      bg: "bg-red-500/10",
    },
    {
      label: t("Net Profit"),
      value: formatCurrency(stats.profit),
      icon: PiggyBank,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-4">
      {items.map((item, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className={`rounded-full p-3 ${item.bg}`}>
                  <item.icon className={`h-6 w-6 ${item.color}`} />
                </div>
                <div>
                  {/* Here you unwrap the JS value into JSX */}
                  <p className="text-sm text-muted-foreground">{item.label}</p>
                  <p className="text-2xl font-bold">{item.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}
