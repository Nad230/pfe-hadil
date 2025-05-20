"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Trophy,
  ThumbsUp,
  MessageSquare,
  Share2,
  Filter,
  Plus
} from "lucide-react"

interface ShowcaseItem {
  id: string
  title: string
  description: string
  author: {
    name: string
    avatar: string
  }
  type: "project" | "solution" | "presentation"
  likes: number
  comments: number
  createdAt: string
  featured: boolean
}

const mockShowcase: ShowcaseItem[] = [
  {
    id: "1",
    title: "Matrix Operations Visualizer",
    description: "An interactive tool to visualize matrix operations and transformations",
    author: {
      name: "Sarah Chen",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop"
    },
    type: "project",
    likes: 124,
    comments: 18,
    createdAt: "2024-03-19T08:30:00Z",
    featured: true
  },
  {
    id: "2",
    title: "Eigenvalue Problem Solutions",
    description: "Comprehensive solutions to the eigenvalue problem set",
    author: {
      name: "Marcus Rodriguez",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop"
    },
    type: "solution",
    likes: 45,
    comments: 12,
    createdAt: "2024-03-18T15:45:00Z",
    featured: false
  },
  {
    id: "3",
    title: "Linear Transformations in Real World",
    description: "Presentation on real-world applications of linear transformations",
    author: {
      name: "Emma Watson",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop"
    },
    type: "presentation",
    likes: 89,
    comments: 24,
    createdAt: "2024-03-17T10:20:00Z",
    featured: true
  }
]

export function CourseShowcase() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filter, setFilter] = useState<"all" | "featured" | ShowcaseItem["type"]>("all")

  const filteredShowcase = mockShowcase.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filter === "all" || 
      (filter === "featured" ? item.featured : item.type === filter)
    return matchesSearch && matchesFilter
  })

  const typeColors = {
    project: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100",
    solution: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
    presentation: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Course Showcase</h2>
          <p className="text-muted-foreground">
            Share and discover amazing work from your classmates
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Showcase
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search showcase..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          Filter
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {filteredShowcase.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{item.title}</h3>
                      <Badge className={typeColors[item.type]}>
                        {item.type}
                      </Badge>
                      {item.featured && (
                        <Badge variant="outline" className="gap-1">
                          <Trophy className="h-3 w-3 text-yellow-500" />
                          Featured
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={item.author.avatar} />
                      <AvatarFallback>{item.author.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-sm font-medium">{item.author.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="gap-1">
                      <ThumbsUp className="h-4 w-4" />
                      {item.likes}
                    </Button>
                    <Button variant="ghost" size="sm" className="gap-1">
                      <MessageSquare className="h-4 w-4" />
                      {item.comments}
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}