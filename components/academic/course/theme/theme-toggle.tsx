"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"
import { Sun, Moon, Laptop, Palette } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const themes = [
  {
    name: "light",
    icon: Sun,
    label: "Light",
  },
  {
    name: "dark",
    icon: Moon,
    label: "Dark",
  },
  {
    name: "system",
    icon: Laptop,
    label: "System",
  },
]

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="icon"
          className="h-12 w-12 rounded-full bg-background/80 backdrop-blur-sm"
        >
          <motion.div
            animate={{ rotate: theme === "dark" ? 180 : 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 10 }}
          >
            <Palette className="h-5 w-5" />
          </motion.div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {themes.map(({ name, icon: Icon, label }) => (
          <DropdownMenuItem
            key={name}
            onClick={() => setTheme(name)}
            className="gap-2"
          >
            <Icon className="h-4 w-4" />
            <span>{label}</span>
            {theme === name && (
              <motion.div
                layoutId="theme-check"
                className="ml-auto h-4 w-4 rounded-full bg-primary"
              />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}