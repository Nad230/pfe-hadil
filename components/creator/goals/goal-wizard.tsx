"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Cookies from "js-cookie";

import { 
  Youtube, 
  Instagram, 
  Facebook, 
  Video, 
  ShoppingBag, 
  Presentation, 
  Palette,
  Newspaper,
  Sparkles,
  ArrowRight,
  Target,
  TrendingUp,
  DollarSign,
  Users,
  Clock,
  Heart,
  MessageCircle,
  Share2,
  Atom
} from "lucide-react"

type CreatorType = 'content' | 'influencer' | 'ecommerce' | 'educator' | 'artist' | 'news'
type Platform = 'youtube' | 'instagram' | 'tiktok' | 'facebook'

interface CreatorTypeOption {
  id: CreatorType
  title: string
  description: string
  icon: React.ElementType
  platforms: Platform[]
}

interface Goal {
  id: string
  title: string
  description: string
  icon: React.ElementType
  metrics: string[]
  platform: Platform
}

const creatorTypes: CreatorTypeOption[] = [
  {
    id: 'content',
    title: 'Content Creator',
    description: 'Videos, Reels & Short-form Content',
    icon: Video,
    platforms: ['youtube', 'tiktok', 'instagram', 'facebook']
  },
  {
    id: 'influencer',
    title: 'Influencer',
    description: 'Brand & Personal Growth',
    icon: Users,
    platforms: ['instagram', 'tiktok', 'facebook']
  },
  {
    id: 'ecommerce',
    title: 'E-commerce & Product Seller',
    description: 'Shoppable Posts & Affiliate Marketing',
    icon: ShoppingBag,
    platforms: ['instagram', 'facebook']
  },
  {
    id: 'educator',
    title: 'Educator',
    description: 'Courses, Webinars & Learning Content',
    icon: Presentation,
    platforms: ['youtube', 'facebook', 'instagram']
  },
  {
    id: 'artist',
    title: 'Artist & Designer',
    description: 'Showcase & Portfolio',
    icon: Palette,
    platforms: ['instagram', 'facebook']
  },
  {
    id: 'news',
    title: 'News & Information Provider',
    description: 'Threads & Short-form Content',
    icon: Newspaper,
    platforms: ['youtube', 'tiktok']
  }
]

const platformIcons = {
  youtube: Youtube,
  instagram: Instagram,
  tiktok: Atom,
  facebook: Facebook
}

const platformColors = {
  youtube: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-100",
  instagram: "bg-pink-100 text-pink-800 dark:bg-pink-900/50 dark:text-pink-100",
  tiktok: "bg-slate-100 text-slate-800 dark:bg-slate-900/50 dark:text-slate-100",
  facebook: "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-100"
}

