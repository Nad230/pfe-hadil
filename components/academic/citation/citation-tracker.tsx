"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, BookOpen, Quote, Link2, ExternalLink, Loader2 } from "lucide-react"
import { CreateCitationDialog } from "./create-citation-dialog"
import { useState, useEffect } from "react"
import Cookies from "js-cookie"

interface Citation {
  id: string
  title: string
  authors: string[]
  publication_date: string
  journal: string
  doi: string
  tags: string[]
  usage_cases: string[]
}

export function CitationTracker() {
  const [showDialog, setShowDialog] = useState(false)
  const [citations, setCitations] = useState<Citation[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = Cookies.get("token")
        const response = await fetch('http://localhost:3000/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (!response.ok) throw new Error('Failed to fetch user')
        const userData = await response.json()
        setUserId(userData.sub)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load user data')
        setLoading(false)
      }
    }

    fetchUser()
  }, [])

  useEffect(() => {
    const fetchCitations = async () => {
      if (!userId) return

      try {
        const token = Cookies.get("token")
        const response = await fetch(`http://localhost:3000/citation/user/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (!response.ok) throw new Error('Failed to fetch citations')
        const data = await response.json()
        setCitations(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load citations')
      } finally {
        setLoading(false)
      }
    }

    fetchCitations()
  }, [userId])

  // Calculate statistics
  const totalCitations = citations.length
  const primarySources = citations.filter(c => c.tags.includes('primary-source')).length
  const uniqueProjects = new Set(citations.flatMap(c => c.usage_cases)).size
  const recentCitations = citations.filter(c => 
    new Date(c.publication_date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  ).length

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center p-8 text-red-500">
        Error: {error}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Citation Manager</h2>
          <p className="text-muted-foreground">Track and organize your research references</p>
        </div>
        <Button onClick={() => setShowDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Citation
        </Button>
        <CreateCitationDialog 
          open={showDialog}
          onOpenChange={setShowDialog}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Citations</CardTitle>
            <Quote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCitations}</div>
            <p className="text-xs text-muted-foreground">Across all projects</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">References</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{primarySources}</div>
            <p className="text-xs text-muted-foreground">Primary sources</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projects</CardTitle>
            <Link2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uniqueProjects}</div>
            <p className="text-xs text-muted-foreground">Using citations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentCitations}</div>
            <p className="text-xs text-muted-foreground">Added this month</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Citations Library</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search citations..." className="pl-8" />
              </div>
              <Button variant="outline">Export Bibliography</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {citations.map((citation) => (
              <div
                key={citation.id}
                className="flex items-center justify-between p-4 rounded-lg border"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{citation.title}</h3>
                    <a 
                      href={`https://doi.org/${citation.doi}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-600"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                  <span className="text-sm text-muted-foreground">
  Cited in: {(citation.usage_cases ?? []).join(", ")}
</span>

                  <div className="flex items-center gap-2">
  <div className="flex gap-1">
    {(citation.tags ?? []).map((tag) => (
      <Badge key={tag} variant="secondary">
        {tag}
      </Badge>
    ))}
  </div>
  <span className="text-sm text-muted-foreground">•</span>
  <span className="text-sm text-muted-foreground">
    Cited in: {(citation.usage_cases ?? []).join(", ")}
  </span>
</div>

                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">Copy Citation</Button>
                  <Button variant="outline" size="sm">Edit</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}