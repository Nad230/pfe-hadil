"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Award, Flame, Trophy, Medal, Star, TrendingUp, ChevronDown, ChevronUp } from "lucide-react"
import type { Badge as BadgeType } from "@/lib/types/habits"

interface BadgesDisplayProps {
  badges: BadgeType[]
}

export function BadgesDisplay({ badges }: BadgesDisplayProps) {
  const [expanded, setExpanded] = useState(false)

  const getBadgeIcon = (type: string) => {
    switch (type) {
      case "Streak":
        return <Flame className="h-4 w-4 text-orange-500" />
      case "Consistency":
        return <TrendingUp className="h-4 w-4 text-blue-500" />
      case "Achievement":
        return <Trophy className="h-4 w-4 text-amber-500" />
      case "Milestone":
        return <Medal className="h-4 w-4 text-purple-500" />
      default:
        return <Star className="h-4 w-4 text-indigo-500" />
    }
  }

  const getBadgeColor = (type: string) => {
    switch (type) {
      case "Streak":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300"
      case "Consistency":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
      case "Achievement":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
      case "Milestone":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
      default:
        return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300"
    }
  }

  // Trier les badges par date (plus récent en premier)
  const sortedBadges = [...badges].sort((a, b) => new Date(b.earnedAt).getTime() - new Date(a.earnedAt).getTime())

  // Limiter le nombre de badges affichés si non étendu
  const displayedBadges = expanded ? sortedBadges : sortedBadges.slice(0, 3)

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center">
          <Award className="mr-2 h-5 w-5 text-amber-500" />
          Your Achievements
        </CardTitle>
      </CardHeader>
      <CardContent>
        {badges.length > 0 ? (
          <>
            <div className="grid grid-cols-1 gap-3 mb-2">
              {displayedBadges.map((badge, index) => (
                <motion.div
                  key={badge.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="mr-3 p-2 rounded-full bg-white dark:bg-gray-700">{getBadgeIcon(badge.type)}</div>
                    <div className="flex-1">
                      <div className="font-medium">{badge.name}</div>
                      <div className="text-sm text-gray-500">{badge.description}</div>
                    </div>
                    <Badge className={getBadgeColor(badge.type)}>{badge.type}</Badge>
                  </div>
                </motion.div>
              ))}
            </div>

            {badges.length > 3 && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="w-full text-center text-sm text-indigo-600 dark:text-indigo-400 hover:underline flex items-center justify-center mt-2"
              >
                {expanded ? (
                  <>
                    Show less <ChevronUp className="ml-1 h-4 w-4" />
                  </>
                ) : (
                  <>
                    Show all {badges.length} badges <ChevronDown className="ml-1 h-4 w-4" />
                  </>
                )}
              </button>
            )}
          </>
        ) : (
          <div className="text-center py-6">
            <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
              <Award className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium mb-1">No badges yet</h3>
            <p className="text-sm text-gray-500 max-w-xs mx-auto">
              Complete your habits consistently to earn achievement badges.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
