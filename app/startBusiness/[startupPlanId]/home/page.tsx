"use client"

import { motion } from "framer-motion"
import { TodayTask } from "@/components/dashboardBusiness/today-task"
import { BudgetPanel } from "@/components/dashboardBusiness/budget-panel"
import { RisksPanel } from "@/components/dashboardBusiness/risks-panel"
import { MotivationalTip } from "@/components/dashboardBusiness/motivational-tip"
import { useParams } from "next/navigation"

export default function Home() {
  const { startupPlanId } = useParams()
  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid gap-8 md:grid-cols-[2fr,1fr]"
      >
        <div className="space-y-8">
          <TodayTask />
          <BudgetPanel />
        </div>
        <div className="space-y-8">
        <RisksPanel startupPlanId={startupPlanId} />
        <MotivationalTip />
        </div>
      </motion.div>
    </div>
  )
}