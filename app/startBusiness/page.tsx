"use client"

import { AnimatePresence, motion } from "framer-motion"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Brain, Sparkles, Rocket, Star } from "lucide-react"
import confetti from "canvas-confetti"
import { toast } from "sonner"
import Cookies from "js-cookie"

interface BusinessPlan {
  id: string // Add ID to the interface

  title: string
  budget: number
  description: string
}

const getEmojiForTitle = (title: string) => {
  const emojiMap: { [key: string]: string } = {
    bike: "🚲",
    café: "☕",
    tech: "💻",
    food: "🍴",
    rental: "🏢",
    tours: "🗺️",
    creative: "🎨",
    agency: "🏛️",
    consulting: "📈"
  }
 


  const lowerTitle = title.toLowerCase()
  for (const [keyword, emoji] of Object.entries(emojiMap)) {
    if (lowerTitle.includes(keyword)) return emoji
  }
  return "🚀" // Default emoji
}

export default function BusinessPlansPage() {
  const router = useRouter()
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [showOptions, setShowOptions] = useState(false)
  const [plans, setPlans] = useState<BusinessPlan[]>([])
  const [loading, setLoading] = useState(true)
  const creationOptions = [
    {
      id: "ai",
      title: "AI Co-Pilot",
      description: "Let AI enhance your existing business",
      icon: Brain,
      color: "from-emerald-500 to-teal-500",
      path: "/location"  // New path for AI option
    },
    {
      id: "generate",
      title: "Idea Generator",
      description: "Generate fresh business concepts",
      icon: Sparkles,
      color: "from-purple-500 to-pink-500",
      path: "/localplan"  // New path for Generate option
    }
  ];
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const token = Cookies.get("token")
        const response = await fetch("http://localhost:3000/business-plan/plans", {
          headers: { Authorization: `Bearer ${token}` }
        })
        
        if (!response.ok) throw new Error("Failed to fetch plans")
        const data = await response.json()
        setPlans(data)
      } catch (error) {
        toast.error(error.message)
      } finally {
        setLoading(false)
      }
    }

    fetchPlans()
  }, [])

  const handlePlanClick = (id: string) => {
    router.push(`/startBusiness/${id}`) // Use ID in the route
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black/40 backdrop-blur-sm">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent"
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg- bg-cover bg-center bg-no-repeat">
      <div className="min-h-screen bg-black/40 backdrop-blur-sm">
        <div className="container mx-auto py-20 px-4">
          {/* Cosmic Header */}
          <motion.div 
            className="relative h-[300px] mb-20 overflow-hidden rounded-3xl"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur" />
            <div className="relative h-full flex flex-col items-center justify-center text-white space-y-6">
              <motion.div
                animate={{ 
                  rotate: [0, 360],
                  scale: [1, 1.2, 1]
                }}
                transition={{ 
                  duration: 20,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
                className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_100%)]"
              />
              
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-center z-10"
              >
                <h1 className="text-6xl md:text-7xl font-bold mb-4">
                  Your Universe of Ideas
                </h1>
                <p className="text-xl text-white/80">Where dreams transform into reality</p>
              </motion.div>
            </div>
          </motion.div>

          {/* Interactive Plans Display */}
          <div className="grid gap-8 mb-20">
          {plans.map((plan, index) => {
    const emoji = getEmojiForTitle(plan.title)
    return (
      <motion.div
        key={plan.id} // Use ID as key
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: index * 0.2 }}
        onClick={() => handlePlanClick(plan.id)} // Pass ID instead of title
        onMouseEnter={() => setActiveIndex(index)}
        onMouseLeave={() => setActiveIndex(null)}
        className="group relative cursor-pointer"
      >
                  <div className={`
                    relative overflow-hidden rounded-2xl 
                    transition-all duration-700 ease-out
                    ${activeIndex === index ? 'h-64' : 'h-24'}
                  `}>
                    <div className={`absolute inset-0 bg-gradient-to-r from-violet-600/70 to-indigo-600/70 ${
                      activeIndex === index ? 'opacity-80' : 'opacity-60'
                    } transition-opacity duration-300`} />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.2),transparent_70%)]" />
                    <div className="relative h-full p-6 flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <span className="text-4xl">{emoji}</span>
                          <div>
                            <h3 className="text-2xl font-bold text-white">{plan.title}</h3>
                            <p className="text-white/70">Budget: ${plan.budget.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>

                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: activeIndex === index ? 1 : 0 }}
                        className="space-y-4"
                      >
                        <p className="text-white/90">{plan.description}</p>
                        <Button 
                          variant="outline" 
                          className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                        >
                          <Rocket className="mr-2 h-4 w-4" />
                          Explore Plan
                        </Button>
                      </motion.div>
                    </div>
                  </div>
                  <div className="absolute -inset-px rounded-2xl bg-gradient-to-r from-violet-500/40 to-indigo-500/40 opacity-0 group-hover:opacity-100 blur transition-all duration-500" />
                </motion.div>
              )
            })}
          </div>

          {/* Create New Experience */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <Button
              size="lg"
              onClick={() => setShowOptions(!showOptions)}
              className="relative px-8 py-6 bg-transparent border-2 border-white/20 rounded-2xl overflow-hidden group"
            >
              <span className="relative z-10 flex items-center gap-3 text-lg text-white">
                <Star className="h-6 w-6" />
                Start a New Adventure
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-indigo-600 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
            </Button>
          </motion.div>

          {/* Create Options */}
          <AnimatePresence>
    {showOptions && (
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className="mt-8 overflow-hidden"
      >
        <div className="grid gap-4 md:grid-cols-2 p-4 rounded-2xl bg-white/5 backdrop-blur">
          {creationOptions.map((option, index) => {
            const Icon = option.icon
            return (
              <motion.div
                key={option.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => router.push(option.path)}
                className="group relative p-6 rounded-xl cursor-pointer overflow-hidden"
              >
                <div className="relative z-10 space-y-4">
                  <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white">{option.title}</h3>
                  <p className="text-white/70">{option.description}</p>
                </div>
                
                <div className={`
                  absolute inset-0 opacity-0 group-hover:opacity-100
                  transition-opacity duration-500 bg-gradient-to-br ${option.color}
                `} />
              </motion.div>
            )
          })}
        </div>
      </motion.div>
    )}
  </AnimatePresence>
        </div>
      </div>
    </div>
  )
}