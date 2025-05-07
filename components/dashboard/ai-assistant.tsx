"use client"

import { Card, CardContent } from "@/components/ui/card"
import { motion } from "framer-motion"
import { Sparkles } from "lucide-react"

export function AiAssistant() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.3 }}
    >
      <Card className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-none">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-purple-500/20 p-3">
              <Sparkles className="h-6 w-6 text-purple-500" />
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-lg">
                Great job today! 🎉
              </h3>
              <p className="text-muted-foreground">
                Your morning sales are up 15% compared to last week. The new caramel latte seems to be a hit! Consider promoting it during afternoon hours to boost sales even more.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}