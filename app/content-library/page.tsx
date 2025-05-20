"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, BarChart2, Repeat2, Calendar, MessageSquare, Eye } from "lucide-react"

export default function ContentLibraryPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedPlatform, setSelectedPlatform] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")

  const contentItems = [
    {
      id: 1,
      platform: "Instagram",
      type: "image",
      thumbnail: "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=800&q=80",
      caption: "Introducing our latest feature! 🎉",
      status: "posted",
      date: "2024-03-15",
      metrics: {
        likes: 856,
        comments: 45,
        shares: 23
      },
      notes: "High engagement rate, consider similar content"
    },
    {
      id: 2,
      platform: "YouTube",
      type: "video",
      thumbnail: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80",
      caption: "5 Tips for Better Productivity",
      status: "draft",
      date: "2024-03-20",
      metrics: null,
      notes: "Part of productivity series"
    }
  ]

  const platforms = [
    { value: "all", label: "All Platforms" },
    { value: "instagram", label: "Instagram" },
    { value: "youtube", label: "YouTube" },
    { value: "twitter", label: "Twitter" },
    { value: "linkedin", label: "LinkedIn" }
  ]

  const statuses = [
    { value: "all", label: "All Status" },
    { value: "draft", label: "Draft" },
    { value: "scheduled", label: "Scheduled" },
    { value: "posted", label: "Posted" }
  ]

  const filteredContent = contentItems.filter(item => {
    const matchesPlatform = selectedPlatform === "all" || item.platform.toLowerCase() === selectedPlatform
    const matchesStatus = selectedStatus === "all" || item.status === selectedStatus
    const matchesSearch = item.caption.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesPlatform && matchesStatus && matchesSearch
  })

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Content Library</h1>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-[1fr,200px,200px,auto]">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
              <SelectTrigger>
                <SelectValue placeholder="Platform" />
              </SelectTrigger>
              <SelectContent>
                {platforms.map((platform) => (
                  <SelectItem key={platform.value} value={platform.value}>
                    {platform.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6">
        {filteredContent.map((item) => (
          <Card key={item.id} className="overflow-hidden">
            <div className="grid md:grid-cols-[300px,1fr]">
              <div className="aspect-square relative">
                <img 
                  src={item.thumbnail} 
                  alt={item.caption}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4 flex gap-2">
                  <Badge className="bg-black/75 text-white hover:bg-black/75">
                    {item.platform}
                  </Badge>
                  <Badge className={`capitalize ${
                    item.status === 'posted' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      : item.status === 'scheduled'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                      : 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
                  }`}>
                    {item.status}
                  </Badge>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground flex items-center">
                      <Calendar className="mr-2 h-4 w-4" />
                      {item.date}
                    </p>
                    <Button variant="outline" size="sm">
                      <Repeat2 className="mr-2 h-4 w-4" />
                      Reuse
                    </Button>
                  </div>
                  <p className="text-lg font-medium">{item.caption}</p>
                </div>

                {item.metrics && (
                  <div className="grid grid-cols-3 gap-4 py-4 border-y">
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-2xl font-bold">{item.metrics.likes}</p>
                        <p className="text-sm text-muted-foreground">Likes</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-2xl font-bold">{item.metrics.comments}</p>
                        <p className="text-sm text-muted-foreground">Comments</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <BarChart2 className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-2xl font-bold">{item.metrics.shares}</p>
                        <p className="text-sm text-muted-foreground">Shares</p>
                      </div>
                    </div>
                  </div>
                )}

                {item.notes && (
                  <div className="text-sm text-muted-foreground">
                    <strong>Notes:</strong> {item.notes}
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}