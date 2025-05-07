"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ThoughtCard } from "./thought-card"
import { mockThoughts } from "@/lib/mock-data/community"

export function CommunityThoughts() {
  if (!mockThoughts?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Community Thoughts</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">No thoughts to display</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Thoughts</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockThoughts.map((thought) => (
            <ThoughtCard key={thought.id} thought={thought} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}