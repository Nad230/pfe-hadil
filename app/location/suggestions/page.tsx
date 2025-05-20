"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Brain, Sparkles, ArrowRight, Building2, Users, Coins, Clock, TrendingUp, Star, Activity, CalendarClock, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import Cookies from "js-cookie"
import { toast } from "sonner"
interface JobSuggestion {
  id: string;
  title: string;
  description: string;
  why: string;
  bonus: string;
  difficulty: string;
  timeToProfit: string;
  icon: string;
  estimatedCost?: number;   // if you later add it
  status?: string;
  
  color: string;
}



const iconMap: { [key: string]: any } = {
  Building2,
  Users,
  TrendingUp,
  Star,
  Activity,
  CalendarClock
}

export default function SuggestionsPage() {
  const [aiSuggestions, setAiSuggestions] = useState<JobSuggestion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(null)
  const [location, setLocation] = useState<{ city?: string; country?: string }>({})
  const router = useRouter()
  const [expandedSuggestion, setExpandedSuggestion] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingMessage, setProcessingMessage] = useState("")
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const token = Cookies.get("token");
        
        // 1. First check nearby locations
        const nearbyResponse = await fetch('http://localhost:3000/userlocation/location/nearby', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (nearbyResponse.ok) {
          const nearbyData = await nearbyResponse.json();
          if (nearbyData.length > 0) {
            // Handle nearby locations logic here
            // For example: router.push("/nearby-locations-page");
            return;
          }
        }
  
        const res = await fetch(`http://localhost:3000/project-offline-ai/workadvice?count`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!res.ok) throw new Error("Failed to fetch suggestions")
        
        const data = await res.json()
        
        const processed = data.map((item, i) => ({
          id: String(i),
          title: item.title,
          description: item.description,
          why: item.whyItFits,
          bonus: item.bonusTip,
          difficulty: item.difficulty,
          timeToProfit: item.timeToProfit,
          icon: "Star",                 // pick any default or map later
          color: "from-primary to-blue-600",
        }));
      setAiSuggestions(processed);

        setAiSuggestions(processed)
      } catch (error) {
        console.error("Error fetching suggestions:", error)
      } finally {
        setIsLoading(false)
      }
    }

    const savedLocation = localStorage.getItem("selectedLocation")
    if (savedLocation) setLocation(JSON.parse(savedLocation))

      fetchData();
    }, []);


    const handleSelect = async (suggestionId: string) => {
      const picked = aiSuggestions.find((s) => s.id === suggestionId);
      if (!picked) return;
    
      try {
        setIsProcessing(true);
        setProcessingMessage("Saving your business plan...");
        
        // 1. Save the business plan and get its ID
        const businessPlan = await savePlan(picked);
        
        // 2. Get user location data for BudgetRange
        setProcessingMessage("Fetching budget details...");
        const token = Cookies.get("token");
        const locRes = await fetch("http://localhost:3000/userlocation/location", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!locRes.ok) throw new Error("Failed to fetch location details");
        const locationData = await locRes.json();
        
        // 3. Call the final advice API
        setProcessingMessage("AI is optimizing your plan...");
        const adviceRes = await fetch(
          `http://localhost:3000/project-offline-ai/plandvice?BudgetRange=${locationData.BudgetRange}&BusinessesId=${businessPlan.id}`,
          {     method: 'POST',
            headers: { Authorization: `Bearer ${token}` } }
        );
        
        if (!adviceRes.ok) throw new Error("Failed to optimize plan");
        
        // 4. Navigate to start business page using replace
        router.replace("/startBusiness");
        
      } catch (err) {
        console.error(err);
        toast.error(err instanceof Error ? err.message : "Failed to complete process");
      } finally {
        setIsProcessing(false);
      }
    };
    
    
    // Modified savePlan function to return the created plan
    const savePlan = async (plan: JobSuggestion) => {
      const token = Cookies.get("token")
      if (!token) throw new Error("Authentication required")
    
      const locRes = await fetch("http://localhost:3000/userlocation/location", {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!locRes.ok) throw new Error("Failed to fetch location")
      const location = await locRes.json()
    
      const planRes = await fetch("http://localhost:3000/business-plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          UserLocationId: location.id,
          title: plan.title,
          description: plan.description,
          whyItFits: plan.why,
          bonusTip: plan.bonus,
          difficulty: plan.difficulty,
          timeToProfit: plan.timeToProfit,
          estimatedCost: plan.estimatedCost ?? null,
          status: plan.status ?? "DRAFT",
        }),
      })
    
      if (!planRes.ok) {
        const error = await planRes.json()
        throw new Error(error.message || "Failed to save business plan")
      }
    
      return planRes.json()
    }
    
    // Add this loading state above the main return
    if (isProcessing) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center space-y-4">
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 180, 360]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="w-20 h-20 mx-auto"
            >
              <Brain className="w-full h-full text-primary" />
            </motion.div>
            <h2 className="text-2xl font-bold">Finalizing Your Perfect Plan...</h2>
            <p className="text-muted-foreground">
              {processingMessage || "Applying AI optimizations..."}
            </p>
          </div>
        </div>
      )
    }
    

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="w-20 h-20 mx-auto"
          >
            <Brain className="w-full h-full text-primary" />
          </motion.div>
          <h2 className="text-2xl font-bold">Analyzing Your Perfect Match...</h2>
          <p className="text-muted-foreground">
            Our AI is finding the best opportunities in your area
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[url('https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200&q=80')] bg-cover bg-center bg-no-repeat">
      <div className="min-h-screen bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="w-full max-w-5xl space-y-8">
          <div className="text-center space-y-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.8 }}
              className="w-20 h-20 bg-primary/10 rounded-full mx-auto flex items-center justify-center"
            >
              <Sparkles className="h-10 w-10 text-primary" />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-2"
            >
              <h1 className="text-4xl font-bold tracking-tight">
                AI-Powered Suggestions for {location.city}
              </h1>
              <p className="text-muted-foreground text-lg">
                Based on your location and preferences, here are your top matches
              </p>
            </motion.div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {aiSuggestions.map((suggestion, index) => {
              const Icon = iconMap[suggestion.icon]
              const isExpanded = expandedSuggestion === suggestion.id

              return (
                <motion.div
                  key={suggestion.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card
                    onClick={() => setExpandedSuggestion(isExpanded ? null : suggestion.id)}
                    className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg cursor-pointer group h-full ${
                      isExpanded ? "ring-2 ring-primary" : ""
                    }`}
                  >
                    <CardContent className="p-6 space-y-6">
                      <div className={`absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-300 ${suggestion.color}`} />
                      
                      <div className="relative space-y-4">
                        <div className="flex items-center justify-between">
                          <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${suggestion.color} flex items-center justify-center`}>
                            <Icon className="h-6 w-6 text-white" />
                          </div>
                          <div className="px-3 py-1 text-sm rounded-full bg-muted/50">
                            {suggestion.difficulty}
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="text-xl font-semibold">{suggestion.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {suggestion.description}
                          </p>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{suggestion.timeToProfit}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Activity className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">Potential: {suggestion.difficulty}</span>
                          </div>
                        </div>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="space-y-2"
                            >
                              <h4 className="text-sm font-medium">Why this matches you:</h4>
                              <ul className="text-sm text-muted-foreground space-y-1">
                                {suggestion.why.split(". ").map((reason, i) => (
                                  <li key={i} className="flex items-center gap-2">
                                    <div className="w-1 h-1 rounded-full bg-primary" />
                                    {reason}
                                  </li>
                                ))}
                              </ul>
                              <p className="text-sm text-muted-foreground mt-2">
                                <span className="font-medium">Pro Tip:</span> {suggestion.bonus}
                              </p>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        <div className="flex gap-2">
                          <Button
                            variant="link"
                            className="text-primary px-0"
                            onClick={(e) => {
                              e.stopPropagation()
                              setExpandedSuggestion(isExpanded ? null : suggestion.id)
                            }}
                          >
                            {isExpanded ? "Show Less" : "Show More"}
                          </Button>
                          
                          <Button
  className="ml-auto"
  onClick={async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isNavigating) {
      setIsNavigating(true);
      await handleSelect(suggestion.id);
      setIsNavigating(false);
    }
  }}
  disabled={isNavigating}
>
  {isNavigating ? (
    <>
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      Processing...
    </>
  ) : (
    <>
      Choose Plan
      <ArrowRight className="ml-2 h-4 w-4" />
    </>
  )}
</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}