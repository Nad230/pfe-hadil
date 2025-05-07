"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Brain, Sparkles, Clock, Calendar, Target, MessageSquare } from "lucide-react"

export function StudyAssistant() {
  const suggestions = [
    {
      id: "1",
      type: "research",
      content: "Consider exploring the correlation between AI ethics frameworks and real-world implementation challenges in your literature review.",
      relevance: 95
    },
    {
      id: "2",
      type: "deadline",
      content: "Research paper first draft due in 5 days. Prioritize completing the methodology section.",
      relevance: 90
    },
    {
      id: "3",
      type: "resource",
      content: "New research paper published in Nature about AI governance frameworks - highly relevant to your current topic.",
      relevance: 85
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">AI Study Assistant</h2>
          <p className="text-muted-foreground">Get personalized study recommendations and research insights</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Research Assistant</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Research Topic</label>
              <Input placeholder="Enter your research topic or question..." />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Context</label>
              <Textarea 
                placeholder="Provide additional context or specific areas you'd like to explore..."
                className="min-h-[100px]"
              />
            </div>
            <Button className="w-full">
              <Sparkles className="mr-2 h-4 w-4" />
              Generate Insights
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI Suggestions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {suggestions.map((suggestion) => (
              <div
                key={suggestion.id}
                className="p-4 rounded-lg bg-muted/50 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">
                    {suggestion.type.toUpperCase()}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {suggestion.relevance}% relevant
                  </span>
                </div>
                <p className="text-sm">{suggestion.content}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Focus Score</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">92%</div>
            <p className="text-xs text-muted-foreground">High concentration</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Study Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.5h</div>
            <p className="text-xs text-muted-foreground">Today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Deadline</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5d</div>
            <p className="text-xs text-muted-foreground">First draft due</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Goals</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3/5</div>
            <p className="text-xs text-muted-foreground">Completed today</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Chat with AI Assistant</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4">
              <Button className="flex-1">
                <MessageSquare className="mr-2 h-4 w-4" />
                Research Help
              </Button>
              <Button className="flex-1" variant="outline">
                <MessageSquare className="mr-2 h-4 w-4" />
                Writing Assistant
              </Button>
              <Button className="flex-1" variant="outline">
                <MessageSquare className="mr-2 h-4 w-4" />
                Study Planning
              </Button>
            </div>
            <div className="relative">
              <Textarea 
                placeholder="Ask your research or study-related question..."
                className="min-h-[100px] pr-20"
              />
              <Button 
                className="absolute bottom-2 right-2"
                size="sm"
              >
                Ask AI
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}