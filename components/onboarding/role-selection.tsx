"use client"

import { motion } from "framer-motion"
import { Role } from "@/app/onboarding2/page"
import { Code2, GraduationCap, Pencil, Palette } from "lucide-react"
import { Howl } from "howler"
import { useState } from "react"

interface RoleSelectionProps {
  onSelect: (role: Role) => void
}

const roles = [
  {
    id: "developer",
    title: "Developer",
    icon: Code2,
    description: "Building the future with code",
    gradient: "from-blue-500 to-cyan-500",
    hoverSound: "/sounds/hover-1.mp3"
  },
  {
    id: "student",
    title: "Student",
    icon: GraduationCap,
    description: "Learning and growing every day",
    gradient: "from-green-500 to-emerald-500",
    hoverSound: "/sounds/hover-2.mp3"
  },
  {
    id: "teacher",
    title: "Teacher",
    icon: Pencil,
    description: "Sharing knowledge with others",
    gradient: "from-purple-500 to-pink-500",
    hoverSound: "/sounds/hover-3.mp3"
  },
  {
    id: "creator",
    title: "Creator",
    icon: Palette,
    description: "Bringing ideas to life",
    gradient: "from-orange-500 to-red-500",
    hoverSound: "/sounds/hover-4.mp3"
  }
] as const

export function RoleSelection({ onSelect }: RoleSelectionProps) {
  const [hoveredRole, setHoveredRole] = useState<string | null>(null)

  const playHoverSound = (soundUrl: string) => {
    const sound = new Howl({
      src: [soundUrl],
      volume: 0.3
    })
    sound.play()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex items-center justify-center p-4"
    >
      <div className="max-w-4xl w-full space-y-8">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold text-center"
        >
          Choose Your Path
        </motion.h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {roles.map((role, index) => (
            <motion.div
              key={role.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => onSelect(role.id as Role)}
              onMouseEnter={() => {
                setHoveredRole(role.id)
                playHoverSound(role.hoverSound)
              }}
              onMouseLeave={() => setHoveredRole(null)}
              className={`
                relative overflow-hidden rounded-2xl cursor-pointer
                transform transition-all duration-300
                ${hoveredRole === role.id ? "scale-105" : "scale-100"}
              `}
            >
              <div className={`
                absolute inset-0 bg-gradient-to-br ${role.gradient} opacity-10
                transition-opacity duration-300
                ${hoveredRole === role.id ? "opacity-20" : "opacity-10"}
              `} />
              
              <div className="relative bg-white dark:bg-gray-900 p-8 h-full border border-gray-200 dark:border-gray-800 rounded-2xl">
                <div className="flex items-center gap-4">
                  <div className={`
                    p-3 rounded-xl bg-gradient-to-br ${role.gradient}
                    transform transition-transform duration-300
                    ${hoveredRole === role.id ? "scale-110 rotate-3" : ""}
                  `}>
                    <role.icon className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold">{role.title}</h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      {role.description}
                    </p>
                  </div>
                </div>

                <motion.div
                  initial={false}
                  animate={{
                    scale: hoveredRole === role.id ? [1, 1.05, 1] : 1,
                    transition: { duration: 0.3 }
                  }}
                  className="absolute bottom-4 right-4 text-sm text-gray-500"
                >
                  Click to select
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}