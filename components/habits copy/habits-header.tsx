"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Bell,
  User,
  Zap,
  Briefcase,
  ChevronDown,
  Plus,
  Settings,
  BarChart,
  LogOut,
  Calendar,
  LineChart,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"

const categories = [
  {
    name: "Dashboard",
    icon: BarChart,
    color: "text-indigo-500",
    link: "/habit",
    
  },
  {
    name: "Add Habit",
    icon: Zap,
    color: "text-yellow-500",
    link: "/habit/new-habits",
    
  },
  {
    name: "Control Habits",
    icon: Briefcase,
    color: "text-blue-500",
    link: "/habit/control-habit",
    
  },
  {
    name: "View Habits",
    icon: LineChart,
    color: "text-green-500",
    link: "/habit/view-habit",
    
    subCategories: [
      { name: "Analytics", link: "/habit/view-habit?tab=analytics" },
      { name: "History", link: "/habit/view-habit?tab=history" },
      { name: "Trends", link: "/habit/view-habit?tab=trends" },
    ],
  },
  {
    name: "Calendar",
    icon: Calendar,
    color: "text-purple-500",
    link: "/habit/calendar",
    count: 0,
  },
]

const mockNotifications = [
  {
    id: "1",
    title: "Habit Reminder",
    description: "Time for your evening meditation!",
    time: "5m ago",
    unread: true,
  },
  {
    id: "2",
    title: "Achievement Unlocked",
    description: "You've completed your daily reading goal!",
    time: "1h ago",
    unread: true,
  },
  {
    id: "3",
    title: "Streak Alert",
    description: "You're on a 7-day streak for Morning Exercise!",
    time: "2h ago",
    unread: false,
  },
]

export function HabitsHeader() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [unreadCount, setUnreadCount] = useState(mockNotifications.filter((n) => n.unread).length)
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = () => {
    // Add your logout logic here
    router.push("/login")
  }

  const markAllAsRead = () => {
    setUnreadCount(0)
  }

  return (
    <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="border-b">
        <div className="container mx-auto px-4">
       
          <div className="h-16 flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2"
            >
              <BarChart className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              <Link href="/habit">
                <h1 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">Habit Tracker</h1>
              </Link>
            </motion.div>

            <div className="flex items-center gap-4">
             z
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative">
                      <Bell className="h-5 w-5" />
                      {unreadCount > 0 && (
                        <Badge
                          variant="secondary"
                          className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-indigo-600 text-white"
                        >
                          {unreadCount}
                        </Badge>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80">
                    <div className="flex items-center justify-between px-4 py-2 border-b">
                      <span className="font-semibold">Notifications</span>
                      <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                        Mark all read
                      </Button>
                    </div>
                    {mockNotifications.map((notification) => (
                      <DropdownMenuItem key={notification.id} className="px-4 py-3 cursor-pointer">
                        <div className="flex items-start gap-4">
                          <div className="flex-1 space-y-1">
                            <p className="font-medium">{notification.title}</p>
                            <p className="text-sm text-muted-foreground">{notification.description}</p>
                            <p className="text-xs text-muted-foreground">{notification.time}</p>
                          </div>
                          {notification.unread && <div className="h-2 w-2 rounded-full bg-indigo-600 mt-2" />}
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop" />
                        <AvatarFallback>SC</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="flex items-center gap-2 p-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop" />
                        <AvatarFallback>SC</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-medium">Sarah Chen</span>
                        <span className="text-xs text-muted-foreground">sarah@example.com</span>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <Link href="/profile">
                      <DropdownMenuItem>
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </DropdownMenuItem>
                    </Link>
                    <Link href="/settings">
                      <DropdownMenuItem>
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </DropdownMenuItem>
                    </Link>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Log Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </motion.div>
            </div>
          </div>

      
          <div className="h-14 flex items-center -mb-px overflow-x-auto hide-scrollbar">
            <div className="flex space-x-1 md:space-x-4">
              {categories.map((category) => {
                const Icon = category.icon
                const isActive =
                  pathname === category.link || (pathname?.startsWith(category.link) && category.link !== "/habit")

                return (
                  <div key={category.name} className="relative">
                    {category.subCategories ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className={`h-14 gap-2 ${isActive ? "border-b-2 border-indigo-600 dark:border-indigo-400" : ""}`}
                            onMouseEnter={() => setActiveCategory(category.name)}
                            onMouseLeave={() => setActiveCategory(null)}
                          >
                            <Icon className={`h-4 w-4 ${category.color}`} />
                            <span className="hidden md:inline">{category.name}</span>
                            <span className="inline md:hidden">{category.name.split(" ")[0]}</span>
                           
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          {category.subCategories.map((sub) => (
                            <DropdownMenuItem key={sub.name} onClick={() => router.push(sub.link)}>
                              {sub.name}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : (
                      <Button
                        variant="ghost"
                        className={`h-14 gap-2 ${isActive ? "border-b-2 border-indigo-600 dark:border-indigo-400" : ""}`}
                        onClick={() => router.push(category.link)}
                        onMouseEnter={() => setActiveCategory(category.name)}
                        onMouseLeave={() => setActiveCategory(null)}
                      >
                        <Icon className={`h-4 w-4 ${category.color}`} />
                        <span className="hidden md:inline">{category.name}</span>
                        <span className="inline md:hidden">{category.name.split(" ")[0]}</span>
                       
                      </Button>
                    )}

                    <AnimatePresence>
                      {(activeCategory === category.name || isActive) && (
                        <motion.div
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400"
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          exit={{ scaleX: 0 }}
                          transition={{ duration: 0.2 }}
                        />
                      )}
                    </AnimatePresence>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
