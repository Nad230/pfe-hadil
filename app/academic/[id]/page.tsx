"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CourseTimeline } from "@/components/academic/course/timeline"
import { CourseResources } from "@/components/academic/citation/resource-hub"
import { CourseAIAssistant } from "@/components/academic/course/ai-assistant"
import { CourseStudyRooms } from "@/components/academic/course/study-rooms"
import { CourseExperiments } from "@/components/academic/course/experiments"
import { CitationTracker } from "@/components/academic/citation/citation-tracker"
import { CourseProgress } from "@/components/academic/course/progress"
import { CourseLeaderboard } from "@/components/academic/course/leaderboard"
import dynamic from "next/dynamic"
const Flask = dynamic(() => import("lucide-react").then(mod => mod.FlaskConical), { ssr: false })
import { FlaskConical } from "lucide-react"

import {
    BookOpen, 
    Bot, 
    Users, 
    Trophy,
    FileText,
    BarChart,
    MessageSquare
  } from "lucide-react"
import { useState } from "react"
  
  export default function CoursePage({ params }: { params: { courseId: string } }) {
    const [activeTab, setActiveTab] = useState("timeline")
    const playTransition = () => {
      console.log("Animation finished");
    };
    

  return (
    <div className="container mx-auto p-6 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        onAnimationComplete={() => playTransition()}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-4xl font-bold mb-2 bg-clip-text text-transparent animated-gradient">
            Advanced Mathematics
          </h1>
          <p className="text-muted-foreground">
            Master advanced mathematical concepts through interactive learning
          </p>
        </div>
        <CourseProgress />
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <TabsList className="grid grid-cols-4 lg:grid-cols-8 gap-4">
          <TabsTrigger value="timeline" className="gap-2">
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">Timeline</span>
          </TabsTrigger>
          <TabsTrigger value="resources" className="gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Resources</span>
          </TabsTrigger>
          <TabsTrigger value="citation" className="gap-2">
            <Trophy className="h-4 w-4" />
            <span className="hidden sm:inline">Citation</span>
          </TabsTrigger>
          <TabsTrigger value="ai-assistant" className="gap-2">
            <Bot className="h-4 w-4" />
            <span className="hidden sm:inline">AI Assistant</span>
          </TabsTrigger>
       
        
          <TabsTrigger value="leaderboard" className="gap-2">
            <BarChart className="h-4 w-4" />
            <span className="hidden sm:inline">Leaderboard</span>
          </TabsTrigger>
        
        </TabsList>

        <TabsContent value="timeline">
  <CourseTimeline setActiveTab={setActiveTab} />
</TabsContent>

        <TabsContent value="resources">
          <CourseResources />
        </TabsContent>

        <TabsContent value="ai-assistant">
          <CourseAIAssistant />
        </TabsContent>

        <TabsContent value="study-rooms">
          <CourseStudyRooms />
        </TabsContent>

        <TabsContent value="experiments">
        <CourseExperiments />
        </TabsContent>

        <TabsContent value="citation">
          <CitationTracker />
        </TabsContent>

        <TabsContent value="leaderboard">
          <CourseLeaderboard />
        </TabsContent>

        <TabsContent value="discussions">
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">Course Discussions</h2>
            {/* Discussion component will be added here */}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}