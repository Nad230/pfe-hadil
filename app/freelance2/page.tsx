"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { motion } from "framer-motion"
import { 
  Briefcase, 
  Clock, 
  DollarSign, 
  Mail, 
  MessageSquare, 
  Send, 
  Sparkles, 
  Target, 
  TrendingUp 
} from "lucide-react"
import { useState } from "react"

// Mock data - replace with real data from your backend
const mockUser = {
  hasWork: false,
  stats: {
    jobsFound: 15,
    proposalsSent: 8,
    interviews: 3,
    offers: 1,
    todayEarnings: 150,
    monthlyEarnings: 2500,
    expenses: 300,
    monthlyGoal: 3000
  }
}

export default function FreelanceDashboard() {
  const [user] = useState(mockUser)
  const progress = (user.stats.monthlyEarnings / user.stats.monthlyGoal) * 100

  if (user.hasWork) {
    return (
      <div className="space-y-8">
        {/* Today's Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid gap-4 md:grid-cols-4"
        >
          <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-blue-500/20 p-3">
                  <Clock className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Time Today</p>
                  <p className="text-2xl font-bold">6h 30m</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-green-500/20 p-3">
                  <DollarSign className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Today's Earnings</p>
                  <p className="text-2xl font-bold">${user.stats.todayEarnings}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-purple-500/20 p-3">
                  <Target className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Project Progress</p>
                  <p className="text-2xl font-bold">75%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-amber-500/20 p-3">
                  <TrendingUp className="h-6 w-6 text-amber-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Monthly Progress</p>
                  <p className="text-2xl font-bold">${user.stats.monthlyEarnings}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* AI Suggestions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-[url('https://images.unsplash.com/photo-1635776062127-d379bfcba9f8?w=1200&auto=format&fit=crop&q=80')] bg-cover">
            <div className="backdrop-blur-sm bg-background/80">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-500" />
                  AI Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border bg-card p-4">
                  <h3 className="font-semibold">Project Optimization</h3>
                  <p className="text-sm text-muted-foreground">
                    Based on your work patterns, consider breaking down the current task into smaller milestones. 
                    This could improve your delivery time by ~25%.
                  </p>
                </div>
                <div className="rounded-lg border bg-card p-4">
                  <h3 className="font-semibold">Productivity Tip</h3>
                  <p className="text-sm text-muted-foreground">
                    Your most productive hours are between 9 AM and 11 AM. 
                    Schedule your most challenging tasks during this window.
                  </p>
                </div>
              </CardContent>
            </div>
          </Card>
        </motion.div>

      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Application Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid gap-4 md:grid-cols-4"
      >
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-blue-500/20 p-3">
                <Briefcase className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Jobs Found</p>
                <p className="text-2xl font-bold">{user.stats.jobsFound}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-green-500/20 p-3">
                <Send className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Proposals Sent</p>
                <p className="text-2xl font-bold">{user.stats.proposalsSent}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-purple-500/20 p-3">
                <MessageSquare className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Interviews</p>
                <p className="text-2xl font-bold">{user.stats.interviews}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-amber-500/20 p-3">
                <Mail className="h-6 w-6 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Offers</p>
                <p className="text-2xl font-bold">{user.stats.offers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* AI Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="bg-[url('https://images.unsplash.com/photo-1635776062127-d379bfcba9f8?w=1200&auto=format&fit=crop&q=80')] bg-cover">
          <div className="backdrop-blur-sm bg-background/80">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-500" />
                AI Job Search Assistant
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border bg-card p-4">
                <h3 className="font-semibold">Today's Opportunities</h3>
                <p className="text-sm text-muted-foreground">
                  I've found 3 new jobs that match your skills perfectly. 
                  The most promising one is a React Developer position at TechCorp.
                </p>
                <Button variant="link" className="mt-2 text-sm">View Jobs →</Button>
              </div>
              <div className="rounded-lg border bg-card p-4">
                <h3 className="font-semibold">Interview Prep</h3>
                <p className="text-sm text-muted-foreground">
                  For your upcoming interview, practice these topics:
                  React Performance Optimization, State Management Patterns
                </p>
                <Button variant="link" className="mt-2 text-sm">Start Practice →</Button>
              </div>
            </CardContent>
          </div>
        </Card>
      </motion.div>

      {/* Goal Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Monthly Goal Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                ${user.stats.monthlyEarnings} earned of ${user.stats.monthlyGoal} goal
              </span>
              <span className="font-medium">{progress.toFixed(0)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-muted-foreground">
              You're on track to reach your monthly goal! Keep up the great work.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}