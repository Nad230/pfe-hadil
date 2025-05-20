import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function TrendingTopics() {
  // Mock data for demonstration
  const trendingTopics = [
    {
      id: "t1",
      name: "Technology",
      posts: 1243,
    },
    {
      id: "t2",
      name: "Design",
      posts: 856,
    },
    {
      id: "t3",
      name: "Programming",
      posts: 732,
    },
    {
      id: "t4",
      name: "AI",
      posts: 521,
    },
    {
      id: "t5",
      name: "Web Development",
      posts: 489,
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trending Topics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {trendingTopics.map((topic) => (
            <div key={topic.id} className="flex justify-between">
              <Link href={`/topic/${topic.name.toLowerCase()}`} className="font-medium hover:underline">
                #{topic.name}
              </Link>
              <span className="text-muted-foreground text-sm">{topic.posts} posts</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

