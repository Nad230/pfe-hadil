"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Brain, TrendingUp, Users, Target, Sparkles, Star, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import Cookies from "js-cookie"

interface AIInsight {
  title: string
  message: string
  action: string
  impact: string
  confidence: number
  category: "revenue" | "customers" | "growth" | "optimization"
}

const mockInsights: AIInsight[] = [
  {
    title: "Revenue Opportunity Detected",
    message: "Your afternoon sales (2-4 PM) are consistently 30% lower than morning peaks. Consider introducing a happy hour promotion during this period.",
    action: "Launch an afternoon special offering 15% off between 2-4 PM",
    impact: "Potential revenue increase of $500/week",
    confidence: 89,
    category: "revenue"
  },
  {
    title: "Customer Behavior Pattern",
    message: "Customers who try your caramel latte are 3x more likely to become repeat visitors. This product could be key to customer retention.",
    action: "Feature caramel latte in your marketing and consider a first-time buyer discount",
    impact: "Could increase customer retention by 25%",
    confidence: 92,
    category: "customers"
  },
  {
    title: "Growth Opportunity",
    message: "Based on your location data, there's an untapped market of office workers within a 5-minute walk. They typically order coffee between 8-9 AM.",
    action: "Launch a pre-order system for morning coffee runs",
    impact: "Estimated 40 new daily customers",
    confidence: 85,
    category: "growth"
  }
]

const categoryIcons = {
  revenue: TrendingUp,
  customers: Users,
  growth: Target,
  optimization: Brain
}

const categoryStyles = {
  revenue: {
    gradient: "from-green-500/20 to-emerald-500/20",
    border: "border-green-500/20",
    text: "text-green-500",
    glow: "shadow-green-500/20"
  },
  customers: {
    gradient: "from-blue-500/20 to-indigo-500/20",
    border: "border-blue-500/20",
    text: "text-blue-500",
    glow: "shadow-blue-500/20"
  },
  growth: {
    gradient: "from-purple-500/20 to-pink-500/20",
    border: "border-purple-500/20",
    text: "text-purple-500",
    glow: "shadow-purple-500/20"
  },
  optimization: {
    gradient: "from-amber-500/20 to-orange-500/20",
    border: "border-amber-500/20",
    text: "text-amber-500",
    glow: "shadow-amber-500/20"
  }
}
interface ProjectData {
    projectName: string
    role: string
    location: string
    startHour: number
    endHour: number
  }
