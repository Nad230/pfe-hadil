"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Instagram,
  Youtube,
  Facebook,
  MessageCircle,
  Image as ImageIcon,
  Video,
  Music,
  ChevronRight,
  Sparkles,
  Hash,
  FileText,
  Copy,
  RefreshCw,
  Briefcase,
  Users,
  Heart,
  Megaphone
} from "lucide-react"
import Cookies from 'js-cookie'

const platforms = [
  { id: "instagram", name: "Instagram", icon: Instagram, color: "text-pink-500" },
  { id: "youtube", name: "YouTube", icon: Youtube, color: "text-red-500" },
  { id: "facebook", name: "Facebook", icon: Facebook, color: "text-blue-500" },
  { id: "tiktok", name: "TikTok", icon: MessageCircle, color: "text-black dark:text-white" }
]

const postTypes = [
  { id: "product", name: "Promote a Product", icon: Briefcase },
  { id: "growth", name: "Grow Followers", icon: Users },
  { id: "entertain", name: "Entertain", icon: Heart },
  { id: "life", name: "Share Life Moment", icon: Sparkles },
  { id: "announce", name: "Announce Something", icon: Megaphone }
]

const contentTypes = [
  { id: "caption", label: "Caption", icon: FileText },
  { id: "hashtags", label: "Hashtags", icon: Hash },
  { id: "image", label: "Image", icon: ImageIcon },
  { id: "video", label: "Video", icon: Video },
  { id: "content ideas", label: "Content Ideas", icon: Sparkles },
  { id: "audio", label: "Audio / Voiceover", icon: Music }
]
interface GeneratedContent {
  caption?: string
  hashtags?: string[]
  imagePrompt?: string
  generatedImage?: string // base64 string for images
  videoIdea?: string
  contentIdeas?: string[]
  audioSuggestion?: string
}

