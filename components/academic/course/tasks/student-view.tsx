"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { 
  Upload,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileUp,
  Bell
} from "lucide-react"
import { Task } from "@/lib/types/academic"

interface StudentViewProps {
  task: Task
}

export function StudentView({ task }: StudentViewProps) {
  const [status, setStatus] = useState<"not_started" | "in_progress" | "completed">("not_started")
  const [file, setFile] = useState<File | null>(null)
  const [remindersEnabled, setRemindersEnabled] = useState(true)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0])
      setStatus("in_progress")
    }
  }

  const handleSubmit = () => {
    if (file) {
      setStatus("completed")
      // Handle submission
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="font-medium">Your Progress</h3>
                {status === "completed" ? (
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                    Completed
                  </Badge>
                ) : status === "in_progress" ? (
                  <Badge variant="secondary">
                    <Clock className="mr-1 h-3 w-3" />
                    In Progress
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-muted-foreground">
                    <AlertCircle className="mr-1 h-3 w-3" />
                    Not Started
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {status === "completed"
                  ? "Great job! Your work has been submitted."
                  : "Upload your work when you're ready."}
              </p>
            </div>

            <Button
              variant={remindersEnabled ? "default" : "outline"}
              onClick={() => setRemindersEnabled(!remindersEnabled)}
            >
              <Bell className="mr-2 h-4 w-4" />
              {remindersEnabled ? "Reminders On" : "Set Reminder"}
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <div className="mb-2 flex justify-between text-sm">
                <span>Task Progress</span>
                <span>{status === "completed" ? "100%" : "0%"}</span>
              </div>
              <Progress
                value={status === "completed" ? 100 : 0}
                className="h-2"
              />
            </div>

            <div className="rounded-lg border border-dashed p-4">
              <div className="flex items-center justify-center gap-3">
                <div className="flex-1">
                  <Input
                    type="file"
                    className="hidden"
                    id="file-upload"
                    onChange={handleFileChange}
                  />
                  <label
                    htmlFor="file-upload"
                    className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border bg-muted p-2 text-sm hover:bg-muted/80"
                  >
                    <Upload className="h-4 w-4" />
                    Choose File
                  </label>
                </div>
                {file && (
                  <>
                    <span className="text-sm text-muted-foreground">
                      {file.name}
                    </span>
                    <Button onClick={handleSubmit}>
                      <FileUp className="mr-2 h-4 w-4" />
                      Submit
                    </Button>
                  </>
                )}
              </div>
            </div>

            {task.isGroupTask && (
              <div className="rounded-lg bg-muted p-4">
                <h4 className="mb-2 font-medium">Group Members</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span>Sarah Chen</span>
                    <Badge variant="outline" className="text-green-500">Submitted</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Alex Rivera</span>
                    <Badge variant="outline" className="text-yellow-500">In Progress</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Emma Watson</span>
                    <Badge variant="outline" className="text-red-500">Not Started</Badge>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}