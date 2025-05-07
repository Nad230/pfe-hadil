"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Trophy, Star, Target, Award } from "lucide-react"

interface LeaderboardEntry {
  id: string
  rank: number
  name: string
  avatar: string
  points: number
  progress: number
  achievements: number
  streak: number
}

const mockLeaderboard: LeaderboardEntry[] = [
  {
    id: "1",
    rank: 1,
    name: "Sarah Chen",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    points: 2450,
    progress: 95,
    achievements: 12,
    streak: 15
  },
  {
    id: "2",
    rank: 2,
    name: "Marcus Rodriguez",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    points: 2100,
    progress: 88,
    achievements: 10,
    streak: 12
  },
  {
    id: "3",
    rank: 3,
    name: "Emma Watson",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
    points: 1950,
    progress: 82,
    achievements: 9,
    streak: 8
  }
]

export function CourseLeaderboard() {
  return (
    <div className="grid gap-6 md:grid-cols-[2fr,1fr]">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-6">Top Performers</h2>
        
        <div className="space-y-6">
          {mockLeaderboard.map((entry, index) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`
                p-6 relative overflow-hidden
                ${index === 0 ? 'bg-yellow-50 dark:bg-yellow-900/10' : ''}
              `}>
                {index === 0 && (
                  <div className="absolute top-0 right-0 p-2">
                    <Trophy className="h-6 w-6 text-yellow-500" />
                  </div>
                )}
                
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                    <span className="font-bold text-primary">#{entry.rank}</span>
                  </div>
                  
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={entry.avatar} />
                    <AvatarFallback>{entry.name[0]}</AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="font-semibold">{entry.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {entry.points} points
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-8 text-center">
                    <div>
                      <div className="text-sm font-medium">{entry.progress}%</div>
                      <div className="text-xs text-muted-foreground">Progress</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium">{entry.achievements}</div>
                      <div className="text-xs text-muted-foreground">Achievements</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium">{entry.streak} days</div>
                      <div className="text-xs text-muted-foreground">Streak</div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </Card>

      <div className="space-y-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Your Stats</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center">
                <Trophy className="h-4 w-4 text-yellow-500" />
              </div>
              <div>
                <div className="font-medium">Rank #4</div>
                <div className="text-sm text-muted-foreground">
                  Top 10% of class
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <Star className="h-4 w-4 text-blue-500" />
              </div>
              <div>
                <div className="font-medium">1,850 Points</div>
                <div className="text-sm text-muted-foreground">
                  150 points to next rank
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <Target className="h-4 w-4 text-green-500" />
              </div>
              <div>
                <div className="font-medium">78% Progress</div>
                <div className="text-sm text-muted-foreground">
                  Course completion
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                <Award className="h-4 w-4 text-purple-500" />
              </div>
              <div>
                <div className="font-medium">8 Achievements</div>
                <div className="text-sm text-muted-foreground">
                  2 new this week
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Weekly Challenges</h3>
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-muted">
              <div className="font-medium">Complete 5 Exercises</div>
              <div className="text-sm text-muted-foreground mb-2">
                3/5 completed
              </div>
              <div className="h-2 bg-primary/20 rounded-full overflow-hidden">
                <div className="h-full bg-primary" style={{ width: '60%' }} />
              </div>
            </div>
            
            <div className="p-4 rounded-lg bg-muted">
              <div className="font-medium">Maintain 7-Day Streak</div>
              <div className="text-sm text-muted-foreground mb-2">
                5 days completed
              </div>
              <div className="h-2 bg-primary/20 rounded-full overflow-hidden">
                <div className="h-full bg-primary" style={{ width: '71%' }} />
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}