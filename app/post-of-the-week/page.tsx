"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowUp, BarChart2, MessageSquare, Eye, Lightbulb, Repeat2 } from "lucide-react"

export default function PostOfTheWeekPage() {
  const topPosts = [
    {
      platform: "Instagram",
      type: "image",
      thumbnail: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80",
      caption: "Behind the scenes of our latest product launch! 🚀",
      metrics: {
        likes: 1243,
        comments: 89,
        shares: 45,
        engagement: 4.8
      },
      insights: [
        "Posted during peak engagement hours (2-4 PM)",
        "Behind-the-scenes content resonates well with audience",
        "Use of emojis increased engagement",
      ],
      recommendations: [
        "Continue sharing authentic behind-the-scenes content",
        "Maintain similar posting schedule",
        "Use 3-5 relevant emojis in captions"
      ]
    },
    {
      platform: "YouTube",
      type: "video",
      thumbnail: "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=800&q=80",
      caption: "Complete Guide: Mastering Digital Marketing in 2024",
      metrics: {
        views: 15678,
        likes: 2345,
        comments: 167,
        retention: 68
      },
      insights: [
        "Educational content performs exceptionally well",
        "Longer video (15+ minutes) with high retention",
        "Strong CTAs drove engagement"
      ],
      recommendations: [
        "Create more comprehensive guides",
        "Focus on current industry trends",
        "Include actionable takeaways"
      ]
    }
  ]

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Post of the Week</h1>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {topPosts.map((post, index) => (
          <Card key={index} className="overflow-hidden">
            <div className="aspect-video relative">
              <img 
                src={post.thumbnail} 
                alt={post.caption}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4">
                <Badge className="bg-black/75 text-white hover:bg-black/75">
                  {post.platform}
                </Badge>
              </div>
            </div>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="text-xl">Top Performing Post</span>
                <Button variant="outline" size="sm">
                  <Repeat2 className="mr-2 h-4 w-4" />
                  Repost
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-muted-foreground">{post.caption}</p>

              <div className="grid grid-cols-2 gap-4">
                {Object.entries(post.metrics).map(([key, value]) => (
                  <div key={key} className="space-y-1">
                    <p className="text-sm text-muted-foreground capitalize">{key}</p>
                    <p className="text-2xl font-bold">
                      {typeof value === 'number' && key === 'engagement'
                        ? `${value}%`
                        : value.toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-semibold flex items-center gap-2">
                    <BarChart2 className="h-4 w-4" />
                    Key Insights
                  </h3>
                  <ul className="space-y-2 text-sm">
                    {post.insights.map((insight, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <ArrowUp className="h-4 w-4 text-green-500" />
                        {insight}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Lightbulb className="h-4 w-4" />
                    AI Recommendations
                  </h3>
                  <ul className="space-y-2 text-sm">
                    {post.recommendations.map((rec, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-primary">•</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}