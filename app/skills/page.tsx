"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Code2, Palette, Globe, Database, Server, Brain, Plus, Sparkles } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation" // Added router import

import Cookies from "js-cookie"
import { Select, SelectContent, SelectItem ,SelectTrigger,SelectValue} from "@/components/ui/select"

interface Skill {
  id: string
  name: string
  icon: typeof Code2
  color: string
  categories: string[]
}

const skillCategories = [
  {
    id: "frontend",
    name: "Frontend Development",
    icon: Code2,
    color: "from-blue-500 to-cyan-500",
    skills: ["React", "Vue", "Angular", "HTML/CSS", "JavaScript", "TypeScript"]
  },
  {
    id: "design",
    name: "Design",
    icon: Palette,
    color: "from-purple-500 to-pink-500",
    skills: ["UI/UX", "Graphic Design", "Motion Design", "Brand Identity", "Web Design"]
  },
  {
    id: "web",
    name: "Web Development",
    icon: Globe,
    color: "from-green-500 to-emerald-500",
    skills: ["Node.js", "PHP", "Python", "Ruby", "Java"]
  },
  {
    id: "database",
    name: "Database",
    icon: Database,
    color: "from-amber-500 to-orange-500",
    skills: ["MySQL", "PostgreSQL", "MongoDB", "Redis", "Firebase"]
  },
  {
    id: "backend",
    name: "Backend Development",
    icon: Server,
    color: "from-red-500 to-rose-500",
    skills: ["API Development", "Microservices", "Cloud Services", "DevOps", "Security"]
  },
  {
    id: "ai",
    name: "AI & ML",
    icon: Brain,
    color: "from-indigo-500 to-violet-500",
    skills: ["Machine Learning", "Deep Learning", "NLP", "Computer Vision", "Data Science"]
  }
]


export default function SkillsPage() {
  const router = useRouter() // Initialize router
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [customSkill, setCustomSkill] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [country, setCountry] = useState("")
  const [continent, setContinent] = useState("")
  const [isNavigating, setIsNavigating] = useState(false)
  
  const continents = [
    "Africa",
    "Asia",
    "Europe",
    "North America",
    "South America",
    "Australia/Oceania",
    "Antarctica"
  ]
  const handleSkillToggle = (skill: string) => {
    setSelectedSkills(prev => 
      prev.includes(skill) 
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    )
  }

  const handleAddCustomSkill = () => {
    if (!customSkill.trim()) return
    if (selectedSkills.includes(customSkill.trim())) {
      toast.error("This skill is already added!")
      return
    }
    setSelectedSkills(prev => [...prev, customSkill.trim()])
    setCustomSkill("")
    toast.success("Custom skill added!")
  }

  const determinePlatform = (url: string) => {
    if (url.includes('linkedin.com')) return 'LinkedIn'
    if (url.includes('fiverr.com')) return 'Fiverr'
    if (url.includes('upwork.com')) return 'Upwork'
    return 'Local'
  }

  const handleSearch = async () => {
    if (selectedSkills.length === 0) {
      toast.error("Please select at least one skill!")
      return
    }
    
    setIsSearching(true)
    setIsNavigating(true)
    
    try {
      const token = Cookies.get("token")
      const skillsQuery = selectedSkills.join(',')

      const queryParams = new URLSearchParams({
        skills: skillsQuery,
        country: country.trim(),
        continent: continent.trim()
      }).toString()

      const response = await fetch(
        `http://localhost:3000/project-offline-ai/job-search/reallife?${queryParams}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to fetch opportunities')
      }

      // Use router push instead of window.location
      await router.push("/skills/opportunities")
      router.refresh() // Ensure client cache updates
      
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch opportunities')
      console.error('Error:', error)
    } finally {
      setIsSearching(false)
      setIsNavigating(false)
    }
  }


  return (
    <div className="min-h-screen bg-[url('https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=1200&q=80')] bg-cover bg-center bg-no-repeat">
    <div className="min-h-screen bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-4xl space-y-8">
          <div className="text-center space-y-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.8 }}
              className="w-20 h-20 bg-primary/10 rounded-full mx-auto flex items-center justify-center"
            >
              <Sparkles className="h-10 w-10 text-primary" />
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl font-bold tracking-tight"
            >
              What skills can you offer? 🚀
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-muted-foreground text-lg"
            >
              Select your tech and design skills to find the perfect opportunities
            </motion.p>
          </div>

          <Card>
            <CardContent className="p-6 space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                {skillCategories.map((category, index) => {
                  const Icon = category.icon
                  return (
                    <motion.div
                      key={category.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${category.color} flex items-center justify-center`}>
                            <Icon className="h-4 w-4 text-white" />
                          </div>
                          <h3 className="font-semibold">{category.name}</h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {category.skills.map(skill => (
                            <Badge
                              key={skill}
                              variant={selectedSkills.includes(skill) ? "default" : "outline"}
                              className="cursor-pointer hover:shadow-md transition-all"
                              onClick={() => handleSkillToggle(skill)}
                            >
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Add Custom Skills</h3>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter a custom skill..."
                    value={customSkill}
                    onChange={(e) => setCustomSkill(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddCustomSkill()}
                  />
                  <Button onClick={handleAddCustomSkill}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Location Inputs */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Country</label>
                  <Input
                    placeholder="Enter your country..."
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Continent</label>
                  <Select value={continent} onValueChange={setContinent}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select continent" />
                    </SelectTrigger>
                    <SelectContent>
                      {continents.map((continent) => (
                        <SelectItem 
                          key={continent} 
                          value={continent.toLowerCase()}
                        >
                          {continent}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>


              <div className="space-y-4">
                <h3 className="font-semibold">Selected Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedSkills.length === 0 ? (
                    <p className="text-muted-foreground">No skills selected yet</p>
                  ) : (
                    selectedSkills.map(skill => (
                      <Badge
                        key={skill}
                        variant="default"
                        className="cursor-pointer hover:bg-destructive"
                        onClick={() => handleSkillToggle(skill)}
                      >
                        {skill} ×
                      </Badge>
                    ))
                  )}
                </div>
              </div>

              <Button
      className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
      size="lg"
      onClick={handleSearch}
      disabled={isSearching || isNavigating} // Update disabled state
    >
      {isSearching || isNavigating ? (
        <>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="mr-2"
          >
            <Sparkles className="h-4 w-4" />
          </motion.div>
          {isSearching ? "Finding Opportunities..." : "Redirecting..."}
        </>
      ) : (
        <>
          <Sparkles className="mr-2 h-4 w-4" />
          Find Opportunities
        </>
      )}
    </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}