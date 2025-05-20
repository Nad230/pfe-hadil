"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { useAudio } from "@/components/audio/audio-provider"
import { AcademicStats } from "@/components/academic/stats"
import { CourseGrid } from "@/components/academic/courses/course-grid"
import { AchievementSection } from "@/components/academic/achievements/achievement-section"
import { StudyRooms } from "@/components/academic/study-rooms/study-rooms"
import { ProgressTracker } from "@/components/academic/progress/progress-tracker"
import { Canvas } from "@react-three/fiber"
import { Float, Text3D, Environment } from "@react-three/drei"
import { EffectComposer, Bloom } from "@react-three/postprocessing"

function FloatingText() {
  return (
    <Float
      speed={2}
      rotationIntensity={0.5}
      floatIntensity={1}
      position={[0, 0, 0]}
    >
      <Text3D
        font="/fonts/inter_bold.json"
        size={0.5}
        height={0.2}
        curveSegments={12}
      >
        Academic Journey
        <meshStandardMaterial
          color="#4F46E5"
          emissive="#4F46E5"
          emissiveIntensity={0.5}
          metalness={0.8}
          roughness={0.2}
        />
      </Text3D>
    </Float>
  )
}

export default function AcademicDashboard() {
  const { playTransition } = useAudio()

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-900/20 via-background to-background">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:radial-gradient(white,transparent_70%)]" />
      </div>

      <div className="container mx-auto p-6 space-y-8 relative">
        <div className="h-[300px] -mt-6 mb-12">
          <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
            <Environment preset="city" />
            <FloatingText />
            <EffectComposer>
              <Bloom
                intensity={1.5}
                luminanceThreshold={0.5}
                luminanceSmoothing={0.9}
              />
            </EffectComposer>
          </Canvas>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          onAnimationComplete={() => playTransition()}
          className="relative"
        >
          <div className="absolute -inset-x-4 -inset-y-4 z-0 bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-pink-500/5 rounded-2xl blur-xl" />
          <div className="relative">
            <h2 className="text-xl font-medium text-muted-foreground mb-4">
              Your Learning Analytics
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <AcademicStats />
            </div>
          </div>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="overflow-hidden backdrop-blur-xl bg-white/5 border-white/10">
              <CourseGrid />
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="overflow-hidden backdrop-blur-xl bg-white/5 border-white/10">
              <AchievementSection />
            </Card>
          </motion.div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="overflow-hidden backdrop-blur-xl bg-white/5 border-white/10">
              <StudyRooms />
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="overflow-hidden backdrop-blur-xl bg-white/5 border-white/10">
              <ProgressTracker />
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}