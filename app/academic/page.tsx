"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { useAudio } from "@/components/audio/audio-provider"
import { AcademicStats } from "@/components/academic/stats"
import { CourseGrid } from "@/components/academic/courses/course-grid"
import { AchievementSection } from "@/components/academic/achievements/achievement-section"
import { StudyRooms } from "@/components/academic/study-rooms/study-rooms"
import { ProgressTracker } from "@/components/academic/progress/progress-tracker"

export default function AcademicDashboard() {
  const { playTransition } = useAudio()

  return (
    <div className="container mx-auto p-6 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        onAnimationComplete={() => playTransition()}
      >
        <h1 className="text-4xl font-bold mb-2 bg-clip-text text-transparent animated-gradient">
          Academic Dashboard
        </h1>
        <p className="text-muted-foreground">
          Your personalized learning journey starts here
        </p>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <AcademicStats />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6 glassmorphism">
          <CourseGrid />
        </Card>
        <Card className="p-6 glassmorphism">
          <AchievementSection />
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6 glassmorphism">
          <StudyRooms />
        </Card>
        <Card className="p-6 glassmorphism">
          <ProgressTracker />
        </Card>
      </div>
    </div>
  )
}