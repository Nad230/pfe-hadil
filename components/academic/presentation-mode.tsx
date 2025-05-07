"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { 
  Presentation, 
  Layout, 
  Image as ImageIcon, 
  FileText, 
  Sparkles,
  Play,
  Download,
  Plus
} from "lucide-react"

export function PresentationMode() {
  const presentations = [
    {
      id: "1",
      title: "AI Ethics Research Findings",
      slides: 24,
      duration: "20 min",
      status: "draft",
      lastModified: "2024-03-19"
    },
    {
      id: "2",
      title: "Renewable Energy Solutions",
      slides: 18,
      duration: "15 min",
      status: "ready",
      lastModified: "2024-03-18"
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ready":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
      case "draft":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Presentation Builder</h2>
          <p className="text-muted-foreground">Create and manage your research presentations</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Presentation
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>AI Presentation Generator</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Research Content</label>
              <Textarea 
                placeholder="Paste your research content or key points..."
                className="min-h-[150px]"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Target Duration</label>
                <Input placeholder="e.g., 15 minutes" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Style</label>
                <Input placeholder="e.g., Academic, Modern" />
              </div>
            </div>
            <Button className="w-full">
              <Sparkles className="mr-2 h-4 w-4" />
              Generate Presentation
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <Button variant="outline" className="h-24">
              <div className="flex flex-col items-center gap-2">
                <Layout className="h-6 w-6" />
                <span>Templates</span>
              </div>
            </Button>
            <Button variant="outline" className="h-24">
              <div className="flex flex-col items-center gap-2">
                <ImageIcon className="h-6 w-6" />
                <span>Media Library</span>
              </div>
            </Button>
            <Button variant="outline" className="h-24">
              <div className="flex flex-col items-center gap-2">
                <FileText className="h-6 w-6" />
                <span>Export Notes</span>
              </div>
            </Button>
            <Button variant="outline" className="h-24">
              <div className="flex flex-col items-center gap-2">
                <Presentation className="h-6 w-6" />
                <span>Practice Mode</span>
              </div>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Presentations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {presentations.map((presentation) => (
              <div
                key={presentation.id}
                className="flex items-center justify-between p-4 rounded-lg border"
              >
                <div className="space-y-1">
                  <h3 className="font-medium">{presentation.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{presentation.slides} slides</span>
                    <span>•</span>
                    <span>{presentation.duration}</span>
                    <span>•</span>
                    <span>Modified {presentation.lastModified}</span>
                  </div>
                  <Badge className={getStatusColor(presentation.status)}>
                    {presentation.status.toUpperCase()}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Play className="mr-2 h-4 w-4" />
                    Present
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}