const goals: Record<CreatorType, Goal[]> = {
  content: [
    {
      id: 'subscribers',
      title: 'Grow Subscribers',
      description: 'Build a loyal audience base',
      icon: Users,
      metrics: ['Subscriber count', 'Growth rate'],
      platform: 'youtube'
    },
    {
      id: 'watchtime',
      title: 'Increase Watch Time',
      description: 'Improve content retention',
      icon: Clock,
      metrics: ['Average view duration', 'Retention rate'],
      platform: 'youtube'
    },
    {
      id: 'engagement',
      title: 'Boost Engagement',
      description: 'Get more likes and comments',
      icon: Heart,
      metrics: ['Engagement rate', 'Comments per video'],
      platform: 'youtube'
    }
  ],
  influencer: [
    {
      id: 'followers',
      title: 'Gain Followers',
      description: 'Expand your reach',
      icon: Users,
      metrics: ['Follower count', 'Growth rate'],
      platform: 'instagram'
    },
    {
      id: 'engagement',
      title: 'Increase Engagement',
      description: 'Drive more interactions',
      icon: MessageCircle,
      metrics: ['Engagement rate', 'Comments per post'],
      platform: 'instagram'
    },
    {
      id: 'brandDeals',
      title: 'Secure Brand Deals',
      description: 'Monetize your influence',
      icon: DollarSign,
      metrics: ['Brand collaborations', 'Average deal value'],
      platform: 'instagram'
    }
  ],
  ecommerce: [
    {
      id: 'sales',
      title: 'Increase Sales',
      description: 'Drive more revenue',
      icon: DollarSign,
      metrics: ['Revenue', 'Conversion rate'],
      platform: 'instagram'
    },
    {
      id: 'traffic',
      title: 'Drive Traffic',
      description: 'Get more store visits',
      icon: TrendingUp,
      metrics: ['Click-through rate', 'Store visits'],
      platform: 'instagram'
    }
  ],
  educator: [
    {
      id: 'students',
      title: 'Grow Student Base',
      description: 'Expand your learning community',
      icon: Users,
      metrics: ['Student count', 'Course enrollments'],
      platform: 'youtube'
    },
    {
      id: 'engagement',
      title: 'Improve Engagement',
      description: 'Increase learning interaction',
      icon: MessageCircle,
      metrics: ['Comments', 'Live session attendance'],
      platform: 'youtube'
    }
  ],
  artist: [
    {
      id: 'portfolio',
      title: 'Showcase Work',
      description: 'Build your portfolio',
      icon: Palette,
      metrics: ['Portfolio views', 'Save rate'],
      platform: 'instagram'
    },
    {
      id: 'commissions',
      title: 'Get Commissions',
      description: 'Attract client work',
      icon: DollarSign,
      metrics: ['Inquiries', 'Commission value'],
      platform: 'instagram'
    }
  ],
  news: [
    {
      id: 'reach',
      title: 'Expand Reach',
      description: 'Grow your audience',
      icon: Share2,
      metrics: ['Views', 'Share rate'],
      platform: 'tiktok'
    },
    {
      id: 'credibility',
      title: 'Build Authority',
      description: 'Establish credibility',
      icon: Target,
      metrics: ['Citations', 'Expert mentions'],
      platform: 'tiktok'
    }
  ]
}




