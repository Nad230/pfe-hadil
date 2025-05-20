"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  Store, DollarSign, Calendar, ClipboardList, 
  TrendingUp, ArrowRight, Target, CheckCircle2,
  Download, Youtube, BookOpen, SmilePlus
} from "lucide-react"
import confetti from "canvas-confetti"

const tasks = [
  { id: "location", label: "Found Location", completed: false },
  { id: "equipment", label: "Bought Equipment", completed: false },
  { id: "permits", label: "Obtained Permits", completed: false },
  { id: "suppliers", label: "Connected with Suppliers", completed: false },
  { id: "staff", label: "Hired Initial Staff", completed: false },
  { id: "marketing", label: "Created Marketing Plan", completed: false },
]

const weeklyPlan = [
  {
    week: 1,
    title: "Setup Phase",
    tasks: [
      "Research and select prime location",
      "Purchase essential equipment",
      "Begin permit application process"
    ]
  },
  {
    week: 2,
    title: "Preparation Phase",
    tasks: [
      "Set up equipment and test operations",
      "Train initial staff members",
      "Finalize menu and pricing"
    ]
  },
  {
    week: 3,
    title: "Launch Phase",
    tasks: [
      "Soft opening with friends & family",
      "Gather initial feedback",
      "Make necessary adjustments"
    ]
  },
  {
    week: 4,
    title: "Growth Phase",
    tasks: [
      "Grand opening event",
      "Launch marketing campaign",
      "Start loyalty program"
    ]
  }
]

const skills = [
  {
    id: "coffee",
    label: "Coffee Making Mastery",
    icon: Store,
    resources: "Basic barista techniques on YouTube"
  },
  {
    id: "business",
    label: "Business Management",
    icon: BookOpen,
    resources: "Free accounting basics course"
  },
  {
    id: "service",
    label: "Customer Service",
    icon: SmilePlus,
    resources: "Communication skills workshop"
  }
]

export default function LocalPlanPage() {
  const [checklist, setChecklist] = useState(tasks)
  const [userBudget] = useState(50000) // This would come from user input
  const requiredBudget = 45000
  const progress = (checklist.filter(t => t.completed).length / checklist.length) * 100

  const handleCheck = (taskId: string) => {
    setChecklist(prev => {
      const newChecklist = prev.map(task =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
      
      if (newChecklist.every(task => task.completed)) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        })
      }
      
      return newChecklist
    })
  }

  return (
    <div className="container max-w-5xl mx-auto py-8 px-4 space-y-8">
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse"
          }}
          className="w-20 h-20 bg-primary/10 rounded-full mx-auto flex items-center justify-center"
        >
          <Store className="h-10 w-10 text-primary" />
        </motion.div>
        <h1 className="text-4xl font-bold">Coffee Shop Business Plan</h1>
        <p className="text-muted-foreground">Start small, dream big. Your journey to café ownership begins here!</p>
      </motion.div>

      {/* Budget Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-lg p-6 text-center"
      >
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Budget Overview</h2>
          <div className="flex justify-center gap-8">
            <div>
              <p className="text-sm text-muted-foreground">Required Budget</p>
              <p className="text-3xl font-bold">${requiredBudget.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Your Budget</p>
              <p className="text-3xl font-bold">${userBudget.toLocaleString()}</p>
            </div>
          </div>
          <div className="inline-block bg-green-500/20 px-4 py-2 rounded-full">
            {userBudget >= requiredBudget ? (
              <p className="text-green-700 dark:text-green-300">
                You're ready to start! 🚀
              </p>
            ) : (
              <p className="text-amber-700 dark:text-amber-300">
                You need ${(requiredBudget - userBudget).toLocaleString()} more to start
              </p>
            )}
          </div>
        </div>
      </motion.div>

      {/* Setup Costs & Monthly Estimates */}
      <div className="grid gap-8 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500/10 rounded-full">
                    <DollarSign className="h-6 w-6 text-green-500" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">Setup Costs</h2>
                    <p className="text-3xl font-bold text-green-500">$45,000</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Equipment</span>
                    <span>$25,000</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Renovation</span>
                    <span>$12,000</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Initial Inventory</span>
                    <span>$5,000</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Licenses & Permits</span>
                    <span>$3,000</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 rounded-full">
                    <Calendar className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">Monthly Estimates</h2>
                    <p className="text-3xl font-bold text-blue-500">$12,500</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Rent</span>
                    <span>$3,500</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Staff</span>
                    <span>$5,000</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Supplies</span>
                    <span>$2,500</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Utilities</span>
                    <span>$1,500</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* First Month Strategy */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 rounded-full">
                  <Target className="h-6 w-6 text-purple-500" />
                </div>
                <h2 className="text-xl font-semibold">First Month Strategy</h2>
              </div>

              <div className="grid gap-4 md:grid-cols-4">
                {weeklyPlan.map((week) => (
                  <div key={week.week} className="p-4 rounded-lg bg-muted/50">
                    <div className="text-2xl mb-2">Week {week.week}</div>
                    <h3 className="font-semibold mb-2">{week.title}</h3>
                    <ul className="space-y-2">
                      {week.tasks.map((task, index) => (
                        <li key={index} className="text-sm text-muted-foreground">
                          • {task}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Skills & Resources */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/10 rounded-full">
                  <Youtube className="h-6 w-6 text-amber-500" />
                </div>
                <h2 className="text-xl font-semibold">Required Skills & Resources</h2>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {skills.map((skill) => (
                  <div key={skill.id} className="p-4 rounded-lg bg-muted/50">
                    <skill.icon className="h-8 w-8 mb-2 text-primary" />
                    <h3 className="font-semibold mb-2">{skill.label}</h3>
                    <p className="text-sm text-muted-foreground">{skill.resources}</p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Setup Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-500/10 rounded-full">
                    <ClipboardList className="h-6 w-6 text-amber-500" />
                  </div>
                  <h2 className="text-xl font-semibold">Setup Progress</h2>
                </div>
                <div className="text-sm text-muted-foreground">
                  {Math.round(progress)}% Complete
                </div>
              </div>

              <Progress value={progress} className="h-2" />

              <div className="space-y-4">
                <AnimatePresence>
                  {checklist.map((task) => (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-center space-x-4"
                    >
                      <Checkbox
                        id={task.id}
                        checked={task.completed}
                        onCheckedChange={() => handleCheck(task.id)}
                      />
                      <label
                        htmlFor={task.id}
                        className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${
                          task.completed ? "line-through text-muted-foreground" : ""
                        }`}
                      >
                        {task.label}
                      </label>
                      {task.completed && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="ml-auto"
                        >
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        </motion.div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Potential Earnings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-full">
                  <TrendingUp className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Potential Earnings</h2>
                  <p className="text-3xl font-bold text-green-500">$15,000 - $25,000</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-muted/50">
                  <h3 className="font-semibold mb-2">Monthly Revenue Breakdown</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Coffee & Beverages</span>
                      <span>$12,000 - $18,000</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Food Items</span>
                      <span>$5,000 - $8,000</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Merchandise</span>
                      <span>$500 - $1,000</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button className="w-full group" size="lg">
                    Start Your Journey
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                  <Button variant="outline" className="group" size="lg">
                    <Download className="mr-2 h-4 w-4" />
                    Download Plan
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}