"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, FileText, Send, Sparkles, Clock, DollarSign } from "lucide-react"

export function ProposalWriter() {
  const proposals = [
    {
      id: "1",
      client: "TechStart Inc.",
      project: "Website Redesign",
      budget: "$5,000 - $8,000",
      status: "draft",
      dueDate: "2024-04-15",
      confidence: 85
    },
    {
      id: "2",
      client: "GrowthLabs",
      project: "Mobile App Development",
      budget: "$12,000 - $15,000",
      status: "sent",
      dueDate: "2024-04-10",
      confidence: 92
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
      case "sent":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
      case "accepted":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
      default:
        return ""
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>New Proposal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Client Name</label>
              <Input placeholder="Enter client name" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Project Type</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select project type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="web">Web Development</SelectItem>
                  <SelectItem value="mobile">Mobile App</SelectItem>
                  <SelectItem value="design">UI/UX Design</SelectItem>
                  <SelectItem value="consulting">Consulting</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Project Description</label>
              <Textarea 
                placeholder="Describe the project scope and requirements..."
                className="min-h-[100px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Budget Range</label>
                <Input placeholder="e.g., $5,000 - $8,000" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Timeline</label>
                <Input placeholder="e.g., 4-6 weeks" />
              </div>
            </div>

            <Button className="w-full">
              <Sparkles className="mr-2 h-4 w-4" />
              Generate Proposal
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI Suggestions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Winning Elements</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2 p-2 rounded-lg bg-muted/50">
                  <Sparkles className="h-4 w-4 mt-0.5 text-blue-500" />
                  <p>Highlight your experience with similar projects in the tech industry</p>
                </div>
                <div className="flex items-start gap-2 p-2 rounded-lg bg-muted/50">
                  <Sparkles className="h-4 w-4 mt-0.5 text-blue-500" />
                  <p>Include case studies showing measurable results</p>
                </div>
                <div className="flex items-start gap-2 p-2 rounded-lg bg-muted/50">
                  <Sparkles className="h-4 w-4 mt-0.5 text-blue-500" />
                  <p>Propose a phased delivery approach with clear milestones</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium">Market Insights</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2 p-2 rounded-lg bg-muted/50">
                  <DollarSign className="h-4 w-4 mt-0.5 text-green-500" />
                  <p>Average rate for similar projects: $75-100/hour</p>
                </div>
                <div className="flex items-start gap-2 p-2 rounded-lg bg-muted/50">
                  <Clock className="h-4 w-4 mt-0.5 text-orange-500" />
                  <p>Typical timeline: 4-6 weeks for MVP</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Proposals</CardTitle>
            <Button variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {proposals.map((proposal) => (
              <div
                key={proposal.id}
                className="flex items-center justify-between p-4 rounded-lg border"
              >
                <div className="space-y-1">
                  <h3 className="font-medium">{proposal.client}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{proposal.project}</span>
                    <span>•</span>
                    <span>{proposal.budget}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(proposal.status)}>
                      {proposal.status.toUpperCase()}
                    </Badge>
                    <Badge variant="outline">
                      {proposal.confidence}% Match
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Due Date</div>
                    <div>{new Date(proposal.dueDate).toLocaleDateString()}</div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Send className="mr-2 h-4 w-4" />
                    Send
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