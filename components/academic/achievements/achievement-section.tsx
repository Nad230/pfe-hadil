"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Trophy, Star, Award, Medal, TrendingUp } from "lucide-react"
import { useAudio } from "@/components/audio/audio-provider"
import { useState } from "react"
import { cn } from "@/lib/utils"

const achievements = [
  {
    id: "1",
    title: "Perfect Attendance",
    description: "Completed 30 days of consistent learning",
    icon: Trophy,
    color: "text-yellow-500",
    gradient: "from-yellow-500 to-amber-500",
    date: "2024-03-15",
    xp: 1000,
    rarity: "Legendary",
  },
  {
    id: "2",
    title: "Knowledge Seeker",
    description: "Completed 10 courses with distinction",
    icon: Star,
    color: "text-blue-500",
    gradient: "from-blue-500 to-indigo-500",
    date: "2024-03-10",
    xp: 750,
    rarity: "Epic",
  },
  {
    id: "3",
    title: "Top Performer",
    description: "Ranked in top 5% of students",
    icon: Award,
    color: "text-purple-500",
    gradient: "from-purple-500 to-pink-500",
    date: "2024-03-05",
    xp: 500,
    rarity: "Rare",
  },
  {
    id: "4",
    title: "Study Champion",
    description: "Logged over 100 hours of study time",
    icon: Medal,
    color: "text-green-500",
    gradient: "from-green-500 to-emerald-500",
    date: "2024-03-01",
    xp: 250,
    rarity: "Common",
  },
]

const rarityColors = {
  Legendary: "text-yellow-500",
  Epic: "text-purple-500",
  Rare: "text-blue-500",
  Common: "text-gray-500",
}

export function AchievementSection() {
  const { playHover } = useAudio()
  const [selectedAchievement, setSelectedAchievement] = useState<string | null>(null)

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Achievements</h2>
        <div className="flex items-center gap-2 text-sm">
          <TrendingUp className="h-4 w-4 text-green-500" />
          <span className="font-medium">2,500 XP Total</span>
        </div>
      </div>
      
      <div className="grid gap-4">
        <AnimatePresence>
          {achievements.map((achievement, index) => (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                "group relative overflow-hidden rounded-xl p-4 transition-all duration-300",
                selectedAchievement === achievement.id
                  ? "bg-white/10"
                  : "hover:bg-white/5"
              )}
              onMouseEnter={() => {
                playHover()
                setSelectedAchievement(achievement.id)
              }}
              onMouseLeave={() => setSelectedAchievement(null)}
            >
              <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-10 transition-opacity duration-500" />
              
              <div className="relative flex items-center gap-4">
                <motion.div
                  className={`p-3 rounded-xl bg-gradient-to-br ${achievement.gradient} bg-opacity-10`}
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <achievement.icon className={`h-6 w-6 ${achievement.color}`} />
                </motion.div>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{achievement.title}</h3>
                    <span className={`text-xs font-medium ${rarityColors[achievement.rarity as keyof typeof rarityColors]}`}>
                      {achievement.rarity}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {achievement.description}
                  </p>
                </div>

                <div className="text-right">
                  <div className="text-sm font-medium text-muted-foreground">
                    {new Date(achievement.date).toLocaleDateString()}
                  </div>
                  <div className="text-sm font-medium text-yellow-500">
                    +{achievement.xp} XP
                  </div>
                </div>
              </div>

              {selectedAchievement === achievement.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 pt-4 border-t border-white/10"
                >
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Earned</div>
                      <div className="font-medium">
                        {new Date(achievement.date).toLocaleDateString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Rarity</div>
                      <div className={`font-medium ${rarityColors[achievement.rarity as keyof typeof rarityColors]}`}>
                        {achievement.rarity}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">XP Earned</div>
                      <div className="font-medium text-yellow-500">
                        {achievement.xp} XP
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}