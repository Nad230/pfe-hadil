"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Brain, 
  Bell, 
  Users, 
  Star,
  Trophy,
  Sparkles
} from "lucide-react"

interface CourseHeaderProps {
  onAIToggle: () => void
  onNotificationsToggle: () => void
}

export function CourseHeader({ onAIToggle, onNotificationsToggle }: CourseHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-8">
          <motion.h1 
            className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Advanced Web Development
          </motion.h1>

          <nav className="flex items-center gap-1">
            <Button variant="ghost" size="sm" className="gap-2">
              <Users className="h-4 w-4" />
              <span>256 Students</span>
            </Button>
            <Button variant="ghost" size="sm" className="gap-2">
              <Star className="h-4 w-4 text-yellow-500" />
              <span>4.9</span>
            </Button>
            <Button variant="ghost" size="sm" className="gap-2">
              <Trophy className="h-4 w-4 text-purple-500" />
              <span>Top Course</span>
            </Button>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon"
            className="relative"
            onClick={onNotificationsToggle}
          >
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] font-medium text-white flex items-center justify-center">
              3
            </span>
          </Button>

          <Button
            variant="outline"
            className="gap-2"
            onClick={onAIToggle}
          >
            <Brain className="h-4 w-4" />
            <span>AI Assistant</span>
            <Sparkles className="h-3 w-3 text-yellow-500" />
          </Button>

          <Avatar>
            <AvatarImage src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop" />
            <AvatarFallback>JS</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  )
}