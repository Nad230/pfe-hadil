"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Book, 
  Users, 
  Trophy,
  Brain,
  FileText,
  Rocket,
  ChevronLeft,
  ChevronRight
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface NavigationProps {
  courseId: string
}

export function Navigation({ courseId }: NavigationProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  const navItems = [
    {
      name: "Chapters",
      icon: Book,
      href: `/courses/${courseId}/chapters`,
      badge: "New",
      badgeColor: "bg-blue-500"
    },
    {
      name: "Study Rooms",
      icon: Users,
      href: `/courses/${courseId}/rooms`,
      badge: "5 Active",
      badgeColor: "bg-green-500"
    },
    {
      name: "Challenges",
      icon: Trophy,
      href: `/courses/${courseId}/challenges`,
      badge: "3 New",
      badgeColor: "bg-purple-500"
    },
    {
      name: "AI Zone",
      icon: Brain,
      href: `/courses/${courseId}/ai`,
    },
    {
      name: "Resources",
      icon: FileText,
      href: `/courses/${courseId}/resources`,
    },
    {
      name: "Experiments",
      icon: Rocket,
      href: `/courses/${courseId}/experiments`,
      badge: "Lab Open",
      badgeColor: "bg-amber-500"
    },
  ]

  return (
    <motion.div
      initial={false}
      animate={{ width: isExpanded ? 280 : 80 }}
      className={cn(
        "relative h-screen border-r bg-card/50 backdrop-blur-xl",
        "transition-all duration-300 ease-in-out"
      )}
    >
      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-4 top-6 z-50 rounded-full bg-primary text-primary-foreground shadow-lg"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ? (
          <ChevronLeft className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
      </Button>

      <ScrollArea className="h-full py-8 px-4">
        <nav className="space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center gap-x-3 rounded-lg px-3 py-2",
                "hover:bg-accent hover:text-accent-foreground",
                "transition-all duration-200 ease-in-out"
              )}
            >
              <item.icon className={cn(
                "h-5 w-5 shrink-0",
                isExpanded ? "mr-2" : "mr-0"
              )} />
              
              <AnimatePresence>
                {isExpanded && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    className="flex-1 truncate"
                  >
                    {item.name}
                  </motion.span>
                )}
              </AnimatePresence>

              {item.badge && isExpanded && (
                <span className={cn(
                  "ml-auto rounded-full px-2 py-0.5 text-xs font-medium text-white",
                  item.badgeColor
                )}>
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
        </nav>
      </ScrollArea>
    </motion.div>
  )
}