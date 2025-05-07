"use client"

import { Button } from "@/components/ui/button"
import { Briefcase, Settings } from "lucide-react"
import Link from "next/link"

export function FreelanceHeader() {
  return (
    <div className="flex items-center justify-between">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Freelance Dashboard</h1>
        <p className="text-muted-foreground">
          Manage your clients, projects, and freelance business efficiently
        </p>
      </div>
      <div className="flex items-center gap-4">
        <Button variant="outline">
          <Briefcase className="mr-2 h-4 w-4" />
          New Project
        </Button>
        <Link href="/freelance/settings">
          <Button variant="outline">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </Link>
      </div>
    </div>
  )
}