export function GoalWizard() {
  const [step, setStep] = useState(1)
  const [selectedType, setSelectedType] = useState<CreatorType | null>(null)
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null)
  const [selectedGoals, setSelectedGoals] = useState<string[]>([])
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const handleComplete = async () => {
      setIsSubmitting(true)
      setError(null)
      
      try {
        const token = Cookies.get("token");
        if (!token) throw new Error('Authentication required')
  
        // Get user ID
        const authResponse = await fetch("http://localhost:3000/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!authResponse.ok) throw new Error('Failed to authenticate')
        const authData = await authResponse.json()
        const userId = authData.sub
  
        // Get user profiles
        const profileResponse = await fetch(`http://localhost:3000/creator/profiles/user/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!profileResponse.ok) throw new Error('Failed to fetch profiles')
        const profiles = await profileResponse.json()
  
        // Find matching profile
        const selectedProfile = profiles.find((p: any) => 
          p.platform.toLowerCase() === selectedPlatform?.toLowerCase()
        )
        
        if (!selectedProfile) throw new Error('No profile found for selected platform')
        console.log("platform selected",selectedPlatform)
        // Create goals
        await Promise.all(selectedGoals.map(async (goalId) => {
          const goal = goals[selectedType!].find(g => g.id === goalId)
          if (!goal) return
  
          const goalData = {
            profileId: selectedProfile.id,
            creatorType: selectedType,
            platform: selectedPlatform,
            goalId: goal.id,
            title: goal.title,
            description: goal.description,
            metrics: goal.metrics,
            targetValue: 1000, // Replace with actual input
            deadline: new Date().toISOString(), // Replace with actual input
          }
  
          const response = await fetch('http://localhost:3000/creator-goals', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(goalData)
          })
  
          if (!response.ok) throw new Error('Failed to create goal')
        }))
  
        // Reset wizard on success
        setStep(1)
        setSelectedType(null)
        setSelectedPlatform(null)
        setSelectedGoals([])
        
      } catch (err) {
        console.error('Goal creation failed:', err)
        setError(err instanceof Error ? err.message : 'Failed to create goals')
      } finally {
        setIsSubmitting(false)
      }
    }
  
  const handleTypeSelect = (type: CreatorType) => {
    setSelectedType(type)
    setStep(2)
  }

  const handlePlatformSelect = (platform: Platform) => {
    setSelectedPlatform(platform)
    setStep(3)
  }

  const handleGoalToggle = (goalId: string) => {
    setSelectedGoals(prev => 
      prev.includes(goalId) 
        ? prev.filter(id => id !== goalId)
        : [...prev, goalId]
    )
  }



  return (
    <div className="space-y-8">
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold">What type of creator are you?</h2>
              <p className="text-muted-foreground">Let's personalize your growth journey</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {creatorTypes.map((type) => {
                const Icon = type.icon
                return (
                  <Card
                    key={type.id}
                    className="relative overflow-hidden cursor-pointer transition-all hover:shadow-lg"
                    onClick={() => handleTypeSelect(type.id)}
                  >
                    <CardContent className="pt-6">
                      <div className="absolute top-0 right-0 p-3">
                        <Icon className="h-6 w-6 text-muted-foreground/50" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="font-semibold text-lg">{type.title}</h3>
                        <p className="text-sm text-muted-foreground">{type.description}</p>
                        <div className="flex gap-1 pt-2">
                          {type.platforms.map(platform => {
                            const PlatformIcon = platformIcons[platform]
                            return (
                              <Badge 
                                key={platform}
                                variant="secondary" 
                                className={platformColors[platform]}
                              >
                                <PlatformIcon className="mr-1 h-3 w-3" />
                                {platform}
                              </Badge>
                            )
                          })}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </motion.div>
        )}

        {step === 2 && selectedType && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold">Choose your main platform</h2>
              <p className="text-muted-foreground">Where do you want to focus your growth?</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {creatorTypes.find(t => t.id === selectedType)?.platforms.map(platform => {
                const PlatformIcon = platformIcons[platform]
                return (
                  <Card
                    key={platform}
                    className={`
                      relative overflow-hidden cursor-pointer transition-all hover:shadow-lg
                      ${platformColors[platform]}
                    `}
                    onClick={() => handlePlatformSelect(platform)}
                  >
                    <CardContent className="pt-6 flex flex-col items-center text-center">
                      <PlatformIcon className="h-12 w-12 mb-4" />
                      <h3 className="font-semibold text-lg capitalize">{platform}</h3>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </motion.div>
        )}

{step === 3 && selectedType && selectedPlatform && (
        <motion.div
          key="step3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="space-y-6"
        >
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold">Set your goals</h2>
              <p className="text-muted-foreground">
                <Sparkles className="inline-block mr-2 h-4 w-4" />
                AI-recommended goals for your creator type
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {goals[selectedType]
                .filter(goal => goal.platform === selectedPlatform)
                .map((goal) => {
                  const Icon = goal.icon
                  const isSelected = selectedGoals.includes(goal.id)
                  return (
                    <Card
                      key={goal.id}
                      className={`
                        relative overflow-hidden cursor-pointer transition-all
                        ${isSelected ? 'ring-2 ring-primary shadow-lg' : 'hover:shadow-md'}
                      `}
                      onClick={() => handleGoalToggle(goal.id)}
                    >
                      <CardContent className="pt-6">
                        <div className="absolute top-0 right-0 p-3">
                          <Icon className={`h-6 w-6 ${isSelected ? 'text-primary' : 'text-muted-foreground/50'}`} />
                        </div>
                        <div className="space-y-4">
                          <div>
                            <h3 className="font-semibold text-lg">{goal.title}</h3>
                            <p className="text-sm text-muted-foreground">{goal.description}</p>
                          </div>
                          <div className="space-y-2">
                            <p className="text-sm font-medium">Key Metrics:</p>
                            <div className="flex flex-wrap gap-2">
                              {goal.metrics.map((metric, index) => (
                                <Badge key={index} variant="secondary">
                                  {metric}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
            </div>

            <div className="flex justify-center pt-4 flex-col items-center gap-4">
            <Button 
              size="lg"
              onClick={handleComplete}
              disabled={selectedGoals.length === 0 || isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <Atom className="h-4 w-4 animate-spin mr-2" />
                  Creating...
                </span>
              ) : (
                <>
                  Create Goals
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}