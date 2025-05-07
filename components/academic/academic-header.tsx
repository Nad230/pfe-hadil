"use client"

import { Button } from "@/components/ui/button"
import { GraduationCap, Settings } from "lucide-react"
import Link from "next/link"
import { CreateProjectDialog } from "./create-project-dialog"
import { useState } from "react"

export function AcademicHeader() {
  const [showDialog, setShowDialog] = useState(false)

  return (
    <div className="flex items-center justify-between">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Academic Dashboard</h1>
        <p className="text-muted-foreground">
          Manage your research, projects, and academic tasks efficiently
        </p>
      </div>
      <div className="flex items-center gap-4">
        <Button onClick={() => setShowDialog(true)} variant="outline" >
          <GraduationCap className="mr-2 h-4 w-4" />
          New Project
        </Button>
        <CreateProjectDialog 
        open={showDialog}
        onOpenChange={setShowDialog}
      />
        <Link href="/academic/settings">
          <Button variant="outline">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </Link>
      </div>
    </div>
  )
}
