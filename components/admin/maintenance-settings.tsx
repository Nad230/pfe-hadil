"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Loader2, RefreshCw, Trash } from "lucide-react"
import { toast } from "sonner"

export function MaintenanceSettings() {
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isClearing, setIsClearing] = useState(false)

  const handleMaintenanceToggle = (checked: boolean) => {
    setIsMaintenanceMode(checked)
    toast.success(`Maintenance mode ${checked ? "enabled" : "disabled"}`)
  }

  const handleRefreshJobs = async () => {
    setIsRefreshing(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsRefreshing(false)
    toast.success("Job listings refreshed successfully")
  }

  const handleClearCache = async () => {
    setIsClearing(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsClearing(false)
    toast.success("Cache cleared successfully")
  }

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Maintenance Mode</Label>
            <p className="text-sm text-muted-foreground">
              Temporarily disable the application for maintenance
            </p>
          </div>
          <Switch
            checked={isMaintenanceMode}
            onCheckedChange={handleMaintenanceToggle}
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Background Tasks</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <Button
            variant="outline"
            onClick={handleRefreshJobs}
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Refresh Job Listings
          </Button>

          <Button
            variant="outline"
            onClick={handleClearCache}
            disabled={isClearing}
          >
            {isClearing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Trash className="mr-2 h-4 w-4" />
            )}
            Clear Cache
          </Button>
        </div>
      </div>
    </div>
  )
}