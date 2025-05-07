"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, ExternalLink, Eye, ThumbsUp, MessageSquare } from "lucide-react"

export function PortfolioShowcase() {
  const projects = [
    {
      id: "1",
      title: "E-commerce Website Redesign",
      description: "Complete redesign of an e-commerce platform focusing on user experience and conversion optimization",
      image: "https://images.unsplash.com/photo-1661956602116-aa6865609028?w=800&h=400&fit=crop",
      tags: ["UI/UX", "E-commerce", "Web Design"],
      stats: {
        views: 1245,
        likes: 89,
        comments: 23
      },
      link: "https://example.com/project1"
    },
    {
      id: "2",
      title: "Mobile Banking App",
      description: "Modern banking application with focus on security and ease of use",
      image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&h=400&fit=crop",
      tags: ["Mobile", "FinTech", "UI Design"],
      stats: {
        views: 892,
        likes: 67,
        comments: 15
      },
      link: "https://example.com/project2"
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Portfolio</h2>
          <p className="text-muted-foreground">Showcase your best work</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Project
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {projects.map((project) => (
          <Card key={project.id} className="overflow-hidden">
            <div className="aspect-video w-full overflow-hidden">
              <img
                src={project.image}
                alt={project.title}
                className="w-full h-full object-cover transition-transform hover:scale-105"
              />
            </div>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-xl">{project.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {project.description}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {project.stats.views}
                    </div>
                    <div className="flex items-center gap-1">
                      <ThumbsUp className="h-4 w-4" />
                      {project.stats.likes}
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="h-4 w-4" />
                      {project.stats.comments}
                    </div>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <a href={project.link} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View Project
                    </a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Portfolio Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Total Views</h3>
              <p className="text-2xl font-bold">4,892</p>
              <p className="text-sm text-muted-foreground">Last 30 days</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Project Inquiries</h3>
              <p className="text-2xl font-bold">12</p>
              <p className="text-sm text-muted-foreground">This month</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Conversion Rate</h3>
              <p className="text-2xl font-bold">3.2%</p>
              <p className="text-sm text-green-500">+0.8% from last month</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}