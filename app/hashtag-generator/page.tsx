

"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sparkles, Copy, Instagram, Youtube, Atom as Tiktok, Hash } from "lucide-react"
import { useState } from "react"

export default function HashtagGeneratorPage() {
  // Update the state at the top of your component
  const [selectedTypes, setSelectedTypes] = useState<Set<"caption" | "hashtags" | "ideas">>(new Set(["caption"]));
  const [generatedContent, setGeneratedContent] = useState({
    caption: '',
    hashtags: '',
    ideas: ''
  });

  const toggleContentType = (type: "caption" | "hashtags" | "ideas") => {
    setSelectedTypes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(type)) {
        newSet.delete(type);
      } else {
        newSet.add(type);
      }
      return newSet;
    });
  };

const [topic, setTopic] = useState('');
const [tone, setTone] = useState('casual');
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState('');
  const [platform, setPlatform] = useState("instagram")
  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError('Please enter a topic');
      return;
    }
    if (selectedTypes.size === 0) {
      setError('Please select at least one content type');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Convert Set to array for API call
      const typesArray = Array.from(selectedTypes);
      
      // Batch generate all selected types
      const responses = await Promise.all(
        typesArray.map(type => 
          fetch('http://localhost:3000/creator-ai/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              platform,
              contentType: type,
              topic,
              tone
            })
          })
        )
      );

      // Process all responses
      const results = await Promise.all(
        responses.map(res => res.json())
      );

      // Update generated content
      const newContent = { ...generatedContent };
      typesArray.forEach((type, index) => {
        newContent[type] = results[index].generatedText;
      });
      setGeneratedContent(newContent);

    } catch (err) {
      setError(err.message || 'Failed to generate content');
    } finally {
      setIsLoading(false);
    }
  };
  const suggestions = [
    {
      type: "caption" as const,
      label: "Post Caption",
      static: "🌟 Elevate your productivity...",
      generated: generatedContent.caption
    },
    {
      type: "hashtags" as const,
      label: "Hashtag Set",
      static: "#ContentCreator #DigitalMarketing...",
      generated: generatedContent.hashtags
    },
    {
      type: "ideas" as const,
      label: "Content Ideas",
      static: "1. Morning Routine Reveal...",
      generated: generatedContent.ideas
    }
  ];
  
  const filteredSuggestions = suggestions.filter(suggestion => 
    selectedTypes.has(suggestion.type)
  );
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
      
        <Card>
          <CardHeader>
            <CardTitle>AI Content Generator</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Platform</label>
              <Select value={platform} onValueChange={setPlatform}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="instagram">
                    <div className="flex items-center gap-2">
                      <Instagram className="h-4 w-4" />
                      Instagram
                    </div>
                  </SelectItem>
                  <SelectItem value="youtube">
                    <div className="flex items-center gap-2">
                      <Youtube className="h-4 w-4" />
                      YouTube
                    </div>
                  </SelectItem>
                  <SelectItem value="tiktok">
                    <div className="flex items-center gap-2">
                      <Tiktok className="h-4 w-4" />
                      TikTok
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

          {/* Replace this entire Select component */}
<div className="space-y-2">
  <label className="text-sm font-medium">Content Types</label>
  <div className="flex gap-4">
    {['caption', 'hashtags', 'ideas'].map((type) => (
      <div 
        key={type}
        className="flex items-center gap-2 cursor-pointer"
        onClick={() => toggleContentType(type as any)}
      >
        <div className={`w-4 h-4 border rounded-sm flex items-center justify-center 
          ${selectedTypes.has(type as any) ? 'bg-primary border-primary' : 'border-muted-foreground'}`}>
          {selectedTypes.has(type as any) && <span className="text-white text-xs">✓</span>}
        </div>
        <span className="text-sm capitalize">
          {type === 'hashtags' ? 'Hashtag Set' : 
           type === 'ideas' ? 'Content Ideas' : 
           'Post Caption'}
        </span>
      </div>
    ))}
  </div>
</div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Topic/Keywords</label>
              <Input 
  value={topic}
  onChange={(e) => setTopic(e.target.value)}
  placeholder="e.g., productivity tips, morning routine" 
/>            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Tone</label>
              <Select value={tone} onValueChange={setTone}>
              <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
    <SelectItem value="casual">Casual & Friendly</SelectItem>
    <SelectItem value="professional">Professional</SelectItem>
    <SelectItem value="motivational">Motivational</SelectItem>
    <SelectItem value="educational">Educational</SelectItem>
  </SelectContent>
              </Select>
            </div>

            <Button 
  className="w-full" 
  onClick={handleGenerate}
  disabled={isLoading}
>
  {isLoading ? (
    <span className="flex items-center">
      <Sparkles className="mr-2 h-4 w-4 animate-pulse" />
      Generating...
    </span>
  ) : (
    <span className="flex items-center">
      <Sparkles className="mr-2 h-4 w-4" />
      Generate Content
    </span>
  )}
</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI Suggestions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
  {filteredSuggestions.map((suggestion) => (
    <div key={suggestion.type} className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">{suggestion.label}</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigator.clipboard.writeText(
            suggestion.generated || suggestion.static
          )}
        >
          <Copy className="h-4 w-4" />
        </Button>
      </div>
      <Textarea
        value={suggestion.generated || suggestion.static}
        readOnly
        className="min-h-[100px] bg-muted/50"
      />
      {!suggestion.generated && (
        <div className="text-sm text-muted-foreground">
          {isLoading ? "Generating..." : "Example suggestion shown"}
        </div>
      )}
    </div>
  ))}
</CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Trending Topics & Hashtags</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {[
              "CreatorEconomy",
              "ProductivityHacks",
              "WorkLifeBalance",
              "DigitalNomad",
              "PersonalBranding",
              "ContentStrategy",
              "SocialMediaTips",
              "Entrepreneurship"
            ].map((tag) => (
              <div
                key={tag}
                className="flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-sm"
              >
                <Hash className="h-3 w-3" />
                {tag}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}