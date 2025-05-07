"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { 
  CheckCircle2,
  Clock,
  Star,
  Download,
  FileUp,
  AlertCircle
} from "lucide-react"
import { Task, TaskSubmission } from "@/lib/types/academic"

interface TeacherViewProps {
  task: Task
}

export function TeacherView({ task }: TeacherViewProps) {
  const [submissions, setSubmissions] = useState<TaskSubmission[]>([
    {
      id: "1",
      studentId: "1",
      studentName: "Nadhir",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
      status: "completed",
      points: 50,
      submittedAt: "2024-03-19T10:00:00Z",
      file: "assignment.pdf"
    },
    {
      id: "2",
      studentId: "2",
      studentName: "Malek",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
      status: "pending",
      submittedAt: "2024-03-19T11:30:00Z",
      file: "project.zip"
    },
    {
      id: "3",
      studentId: "3",
      studentName: "Fatma",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
      status: "completed",
      points: 75,
      rating: 8,
      submittedAt: "2024-03-19T09:15:00Z",
      file: "presentation.pptx"
    }
  ])

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="font-medium">Submissions</h3>
              <p className="text-sm text-muted-foreground">
                {submissions.length} students have submitted
              </p>
            </div>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Download All
            </Button>
          </div>

          <div className="space-y-4">
            {submissions.map((submission) => (
              <div
                key={submission.id}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src={submission.avatar} />
                    <AvatarFallback>{submission.studentName[0]}</AvatarFallback>
                  </Avatar>
                  
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{submission.studentName}</h4>
                      {submission.status === "completed" ? (
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                          <CheckCircle2 className="mr-1 h-3 w-3" />
                          {submission.points} pts
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          <Clock className="mr-1 h-3 w-3" />
                          Pending Review
                        </Badge>
                      )}
                      {submission.rating && (
                        <Badge variant="outline" className="gap-1">
                          <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                          Rated {submission.rating}/10
                        </Badge>
                      )}
                    </div>
                    
                    <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Submitted {new Date(submission.submittedAt).toLocaleTimeString()}</span>
                      <Button variant="link" className="h-auto p-0">
                        {submission.file}
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                  {submission.status === "pending" && (
                    <Button size="sm">Grade</Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}