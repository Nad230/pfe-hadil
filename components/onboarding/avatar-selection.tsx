"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Role } from "@/app/onboarding2/page"
import { Shuffle, ChevronLeft, ChevronRight } from "lucide-react"
import { useState } from "react"
import { Howl } from "howler"
import Cookies from "js-cookie";

interface AvatarSelectionProps {
  role: Role
  onComplete: () => void
}

const roleAvatars = {
  developer: [
    { id: "dev1", color: "#3B82F6", icon: "👨‍💻" },
    { id: "dev2", color: "#2563EB", icon: "👩‍💻" },
    { id: "dev3", color: "#1D4ED8", icon: "🧑‍💻" },
    { id: "dev4", color: "#1E40AF", icon: "💻" }
  ],
  student: [
    { id: "student1", color: "#10B981", icon: "👨‍🎓" },
    { id: "student2", color: "#059669", icon: "👩‍🎓" },
    { id: "student3", color: "#047857", icon: "🎓" },
    { id: "student4", color: "#065F46", icon: "📚" }
  ],
  teacher: [
    { id: "teacher1", color: "#8B5CF6", icon: "👨‍🏫" },
    { id: "teacher2", color: "#7C3AED", icon: "👩‍🏫" },
    { id: "teacher3", color: "#6D28D9", icon: "🎯" },
    { id: "teacher4", color: "#5B21B6", icon: "📝" }
  ],
  creator: [
    { id: "creator1", color: "#EC4899", icon: "👨‍🎨" },
    { id: "creator2", color: "#DB2777", icon: "👩‍🎨" },
    { id: "creator3", color: "#BE185D", icon: "🎨" },
    { id: "creator4", color: "#9D174D", icon: "✨" }
  ]
}

export function AvatarSelection({ role, onComplete }: AvatarSelectionProps) {
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const avatars = roleAvatars[role]

  const playSelectSound = () => {
    const sound = new Howl({
      src: ["/sounds/select.mp3"],
      volume: 0.3
    })
    sound.play()
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % avatars.length)
  }

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + avatars.length) % avatars.length)
  }

  const handleRandomize = () => {
    const newIndex = Math.floor(Math.random() * avatars.length)
    setCurrentIndex(newIndex)
    playSelectSound()
  }
  const updateUserProfile = async (avatarId: string, role: Role) => {
    try {
        const token = Cookies.get("token");

      const res = await fetch("http://localhost:3000/auth/update", {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            profile_photo: avatarId,
            role: role
          })
        })
    
        const data = await res.json()
    
        if (!res.ok) {
          console.error("Server responded with:", data)
          throw new Error("Failed to update profile")
        }
    
        return data
      } catch (error) {
        console.error("Error in updateUserProfile:", error)
      }
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
          Choose Your Avatar
        </motion.h1>

        <div className="relative">
          <div className="flex items-center justify-center gap-8">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePrev}
              className="relative z-10"
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>

            <div className="relative w-64 h-64">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0.8, rotate: 10 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0"
                >
                  <motion.div
                    className={`
                      w-full h-full rounded-2xl flex items-center justify-center
                      text-8xl bg-gradient-to-br shadow-lg
                      ${selectedAvatar === avatars[currentIndex].id ? "ring-4 ring-blue-500" : ""}
                    `}
                    style={{ backgroundColor: avatars[currentIndex].color }}
                    onClick={() => {
                      setSelectedAvatar(avatars[currentIndex].id)
                      playSelectSound()
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    animate={{
                      y: [0, -10, 0],
                      transition: {
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }
                    }}
                  >
                    {avatars[currentIndex].icon}
                  </motion.div>
                </motion.div>
              </AnimatePresence>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleNext}
              className="relative z-10"
            >
              <ChevronRight className="w-6 h-6" />
            </Button>
          </div>
        </div>

        <div className="flex justify-center gap-4">
          <Button
            variant="outline"
            onClick={handleRandomize}
            className="gap-2"
          >
            <Shuffle className="w-4 h-4" />
            Randomize
          </Button>

          <Button
  onClick={async () => {
    if (!selectedAvatar) return

    await updateUserProfile(selectedAvatar, role)
    onComplete()
  }}
  disabled={!selectedAvatar}
  className="gap-2"
>
  Complete Setup
</Button>

          
        </div>
      </div>
    </motion.div>
  )
}