export function AIInsightsReport() {

 const [insights, setInsights] = useState<AIInsight[]>([])
  const [activeInsight, setActiveInsight] = useState(0)
  const [isVisible, setIsVisible] = useState(true)
  const [isExpanded, setIsExpanded] = useState(false)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const [isAfterHours, setIsAfterHours] = useState(false)

  useEffect(() => {
    const fetchAIInsights = async () => {
      try {
        const token = Cookies.get("token")
        if (!token) {
          toast({ title: "Authorization required", description: "Please login again" })
          return
        }

        // Get user sub
        const meResponse = await fetch("http://localhost:3000/auth/me", {
          headers: { Authorization: `Bearer ${token}` }
        })
        
        const data = await meResponse.json()
        const { sub } = data

        // Get project data
        const subResponse = await fetch(`http://localhost:3000/auth/${sub}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        const projectData: ProjectData = await subResponse.json()

        // Check current time against project hours
        const now = new Date();
        const currentHour = now.getHours();
        const isOvernight = projectData.startHour >= projectData.endHour;
        let isAfterHours = false;

        if (isOvernight) {
            // For overnight shifts (e.g. 20:00-07:00)
            isAfterHours = currentHour < projectData.startHour && currentHour >= projectData.endHour;
          } else {
            // For normal daytime shifts (e.g. 08:00-18:00)
            isAfterHours = currentHour < projectData.startHour || currentHour >= projectData.endHour;
          }
          
          if (isAfterHours) {
            setIsAfterHours(true);
            setLoading(false);
            return;
          }

          console.log(projectData)
        // Get AI recommendations
        const aiResponse = await fetch(
          `http://localhost:3000/project-offline-ai?` +
          new URLSearchParams({
            project: projectData.projectName,
            location: projectData.location,
            type: projectData.role,
            startHour: projectData.startHour.toString(),
            endHour: projectData.endHour.toString()
          }),
          { headers: { Authorization: `Bearer ${token}` } }
        )
      
      console.log("AI Response Status:", aiResponse.status)
      const aiText = await aiResponse.text()
      console.log("AI Raw Response:", aiText)

      if (!aiResponse.ok) throw new Error("Failed to get AI insights")

// Split response into individual insights
      const aiItems = aiText
      .split('\n')
      .filter(line => line.trim().length > 0)
      .map(line => line.replace(/^\d+\.\s*/, '').trim()) // Remove numbers

// Transform response to match AIInsight structure
      const formattedInsights = aiItems.map((text, index) => {
      const [action, message] = text.split(': ').length > 1 ? 
          [text.split(': ')[0], text.split(': ').slice(1).join(': ')] :
          [text, text]
  
      return {
          title: `AI Recommendation ${index + 1}`,
          message: message,
          action: action,
          confidence: 85 + Math.floor(Math.random() * 10),
          category: ["revenue", "customers", "growth", "optimization"][index % 4] as 
          "revenue" | "customers" | "growth" | "optimization"
      }
      })

      setInsights(formattedInsights)
          } catch (error) {
              toast({
              title: "Error loading insights",
              description: "Failed to fetch AI recommendations",
              variant: "destructive"
              })
          } finally {
              setLoading(false)
          }
          }

          fetchAIInsights()
      }, [toast])

  useEffect(() => {
    if (insights.length > 0) {
      const interval = setInterval(() => {
        if (!isExpanded) {
          setIsVisible(false)
          setTimeout(() => {
            setActiveInsight(prev => (prev + 1) % insights.length)
            setIsVisible(true)
          }, 500)
        }
      }, 8000)

      return () => clearInterval(interval)
    }
  }, [isExpanded, insights.length])

  if (loading) {
    return (
      <Card className="h-[400px] flex items-center justify-center">
        <p className="text-muted-foreground">Loading AI insights...</p>
      </Card>
    )
  }

  if (isAfterHours) {
    return (
      <Card className="h-[400px] flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <Sparkles className="h-12 w-12 text-primary mx-auto animate-pulse" />
          <h3 className="text-xl font-semibold">Great work today!</h3>
          <p className="text-muted-foreground">
            You've completed your work hours. We'll see each other tomorrow inshaallah.<br />
            Check your daily stats in "End My Work Day". Wishing you the best!
          </p>
        </div>
      </Card>
    )
  }

  if (!insights.length) {
    return (
      <Card className="h-[400px] flex items-center justify-center">
        <p className="text-muted-foreground">No insights available</p>
      </Card>
    )
  }

  const insight = insights[activeInsight]
  const style = categoryStyles[insight.category]
  const Icon = categoryIcons[insight.category]


  return (
    <Card className={`
        relative transition-all duration-500
        ${isExpanded ? 'h-[600px]' : 'h-[400px]'}
        bg-[url('https://images.unsplash.com/photo-1636953056323-9c09fdd74fa6?w=1200&auto=format&fit=crop&q=80')] 
        bg-cover
        pt-12 // Add top padding to make space for the icon
      `}>
        <div className="absolute inset-0 backdrop-blur-md bg-background/50">        {/* Animated Background Effects */}
        <div className="absolute inset-0 opacity-40">
            <motion.div
            className={`absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b ${style.gradient}`}
            animate={{
              opacity: [0.3, 0.6, 0.3],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute -top-20 left-1/2 transform -translate-x-1/2 w-96 h-96 rounded-full"
            style={{
              background: `radial-gradient(circle, ${style.text} 0%, transparent 70%)`
            }}
            animate={{
              opacity: [0.1, 0.2, 0.1],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>

        <div className="relative h-full p-8">
        {/* Floating AI Icon */}
          <motion.div
           className={`
            absolute top-4 right-8 w-12 h-12 rounded-full // Changed from -top-6 to top-4
            bg-gradient-to-br ${style.gradient} ${style.border}
            shadow-lg ${style.glow}
            flex items-center justify-center
            border z-50
          `}
            animate={{
              y: [0, -8, 0],
              rotate: [0, 5, -5, 0]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <Sparkles className={`h-6 w-6 ${style.text}`} />
    </motion.div>

          {/* Content */}
          <AnimatePresence mode="wait">
            {isVisible && (
              <motion.div
                key={activeInsight}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Header */}
                <div className="flex items-center gap-4">
                  <motion.div
                    className={`
                      p-3 rounded-xl
                      bg-gradient-to-br ${style.gradient} ${style.border}
                      border shadow-lg ${style.glow}
                    `}
                    animate={{
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <Icon className={`h-6 w-6 ${style.text}`} />
                  </motion.div>
                  <div>
                    <motion.h3 
                      className="text-2xl font-bold"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      {insight.title}
                    </motion.h3>
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                      <span className="text-sm text-muted-foreground">
                        {insight.confidence}% confidence
                      </span>
                    </div>
                  </div>
                </div>

                {/* Message */}
                <motion.div
                  className={`
                    p-6 rounded-xl border
                    bg-gradient-to-br ${style.gradient} ${style.border}
                    shadow-lg backdrop-blur-sm
                  `}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <p className="text-lg leading-relaxed">{insight.message}</p>
                </motion.div>

                {/* Action and Impact */}
                <div className="grid grid-cols-2 gap-6">
                  <motion.div
                    className="space-y-2 p-4 rounded-xl bg-primary/5 border border-primary/10"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <h4 className="text-sm font-medium text-primary">Recommended Action</h4>
                    <p className="text-sm">{insight.action}</p>
                  </motion.div>
                  <motion.div
                    className="space-y-2 p-4 rounded-xl bg-purple-500/5 border border-purple-500/10"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                   
                  </motion.div>
                </div>

                {/* Expand/Collapse Button */}
                <motion.div 
                  className="absolute bottom-6 right-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className={`
                      group border ${style.border} ${style.text}
                      hover:bg-background/50
                    `}
                  >
                    {isExpanded ? "Show Less" : "Show More"}
                    <ArrowRight className={`
                      ml-2 h-4 w-4 transition-transform
                      group-hover:translate-x-1
                      ${isExpanded ? "rotate-90" : ""}
                    `} />
                  </Button>
                </motion.div>

                {/* Progress Indicators */}
                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2">
  {insights.map((_, index) => ( // Changed from mockInsights to insights
    <motion.div
      key={index}
      className={`
        w-2 h-2 rounded-full cursor-pointer
        ${index === activeInsight ? style.text : "bg-primary/20"}
      `}
      animate={index === activeInsight ? {
        scale: [1, 1.5, 1],
      } : {}}
      transition={{
        duration: 1,
        repeat: Infinity,
      }}
      onClick={() => {
        setActiveInsight(index)
        setIsVisible(true)
      }}
    />
  ))}
</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Card>
  )
}