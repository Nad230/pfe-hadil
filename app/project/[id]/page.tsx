"use client"

import { useState, useEffect } from "react"
import { ProjectHeader } from "@/components/project/project-header"
import { MilestoneBoard } from "@/components/project/milestone-board"
import { TaskBoard } from "@/components/project/task-board"
import { mockProject } from "@/lib/mock-data/project"
import { motion, AnimatePresence } from "framer-motion"
import { useParams } from "next/navigation"
import Cookies from "js-cookie"

export default function ProjectPage() {
  const [selectedMilestone, setSelectedMilestone] = useState<string | null>(null)
  const [currentUser, setCurrentUser] = useState<{ id: string } | null>(null)
  
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const token = Cookies.get("token")
      if (!token) return
      
      try {
        const response = await fetch("http://localhost:3000/auth/me", {
          headers: { Authorization: `Bearer ${token}` }
        })
        const data = await response.json()
        setCurrentUser(data)
      } catch (error) {
        console.error("Error fetching current user:", error)
      }
    }
    
    fetchCurrentUser()
  }, [])

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-b from-background to-muted/50 p-8 space-y-8"
    >
      <ProjectHeader />
      
      <AnimatePresence mode="wait">
        {selectedMilestone ? (
          <motion.div
            key="task-board"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <TaskBoard 
              milestoneId={selectedMilestone}
              onBack={() => setSelectedMilestone(null)}
              userId={currentUser?.id || ""}
            />
          </motion.div>
        ) : (
          <motion.div
            key="milestone-board"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <MilestoneBoard 
              projectId={mockProject.id}
              onMilestoneSelect={setSelectedMilestone}
              userId={currentUser?.id || ""}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}