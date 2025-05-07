"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusCircle, Presentation as FilePresentation, MoreVertical, ExternalLink, Play } from "lucide-react"
import { useState } from "react"
import { CreatePresentationDialog } from "./create-presentation-dialog"
import { PresentationQuickActions } from "./presentation-quick-actions"
import Link from "next/link"

interface Presentation {
  id: string
  title: string
  description?: string
  thumbnailUrl?: string
  slides: number
  lastModified: string
  type: 'local' | 'google' | 'powerpoint'
  url?: string
}

const mockPresentations: Presentation[] = [
  {
    id: '1',
    title: 'Q1 Business Review',
    description: 'Quarterly business performance and metrics',
    thumbnailUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=600&fit=crop',
    slides: 24,
    lastModified: '2024-03-20T10:00:00Z',
    type: 'google',
    url: 'https://docs.google.com/presentation/d/example'
  },
  {
    id: '2',
    title: 'Product Roadmap',
    description: 'Upcoming features and development timeline',
    thumbnailUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop',
    slides: 15,
    lastModified: '2024-03-19T15:30:00Z',
    type: 'powerpoint',
    url: 'https://office.live.com/example'
  }
]

export function PresentationGrid() {
  const [presentations] = useState<Presentation[]>(mockPresentations)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [selectedPresentation, setSelectedPresentation] = useState<Presentation | null>(null)

  const handleStartPresentation = (presentation: Presentation) => {
    // If it's an external presentation, open in new tab
    if (presentation.url) {
      window.open(presentation.url, '_blank')
      return
    }

    // For local presentations, navigate to present mode
    window.open(`/presentations/${presentation.id}/present`, '_blank')
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Presentations</h1>
        <Button onClick={() => setShowCreateDialog(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Presentation
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {presentations.map((presentation) => (
          <Card key={presentation.id} className="group relative overflow-hidden">
            {presentation.thumbnailUrl && (
              <div className="aspect-video w-full overflow-hidden">
                <img
                  src={presentation.thumbnailUrl}
                  alt={presentation.title}
                  className="object-cover w-full h-full transition-transform group-hover:scale-105"
                />
              </div>
            )}
            <CardHeader className="space-y-2">
              <div className="flex items-start justify-between">
                <CardTitle className="line-clamp-2">{presentation.title}</CardTitle>
                <PresentationQuickActions
                  presentation={presentation}
                  onPresent={() => handleStartPresentation(presentation)}
                />
              </div>
              {presentation.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {presentation.description}
                </p>
              )}
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <FilePresentation className="h-4 w-4" />
                  <span>{presentation.slides} slides</span>
                </div>
                <div className="flex items-center gap-2">
                  {presentation.type !== 'local' && (
                    <ExternalLink className="h-4 w-4" />
                  )}
                  <span className="capitalize">{presentation.type}</span>
                </div>
              </div>
            </CardContent>
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
              <Button 
                variant="outline" 
                className="text-white border-white hover:bg-white/20"
                onClick={() => handleStartPresentation(presentation)}
              >
                <Play className="mr-2 h-4 w-4" />
                Present
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <CreatePresentationDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
    </div>
  )
}