export default function AdvancedAIAssistantPage() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    platform: "",
    postType: "",
    keyword: "",
    tone: "professional", // Added tone field
    selectedContent: [] as string[],
    useTrends: false
  })
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent>({})
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState("")

  const handleNext = () => {
    if (step < 4) setStep(step + 1)
    else generateContent()
  }
  const generateContent = async () => {
    setIsGenerating(true)
    setError("")
    
    try {
      const token = Cookies.get('token')
      
      const goalMap: Record<string, string> = {
        'product': 'promote a product',
        'growth': 'grow followers',
        'entertain': 'entertain',
        'life': 'share life moment',
        'announce': 'announce something'
      }
  
      const requestBody = {
        goal: goalMap[formData.postType] || 'promote a product',
        platform: formData.platform,
        topic: formData.keyword,
        tone: formData.tone,
        contentType: formData.selectedContent[0]
      }
  
      const response = await fetch('http://localhost:3000/creator-ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      })
  
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`)
      }
  
      const data = await response.json()
      console.log('API Response:', data) // Debug log
      
      const transformedData: GeneratedContent = {}
      
      // Handle different response structures based on content type
      switch(requestBody.contentType) {
        case 'caption':
          // Handle both string and object responses
          if (typeof data.generatedText === 'string') {
            transformedData.caption = data.generatedText
          } else if (data.generatedText?.text) {
            transformedData.caption = data.generatedText.text
          } else {
            transformedData.caption = data.caption || ''
          }
          break
        case 'hashtags':
          // Handle both string and object responses
          const hashtagsText = typeof data.generatedText === 'string' 
            ? data.generatedText 
            : data.generatedText?.text || data.hashtags
          transformedData.hashtags = hashtagsText?.split(' ') || []
          break
        case 'image':
          // Handle the nested response format
          if (data.generatedText?.image) {
            transformedData.generatedImage = data.generatedText.image
            transformedData.imagePrompt = `AI generated image (seed: ${data.generatedText.seed})`
          } else if (data.image) {
            transformedData.generatedImage = data.image
          }
          break
        case 'video':
          transformedData.videoIdea = typeof data.generatedText === 'string'
            ? data.generatedText
            : data.generatedText?.text || data.videoIdea
          break
          case 'content ideas':
            if (typeof data.generatedText === 'string') {
              // Parse the structured content ideas
              const ideasArray = data.generatedText.split('\n\n') // Split by double newlines
                .filter(item => item.trim()) // Remove empty items
                .map(item => {
                  // Extract title and description
                  const titleMatch = item.match(/Title: "(.+?)"/)
                  const descMatch = item.match(/Description: (.+)/)
                  return {
                    title: titleMatch ? titleMatch[1] : item,
                    description: descMatch ? descMatch[1] : ''
                  }
                })
              transformedData.contentIdeas = ideasArray
            } else if (Array.isArray(data.contentIdeas)) {
              transformedData.contentIdeas = data.contentIdeas
            } else {
              transformedData.contentIdeas = []
            }
            break
        case 'audio':
          transformedData.audioSuggestion = typeof data.generatedText === 'string'
            ? data.generatedText
            : data.generatedText?.text || data.audioSuggestion
          break
      }
  
      console.log('Transformed Data:', transformedData) // Debug log
      setGeneratedContent(transformedData)
    } catch (err) {
      console.error('Content generation error:', err)
      setError('Failed to generate content. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

// Update the regenerateContent function similarly
const regenerateContent = async (type: string) => {
  try {
    const token = Cookies.get('token')
    const response = await fetch('http://localhost:3000/creator-ai/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        goal: formData.postType,
        platform: formData.platform,
        topic: formData.keyword,
        tone: formData.tone,
        contentType: type
      })
    })

    const data = await response.json()
    
    const update: Partial<GeneratedContent> = {}
    
    switch(type) {
      case 'caption':
        update.caption = typeof data.generatedText === 'string'
          ? data.generatedText
          : data.generatedText?.text || data.caption
        break
      case 'hashtags':
        const hashtagsText = typeof data.generatedText === 'string'
          ? data.generatedText
          : data.generatedText?.text || data.hashtags
        update.hashtags = hashtagsText?.split(' ') || []
        break
      case 'image':
        if (data.generatedText?.image) {
          update.generatedImage = data.generatedText.image
          update.imagePrompt = `AI generated image (seed: ${data.generatedText.seed})`
        } else if (data.image) {
          update.generatedImage = data.image
        }
        break
      case 'video':
        update.videoIdea = typeof data.generatedText === 'string'
          ? data.generatedText
          : data.generatedText?.text || data.videoIdea
        break
      case 'ideas':
        const ideasText = typeof data.generatedText === 'string'
          ? data.generatedText
          : data.generatedText?.text || data.contentIdeas
        update.contentIdeas = ideasText ? [ideasText] : []
        break
      case 'audio':
        update.audioSuggestion = typeof data.generatedText === 'string'
          ? data.generatedText
          : data.generatedText?.text || data.audioSuggestion
        break
    }

    setGeneratedContent(prev => ({ ...prev, ...update }))
  } catch (err) {
    console.error(`Regenerate ${type} error:`, err)
    setError(`Failed to regenerate ${type}. Please try again.`)
  }
}
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    // You might want to add toast notification here
  }



  

  const handleBack = () => {
    if (step > 1) setStep(step - 1)
  }

  const toggleContentType = (id: string) => {
    setFormData(prev => ({
      ...prev,
      selectedContent: prev.selectedContent.includes(id)
        ? prev.selectedContent.filter(i => i !== id)
        : [...prev.selectedContent, id]
    }))
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">AI Content Creator</h1>
          <p className="text-muted-foreground">Create engaging content in minutes</p>
        </div>
      </div>

      <div className="relative">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 right-0 top-1/2 h-1 bg-muted -translate-y-1/2" />
            <div className="absolute left-0 right-0 top-1/2 h-1 bg-primary -translate-y-1/2" style={{ width: `${(step / 4) * 100}%` }} />
            {[1, 2, 3, 4].map((stepNumber) => (
              <div
                key={stepNumber}
                className={`relative z-10 flex items-center justify-center w-10 h-10 rounded-full ${
                  step >= stepNumber ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                {stepNumber}
              </div>
            ))}
          </div>
        </div>

        <Card>
          <CardContent className="pt-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {step === 1 && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Choose Your Platform</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {platforms.map((platform) => (
                        <Button
                          key={platform.id}
                          variant={formData.platform === platform.id ? "default" : "outline"}
                          className="h-24 flex flex-col gap-2"
                          onClick={() => setFormData({ ...formData, platform: platform.id })}
                        >
                          <platform.icon className={`h-6 w-6 ${platform.color}`} />
                          <span>{platform.name}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold">What's Your Goal?</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {postTypes.map((type) => (
                        <Button
                          key={type.id}
                          variant={formData.postType === type.id ? "default" : "outline"}
                          className="h-24 flex flex-col gap-2"
                          onClick={() => setFormData({ ...formData, postType: type.id })}
                        >
                          <type.icon className="h-6 w-6" />
                          <span>{type.name}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

{step === 3 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Content Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Topic/Keyword</label>
                <Input
                  placeholder="e.g., chess, fitness, anime, etc."
                  value={formData.keyword}
                  onChange={(e) => setFormData({ ...formData, keyword: e.target.value })}
                  className="text-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tone</label>
                <select
                  value={formData.tone}
                  onChange={(e) => setFormData({ ...formData, tone: e.target.value })}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="professional">Professional</option>
                  <option value="casual">Casual</option>
                  <option value="funny">Funny</option>
                  <option value="serious">Serious</option>
                  <option value="friendly">Friendly</option>
                </select>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="trends"
              checked={formData.useTrends}
              onCheckedChange={(checked) => 
                setFormData({ ...formData, useTrends: checked as boolean })
              }
            />
            <label
              htmlFor="trends"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Let AI auto-generate based on platform trends
            </label>
          </div>
        </div>
      )}

                {step === 4 && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold">What Should AI Generate?</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {contentTypes.map((type) => (
                        <div
                          key={type.id}
                          className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                            formData.selectedContent.includes(type.id)
                              ? 'border-primary bg-primary/5'
                              : 'border-muted hover:border-primary/50'
                          }`}
                          onClick={() => toggleContentType(type.id)}
                        >
                          <div className="flex items-center gap-3">
                            <Checkbox
                              checked={formData.selectedContent.includes(type.id)}
                              onCheckedChange={() => toggleContentType(type.id)}
                            />
                            <div className="flex items-center gap-2">
                              <type.icon className="h-4 w-4" />
                              <span>{type.label}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                
      {isGenerating && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent" />
          <p className="mt-2">Generating content...</p>
        </div>
      )}

      {Object.keys(generatedContent).length > 0 && (
        <div className="space-y-6 mt-8">
          {generatedContent.caption && formData.selectedContent.includes('caption') && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Caption
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => regenerateContent('caption')}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Regenerate
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleCopy(generatedContent.caption || '')}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg">{generatedContent.caption}</p>
              </CardContent>
            </Card>
          )}
          {generatedContent.contentIdeas && formData.selectedContent.includes('content ideas') && (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          Content Ideas
        </div>
        <Button
          onClick={() => regenerateContent('content ideas')}
        >
          Regenerate Ideas
        </Button>
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-6">
        {generatedContent.contentIdeas.map((idea, index) => (
          <div key={index} className="border rounded-lg p-4">
            <h3 className="font-semibold text-lg">{idea.title}</h3>
            {idea.description && (
              <p className="text-muted-foreground mt-2">{idea.description}</p>
            )}
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
)}

          {generatedContent.hashtags && formData.selectedContent.includes('hashtags') && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Hash className="h-5 w-5" />
                    Hashtags
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => regenerateContent('hashtags')}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Regenerate
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleCopy(generatedContent.hashtags?.join(' ') || '')}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {generatedContent.hashtags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {generatedContent.imagePrompt && formData.selectedContent.includes('image') && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="h-5 w-5" />
                    Image
                  </div>
                  <Button
                    onClick={() => regenerateContent('image')}
                  >
                    Regenerate Image
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">{generatedContent.imagePrompt}</p>
                {generatedContent.generatedImage && (
  <div className="mt-4">
    <div className="text-xs text-gray-500 mb-2">
      Image data: {generatedContent.generatedImage.length > 50 
        ? `${generatedContent.generatedImage.substring(0, 50)}...` 
        : generatedContent.generatedImage}
    </div>
    <img 
      src={`data:image/png;base64,${generatedContent.generatedImage}`} 
      alt="Generated content" 
      className="rounded-lg border w-full max-w-md"
      onError={(e) => {
        console.error('Image failed to load')
        const img = e.target as HTMLImageElement
        img.style.display = 'none'
      }}
    />
  </div>
)}
              </CardContent>
            </Card>
          )}

                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={step === 1}
              >
                Back
              </Button>
              <Button
                onClick={handleNext}
                disabled={
                  (step === 1 && !formData.platform) ||
                  (step === 2 && !formData.postType) ||
                  (step === 3 && !formData.keyword) ||
                  (step === 4 && formData.selectedContent.length === 0)
                }
              >
                {step === 4 ? (
                  <>
                    Generate Content
                    <Sparkles className="ml-2 h-4 w-4" />
                  </>
                ) : (
                  <>
                    Next
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}