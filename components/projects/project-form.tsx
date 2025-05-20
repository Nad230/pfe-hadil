"use client"

import { useState, useEffect } from "react"
import { FileUpload } from "@/components/ui/file-upload"
import { Chip } from "@/components/ui/chip"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"
import { X, ClipboardList, Tags, Wallet, Image, Eye, Users, Target, Calendar, Globe, Rocket, Lightbulb, X as CloseIcon, Sparkles } from "lucide-react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { AddTeamDialog } from "./add-team-dialog"
import Cookies from "js-cookie";




const projectTypes = ["BUSINESS", "CREATIVE", "SOCIAL_IMPACT", "PERSONAL", "OTHER"] as const
const revenueModels = ["SUBSCRIPTION", "ONE_TIME_SALES", "ADS", "DONATIONS", "OTHER"] as const
const budgetRanges = ["LOW_1K_5K", "MID_5K_10K", "HIGH_10K_PLUS", "NOT_SURE"] as const
const timelines = ["SHORT_0_3_MONTHS", "MEDIUM_3_12_MONTHS", "LONG_1_PLUS_YEARS"] as const
const visibilityOptions = ["PUBLIC", "PRIVATE"] as const
const fundingSources = ["Bootstrapped", "Investor-backed", "Crowdfunded", "Other"] as const
const statuses = ["idea", "planning", "in_progress"] as const
const tags = [
  "Tech", "Finance", "Art", "Education", "Health", "Productivity",
  "Marketing", "SaaS", "AI", "Mobile", "Web", "E-commerce",
  "Sustainability", "IoT", "Blockchain", "Gaming", "Social",
  "Entertainment", "Travel", "Fitness", "Other"
] as const;
const steps = [
  {
    title: "Project Basics",
    description: "Let's start with the essentials",
    icon: ClipboardList,
    color: "text-indigo-500",
    emoji: "✨",
    subSteps: [
      {
        title: "Project Identity",
        fields: ["name","description"]
      },
      {
        title: "Project Overview",
        fields: ["type", "customType"]
      }
     
    ]
  },
  {
    title: "Vision & Details",
    description: "Tell us more about your goals",
    icon: Target,
    color: "text-emerald-500",
    emoji: "🎯",
    subSteps: [
      {
        title: "Project Tags",
        fields: ["tags"]
      }
    ]
  },
  
   {
    title: "Team & Timeline",
    description: "Planning and execution",
    icon: Users,
    color: "text-purple-500",
    emoji: "👥",
    subSteps: [
      {
        title: "Timeline & Status",
        fields: ["timeline", "status"]
      },
      {
        title: "Team & Date",
        fields: ["teamType", "teamMembers", "milestones", "visibility"]
      }
    ]
  },
  {
    title: "Review & Launch",
    description: "Finalize your project details",
    icon: Rocket,
    color: "text-rose-500",
    emoji: "🚀",
    subSteps: [
      {
        title: "Review Details",
        fields: ["review"]
      }
    ]
  }
]





interface FormData {
  id: string
  name: string
  type: typeof projectTypes[number] | ""
  description: string
  tags: string[]
  visionImpact: string
  impact: string
  revenueModel: typeof revenueModels[number] | ""
  budgetRange: typeof budgetRanges[number] | ""
  timeline: typeof timelines[number] | ""
  teamType: "Solo" | "Team"
  teamMembers: string[]
  visibility: typeof visibilityOptions[number]
  location: string
  media: File | null
  status: typeof statuses[number]
  collaborations: string
  fundingSource: typeof fundingSources[number] | ""
  estimatedCompletionDate: string // was String
  mainGoal:string
  planType: "Lite" | "Pro"
  strategyModel: "Lean Startup" | "Agile Sprint" | "MVP Focus" | "Custom Plan"
  customStrategy?: string
  customType?: string
  customRevenue?: string
}
interface AIAssistantProps {
  message: string
  onAccept: () => void
  onDismiss: () => void
  isLoading?: boolean
}

