"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  MoreVertical, 
  Play, 
  Pencil, 
  Copy, 
  Download, 
  Share2,
  Trash 
} from "lucide-react"
import { toast } from "sonner"

interface PresentationQuickActionsProps {
  presentation: {
    id: string
    title: string
    type: string
  }
  onPresent: () => void
}

export function PresentationQuickActions({ presentation, onPresent }: PresentationQuickActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreVertical className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onPresent}>
          <Play className="mr-2 h-4 w-4" />
          Present
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => toast.success("Opening editor...")}>
          <Pencil className="mr-2 h-4 w-4" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => toast.success("Presentation duplicated")}>
          <Copy className="mr-2 h-4 w-4" />
          Duplicate
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => toast.success("Download started")}>
          <Download className="mr-2 h-4 w-4" />
          Download
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => {
          navigator.clipboard.writeText(`https://example.com/presentations/${presentation.id}`)
          toast.success("Link copied to clipboard")
        }}>
          <Share2 className="mr-2 h-4 w-4" />
          Share
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          className="text-red-600 dark:text-red-400"
          onClick={() => toast.success("Presentation deleted")}
        >
          <Trash className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}