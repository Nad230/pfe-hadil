"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar, PiggyBank, Map, Settings } from "lucide-react"
import { useParams } from "next/navigation"

export function HomeNavigation() {
  const { startupPlanId } = useParams()

  const navigation = [
    { 
      name: "Weekly Plan", 
      href: `/startBusiness/${startupPlanId}/weekly-plan`, 
      icon: Calendar 
    },
    { 
      name: "Budget", 
      href: `/startBusiness/${startupPlanId}/budget`, 
      icon: PiggyBank 
    },
    { 
      name: "Full Plan", 
      href: `/startBusiness/${startupPlanId}/full-plan`, 
      icon: Map 
    },
    { 
      name: "Settings", 
      href: `/startBusiness/${startupPlanId}/settings`, 
      icon: Settings 
    },
  ]

  return (
    <Card>
      <CardContent className="pt-6">
        <motion.div className="space-y-2">
          {navigation.map((item, index) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                href={item.href}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors"
              >
                <item.icon className="h-5 w-5 text-muted-foreground" />
                <span>{item.name}</span>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </CardContent>
    </Card>
  )
}