"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import { Brain, TrendingUp, Sparkles } from "lucide-react"

export function AiInsights() {
  const insights = [
    {
      title: "Sales Performance",
      message: "You sold 15% more today than last Friday! Keep up the momentum! 🚀",
      icon: TrendingUp,
      color: "text-green-500"
    },
    {
      title: "Optimization Tip",
      message: "Your peak sales hours are between 2-4 PM. Consider running a happy hour promotion during slower periods.",
      icon: Brain,
      color: "text-blue-500"
    }
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-500" />
          AI Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {insights.map((insight, index) => (
          <motion.div
            key={insight.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.2 }}
            className="relative overflow-hidden rounded-lg border bg-card p-4"
          >
            <div className="flex items-start gap-4">
              <div className={`rounded-full p-2 ${insight.color} bg-primary/10`}>
                <insight.icon className="h-4 w-4" />
              </div>
              <div className="space-y-1">
                <h3 className="font-medium">{insight.title}</h3>
                <p className="text-sm text-muted-foreground">{insight.message}</p>
              </div>
            </div>
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent"
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{
                repeat: Infinity,
                duration: 3,
                ease: "linear",
                delay: index * 1
              }}
            />
          </motion.div>
        ))}
      </CardContent>
    </Card>
  )
}