// Update the AIAssistant component
function AIAssistant({ message, onAccept, onDismiss, isLoading, packageType }: AIAssistantProps & { packageType?: string }) {
  const isAllowed = packageType && ["GOLD", "DIAMOND"].includes(packageType);
  const isSubscriptionError = message === "Upgrade to GOLD or DIAMOND for AI features";

  if (!isAllowed || isSubscriptionError) {
    return (
      <div className="fixed bottom-4 right-4 max-w-md bg-background border rounded-lg shadow-lg p-4 animate-in slide-in-from-right">
        <div className="flex items-start gap-3">
          <div className="bg-primary/10 p-2 rounded-full">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 space-y-2">
            <p className="text-sm">
              {message || "AI features require GOLD or DIAMOND subscription"}
            </p>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => window.location.href="/pricing"}>
                Upgrade Now
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={onDismiss}
                className="text-muted-foreground"
              >
                Dismiss
              </Button>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onDismiss}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }
  return (
    <div className="fixed bottom-4 right-4 max-w-md bg-background border rounded-lg shadow-lg p-4 animate-in slide-in-from-right">
      <div className="flex items-start gap-3">
        <div className="bg-primary/10 p-2 rounded-full">
          {isLoading ? (
            <span className="animate-pulse">...</span>
          ) : (
            <Sparkles className="h-5 w-5 text-primary" />
          )}
        </div>
        <div className="flex-1 space-y-2">
          <p className="text-sm">{message}</p>
          {!isLoading && (
            <div className="flex gap-2">
              <Button size="sm" onClick={onAccept}>
                Accept Suggestions
              </Button>
              <Button size="sm" variant="ghost" onClick={onDismiss}>
                Dismiss
              </Button>
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onDismiss}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}


interface ProjectFormProps {
  onSubmit: (data: any) => void; // Accepts a function to handle submission
}
export default function ProjectForm({ onSubmit }: ProjectFormProps) {
  
  

  
    const handleChange = (e: any) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    };
  const router = useRouter()
  const [input, setInput] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [open, setOpen] = useState(true)
  const [showAIAssistant, setShowAIAssistant] = useState(false)
  const [aiMessage, setAIMessage] = useState("")
  const [aiSuggestion, setAISuggestion] = useState<Partial<FormData>>({})
  const [activeStep, setActiveStep] = useState(0)
  const [activeSubStep, setActiveSubStep] = useState(0)
  const [showTeamSearch, setShowTeamSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [showTeamDialog, setShowTeamDialog] = useState(false);
  const [userPackage, setUserPackage] = useState< "SILVER" | "GOLD" | "DIAMOND">("SILVER");
  const [isLoadingPackage, setIsLoadingPackage] = useState(true);
  const [showAchievement, setShowAchievement] = useState(false)



  const [formData, setFormData] = useState<FormData>({
    name: "",
    type: "",
    description: "",
    tags: [],
    visionImpact: "",
    impact: "",
    revenueModel: "",
    budgetRange: "",
    timeline: "",
    teamType: "Solo",
    teamMembers: [],
    visibility: "PUBLIC",
    location: "",
    media: null,
    status: "planning",
    collaborations: "",
    fundingSource: "",
    estimatedCompletionDate: "",
    mainGoal: "",
    id:"",
    planType: "Lite"
  })

const [isAILoading, setIsAILoading] = useState(false)
const [hasSeenAIPrompt, setHasSeenAIPrompt] = useState(false);
const [currentUser, setCurrentUser] = useState<any>(null);


useEffect(() => {
  const fetchUserPackage = async () => {
    try {
      const token = Cookies.get("token");
      if (!token) {
        throw new Error("No token found");
      }

      // Fetch user details to get the ID
      const userResponse = await fetch("http://localhost:3000/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!userResponse.ok) {
        throw new Error("Failed to fetch user data");
      }

      const userData = await userResponse.json();
      const userId = userData.sub; // Adjust according to the actual response structure

      // Fetch the package using the user ID
      const packageResponse = await fetch(`http://localhost:3000/auth/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!packageResponse.ok) {
        throw new Error("Failed to fetch user package");
      }

      const packageData = await packageResponse.json();
      setUserPackage(packageData.packageType);
    } catch (error) {
      console.error("Failed to fetch user package:", error);
      toast.error("Failed to verify subscription");
    } finally {
      setIsLoadingPackage(false);
    }
  };

  fetchUserPackage();
}, []);

const fetchAISuggestions = async (field: keyof FormData | 'section') => {
  setIsAILoading(true);
  try {
    const response = await fetch('http://localhost:3000/ai/assist', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${Cookies.get("token")}`,
      },
      body: JSON.stringify({
        name: formData.name,
        description: formData.description
      }),
    });

    if (!response.ok) {
      if (response.status === 403) {
        throw new Error('subscription_required');
      }
      throw new Error('AI request failed');
    }

    const data = await response.json();
    return mapAISuggestionsToFormData(data);

  } catch (error) {
    console.error('AI Error:', error);
    
    if (error instanceof Error && error.message === 'subscription_required') {
      setShowAIAssistant(true);
      setAIMessage("Upgrade to GOLD or DIAMOND for AI features");
      return null;
    }
    
    toast.error('Failed to get AI suggestions');
    return null;
  } finally {
    setIsAILoading(false);
  }
};
const StrategyCard = ({ 
  title, 
  description,
  aiRole,
  selected,
  onSelect 
}: {
  title: string
  description: string
  aiRole: string
  selected: boolean
  onSelect: () => void
})  => (
  <motion.div 
    whileHover={{ scale: 1.02 }}
    className={`cursor-pointer border rounded-lg p-4 ${
      selected ? "border-primary bg-primary/10" : "hover:border-primary/50"
    }`}
    onClick={onSelect}
  >
    <div className="flex items-start gap-3">
      <div className="flex-1">
        <h3 className="font-semibold mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground mb-2">{description}</p>
        <div className="text-xs bg-primary/10 px-2 py-1 rounded-md">
          <span className="font-medium">AI Role:</span> {aiRole}
        </div>
      </div>
      <div className={`w-2 h-2 rounded-full ${selected ? "bg-primary" : "bg-muted"}`} />
    </div>
  </motion.div>
)


const mapAISuggestionsToFormData = (aiData: any): Partial<FormData> => {
  // Helper function to find matching enum value
  const findEnumMatch = <T extends readonly string[]>(value: string, options: T): T[number] | undefined => {
    const cleanValue = value.toLowerCase().replace(/[^a-z0-9]/g, '');
    return options.find(opt => opt.toLowerCase().replace(/[^a-z0-9]/g, '') === cleanValue);
  };


  const strategyOptions = ["Lean Startup", "Agile Sprint", "MVP Focus", "Custom Plan"] as const;
  const rawStrategy = aiData?.StrategyModel || '';
  const matchedStrategy = findEnumMatch(rawStrategy, strategyOptions);
  // Handle project type
  const rawProjectType = aiData?.Type || '';
  const matchedType = findEnumMatch(rawProjectType, projectTypes);
  const [type, customType] = matchedType 
    ? [matchedType, undefined] 
    : ['OTHER' as const, rawProjectType];

  // Handle revenue model
  const rawRevenueModel = aiData?.['Revenue Model'] || '';
  const rawRevenue = aiData?.['Revenue Model'] || '';
  const baseRevenueModel = rawRevenue.split('(')[0].trim();
  const matchedRevenue = findEnumMatch(baseRevenueModel, revenueModels);
  const [revenueModel, customRevenue] = matchedRevenue
    ? [matchedRevenue, undefined]
    : ['OTHER' as const, rawRevenueModel];

  // Handle tags - only allow predefined or 'Other'
 // Process tags - allow any tags but limit to 8 and clean formatting
 const rawTags = aiData?.Tags || [];
 const processedTags = rawTags
   .map((t: string) => {
     // Clean and format the tag
     const cleaned = t.trim()
       .replace(/[^a-zA-Z0-9- ]/g, '')
       .replace(/\s+/g, '-')
       .substring(0, 20);
     
     // Capitalize first letter of each word
     return cleaned.toLowerCase()
       .split(' ')
       .map(word => word.charAt(0).toUpperCase() + word.slice(1))
       .join(' ');
   })
   .filter((t: string) => t.length > 0)
   .slice(0, 8); // Limit to 8 tags
  return {
    type,
    customType,
    revenueModel,
    customRevenue,
    tags: processedTags,
    visionImpact: aiData?.VisionImpact || '',
    budgetRange: convertAIBudgetToEnum(aiData?.Budget),
    timeline: convertAITimelineToEnum(aiData?.Timeline),
    teamType: aiData?.Team === "Team" ? "Team" : "Solo",
    visibility: visibilityOptions.find(vo => vo === aiData?.Visibility?.toUpperCase()) || "PUBLIC",
    location: aiData?.Location || '',
    status: statuses.find(s => s === aiData?.Status?.toUpperCase()) || "IDEA",
    fundingSource: fundingSources.find(fs => fs === aiData?.['Funding Source']) || "",
    estimatedCompletionDate: aiData?.CompletionDate,
    impact: aiData?.Impact || '',
    collaborations:aiData.Collaborations || '',
    media:aiData.Media,
    strategyModel: matchedStrategy || "Custom Plan",
    customStrategy: !matchedStrategy ? rawStrategy : undefined,
    mainGoal:aiData.MainGoal,
    description: aiData?.Description || formData.description
  };
};

// Modified mapAISuggestionsToFormData

// Enhanced conversion functions
const convertAIBudgetToEnum = (budget?: string) => {
  const amount = parseInt(budget?.replace(/[^0-9]/g, '') || '0')
  if (amount <= 5000) return "LOW_1K_5K"
  if (amount <= 10000) return "MID_5K_10K"
  if (amount > 10000) return "HIGH_10K_PLUS"
  return "NOT_SURE"
}

const convertAITimelineToEnum = (timeline?: string) => {
  const months = parseInt(timeline?.match(/\d+/)?.[0] || '0')
  if (months <= 3) return "SHORT_0_3_MONTHS"
  if (months <= 12) return "MEDIUM_3_12_MONTHS"
  return "LONG_1_PLUS_YEARS"
}

// Modified useEffect for initial suggestions
// Add this useEffect hook
useEffect(() => {
  const shouldShowAIPrompt = 
    !hasSeenAIPrompt &&
    activeStep === 0 && 
    activeSubStep === 1 && 
    formData.name && 
    formData.description;

  if (shouldShowAIPrompt) {
    const fetchInitialSuggestions = async () => {
      const suggestions = await fetchAISuggestions('section');
      if (suggestions) {
        setAIMessage("Would you like AI to complete the rest of the form?");
        setAISuggestion(suggestions);
        setShowAIAssistant(true);
        setHasSeenAIPrompt(true);
      }
    };
    fetchInitialSuggestions();
  }
}, [activeStep, activeSubStep, formData.name, formData.description, hasSeenAIPrompt]);


  
 
  const handleInputChange = async (name: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  
    // Only show suggestions after first section
    
    }
  
  
  const handleTagSelection = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }))
  }
  

  const handleFileUpload = (files: File[]) => {
    if (files.length > 0) {
      handleInputChange("media", files[0])
    }
  }

 

  const handleAddTeamMember = (userId: string) => {
    setFormData(prev => ({
      ...prev,
      teamMembers: [...prev.teamMembers, userId]
    }))
  }

  
  const handleRemoveTeamMember = (userId: string) => {
    setFormData(prev => ({
      ...prev,
      teamMembers: prev.teamMembers.filter(id => id !== userId)
    }))
  }

  

  const handleNext = () => {
    const currentStep = steps[activeStep]
    if (activeSubStep < currentStep.subSteps.length - 1) {
      setActiveSubStep(prev => prev + 1)
    } else {
      setActiveStep(prev => prev + 1)
      setActiveSubStep(0)
    }
  }

  const handleBack = () => {
    if (activeSubStep > 0) {
      setActiveSubStep(prev => prev - 1)
    } else if (activeStep > 0) {
      setActiveStep(prev => prev - 1)
      setActiveSubStep(steps[activeStep - 1].subSteps.length - 1)
    }
  }
  const handleAcceptAISuggestion = () => {
    if (!aiSuggestion) return;
    
    setFormData(prev => ({
      ...prev,
      ...aiSuggestion,
      name: prev.name,
      description: prev.description
    }));
  
    setShowAIAssistant(false);
    toast.success("AI suggestions applied!");
  };
 

  const renderStepIndicator = () => {
    const currentStep = steps[activeStep]
    const Icon = currentStep.icon
    const currentSubStep = currentStep.subSteps[activeSubStep]
    
    return (
      <div className="mb-8 max-w-xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4"
        >
          <div className={`p-3 rounded-full bg-opacity-10 ${currentStep.color.replace('text-', 'bg-')}`}>
            <span className="text-xl mr-2">{currentStep.emoji}</span>
            <Icon className={`w-6 h-6 ${currentStep.color}`} />
          </div>
          <div>
            <h2 className={`text-lg font-semibold ${currentStep.color}`}>
              Step {activeStep + 1}.{activeSubStep + 1}: {currentSubStep.title}
            </h2>
            <p className="text-sm text-muted-foreground">
              {currentStep.description}
            </p>
          </div>
        </motion.div>
        <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className={`h-full ${currentStep.color.replace('text-', 'bg-')}`}
            initial={{ width: 0 }}
            animate={{ 
              width: `${((activeStep * steps[0].subSteps.length + activeSubStep + 1) / 
                (steps.length * steps[0].subSteps.length)) * 100}%` 
            }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>
    )
  }
  

  const renderTeamSection = () => (
    <div className="space-y-2">
      <Label className="text-lg font-semibold text-purple-600 dark:text-purple-400 flex items-center gap-2">
        <span>👥 Team</span>
      </Label>
      <Select
        value={formData.teamType}
        onValueChange={value => {
          handleInputChange("teamType", value as "Solo" | "Team");
          if (value === "Solo") handleInputChange("teamMembers", []);
        }}
      >
        <SelectTrigger>
          <SelectValue placeholder="Are you working alone or with a team?" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Solo">Solo</SelectItem>
          <SelectItem value="Team">Team</SelectItem>
        </SelectContent>
      </Select>
  
      {formData.teamType === "Team" && (
        <div className="space-y-2">
          <Button
            variant="outline"
            onClick={() => setShowTeamDialog(true)} // Changed from setShowTeamSearch
            className="w-full"
          >
            {formData.teamMembers.length > 0 ? "Manage Team" : "Add Team Members"}
          </Button>
  
<AddTeamDialog
  open={showTeamDialog}
  onOpenChange={setShowTeamDialog}
  onTeamCreated={(teamData) => {
    handleInputChange("teamMembers", teamData.members);
    handleInputChange("teamName", teamData.name);
    handleInputChange("teamDescription", teamData.description);
  }}
  projectId={formData.id} // Pass this after project creation
/>
        </div>
      )}
    </div>
  );

  const renderStep = () => {
    const fadeIn = {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -20 }
    }

    const currentStep = steps[activeStep]
    const currentSubStep = currentStep.subSteps[activeSubStep]
    const fields = currentSubStep.fields

    return (
      <motion.div 
        className="space-y-6 max-w-xl mx-auto"
        {...fadeIn}
      >
        <div className="space-y-4">
          {fields.includes("name") && (
            <div className="space-y-2">
              <Label className="text-lg font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
                <span>✨ Project Name</span>
              </Label>
              <Input
                value={formData.name}
                onChange={e => handleInputChange("name", e.target.value)}
                placeholder="What is the name of your project?"
                className="text-lg"
              />
            </div>
          )}
            {fields.includes("description") && (
            <div className="space-y-2">
              <Label className="text-lg font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
                <span>📝 Project Description</span>
              </Label>
              <Textarea
                value={formData.description}
                onChange={e => handleInputChange("description", e.target.value)}
                placeholder="Briefly describe your project in one or two sentences"
                className="min-h-[100px]"
              />
            </div>
          )}
          
          {fields.includes("tags") && (
  <div className="space-y-2">
    <Label className="text-lg font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
      <span>🏷️ Project Tags</span>
    </Label>
    <div className="flex flex-wrap gap-2">
      {/* Predefined tags */}
      {tags.map(tag => (
        <Chip
          key={tag}
          variant={formData.tags.includes(tag) ? "default" : "outline"}
          onClick={() => handleTagSelection(tag)}
          className={formData.tags.includes(tag) 
            ? "bg-indigo-500 hover:bg-indigo-600 text-white"
            : "hover:border-indigo-500"
          }
        >
          {tag}
        </Chip>
      ))}
      
      {/* Custom tags input */}
      <div className="relative">
        <Input
          placeholder="Add custom tag..."
          className="w-[150px] h-8"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              const newTag = e.currentTarget.value.trim();
              if (newTag) {
                handleTagSelection(newTag);
                e.currentTarget.value = '';
              }
            }
          }}
        />
        <span className="absolute right-2 top-1.5 text-muted-foreground text-sm">
          ↵
        </span>
      </div>
    </div>
    
    {/* Display selected custom tags */}
    <div className="flex flex-wrap gap-2">
      {formData.tags
        .filter(t => !tags.includes(t as any))
        .map(tag => (
          <Chip
            key={tag}
            variant="default"
            onClick={() => handleTagSelection(tag)}
            className="bg-indigo-500 hover:bg-indigo-600 text-white"
          >
            {tag}
          </Chip>
        ))}
    </div>
  </div>
)}
{fields.includes("visibility") && (
  <div className="space-y-2">
    <Label className="text-lg font-semibold text-purple-600 dark:text-purple-400 flex items-center gap-2">
      <span>👀 Visibility</span>
    </Label>
    <Select
      value={formData.visibility}
      onValueChange={value => handleInputChange("visibility", value)}
    >
      <SelectTrigger>
        <SelectValue placeholder="Select visibility" />
      </SelectTrigger>
      <SelectContent>
        {visibilityOptions.map(option => (
          <SelectItem key={option} value={option}>
            {option.replace(/_/g, " ")}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
    {formData.visibility === "PUBLIC" && (
      <p className="text-sm text-muted-foreground">
        This project will be shown in your profile.
      </p>
    )}
    {formData.visibility === "PRIVATE" && (
      <p className="text-sm text-muted-foreground">
        This project will not be shown in your profile.
      </p>
    )}
    {formData.visibility === "INVITE_ONLY" && (
      <p className="text-sm text-muted-foreground">
        Only invited members can view this project.
      </p>
    )}
  </div>
)}

          {fields.includes("type") && (
            <div className="space-y-2">
              <Label className="text-lg font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
                <span>🎯 Project Type</span>
              </Label>
              <Select
                value={formData.type}
                onValueChange={value => handleInputChange("type", value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="What type of project are you building?" />
                </SelectTrigger>
                <SelectContent>
                  {projectTypes.map(type => (
                    <SelectItem key={type} value={type}>
                      {type.replace(/_/g, " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formData.type === "OTHER" && fields.includes("customType") && (
                <Textarea
                  value={formData.customType}
                  onChange={e => handleInputChange("customType", e.target.value)}
                  placeholder="Tell us more about your unique project type..."
                  className="mt-2"
                />
              )}
            </div>
          )}


       
      
          {fields.includes("timeline") && (
            <div className="space-y-2">
              <Label className="text-lg font-semibold text-purple-600 dark:text-purple-400 flex items-center gap-2">
                <span>⏱️ Timeline</span>
              </Label>
              <Select
                value={formData.timeline}
                onValueChange={value => handleInputChange("timeline", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="How long do you expect this project to take?" />
                </SelectTrigger>
                <SelectContent>
                  {timelines.map(timeline => (
                    <SelectItem key={timeline} value={timeline}>
                      {timeline.replace(/_/g, " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

         

          {fields.includes("teamType") && renderTeamSection()}

          {fields.includes("milestones") && (
  <div className="space-y-2">
    <Label className="text-lg font-semibold text-purple-600 dark:text-purple-400 flex items-center gap-2">
      <span>📅 Completion Date</span>
    </Label>
    <Input
  type="date"
  name="estimatedCompletionDate"
  value={
    formData.estimatedCompletionDate &&
    !isNaN(new Date(formData.estimatedCompletionDate).getTime()) 
      ? new Date(formData.estimatedCompletionDate).toISOString().split('T')[0] 
      : ''
  }
  onChange={e => handleInputChange(
    "estimatedCompletionDate", 
    new Date(e.target.value).toISOString()
  )}
  min={new Date().toISOString().split('T')[0]}
/>

  </div>
)}
 {fields.includes("review") && (
    <div className="space-y-4">
      <h3 className="text-xl font-bold">Project Summary</h3>
      <div className="space-y-2">
        <p><strong>Name:</strong> {formData.name}</p>
        <p><strong>Description:</strong> {formData.description}</p>
        <p><strong>Team:</strong> {formData.teamMembers.join(", ")}</p>
        <p><strong>Target Completion:</strong> {formData.estimatedCompletionDate}</p>
      </div>
    </div>
  )}
       
          
        </div>
      </motion.div>
    )
  }
 

  return (
    <Card className="max-w-4xl mx-auto">
      <CardContent className="pt-6">
        {renderStepIndicator()}

        <AnimatePresence mode="wait">
          <div className="mt-8">{renderStep()}</div>
        </AnimatePresence>
        {isAILoading && (
          <div className="fixed bottom-4 right-4 max-w-md bg-background border rounded-lg shadow-lg p-4">
            <div className="flex items-center gap-2 text-sm">
              <span className="animate-pulse">🤖 Analyzing your project...</span>
            </div>
          </div>
        )}

<div className="flex justify-between mt-8 max-w-xl mx-auto">
  {(activeStep > 0 || activeSubStep > 0) && (
    <Button variant="outline" onClick={handleBack} className="px-8">
      Back
    </Button>
  )}
  
  {activeStep < steps.length - 1 || 
  activeSubStep < steps[activeStep].subSteps.length - 1 ? (
    <Button
    className={`ml-auto px-8 ${
      activeStep === 0 ? "bg-indigo-500 hover:bg-indigo-600" :
      activeStep === 1 ? "bg-emerald-500 hover:bg-emerald-600" :
      "bg-purple-500 hover:bg-purple-600"
    }`}
    onClick={handleNext}
  >
        Next
    </Button>
  ) : (
    <Button
      className="ml-auto px-8 bg-rose-500 hover:bg-rose-600"
      onClick={() => onSubmit(formData)}
    >
      Launch Project 🚀
    </Button>
  )}
</div>

      
        {showAIAssistant && !isLoadingPackage && (
  <AIAssistant
    message={aiMessage}
    onAccept={handleAcceptAISuggestion}
    onDismiss={() => {
      setShowAIAssistant(false);
      setHasSeenAIPrompt(true);
    }}
    isLoading={isAILoading}
    packageType={userPackage}
  />
)}
    
      </CardContent>
    </Card>
  )


}