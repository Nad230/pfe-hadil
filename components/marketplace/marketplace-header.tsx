
"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Grid, List, Search } from "lucide-react"

interface MarketplaceHeaderProps {
  view: 'grid' | 'list'
  onViewChange: (view: 'grid' | 'list') => void
  onSearch: (query: string) => void
  onCategoryChange: (category: string) => void
}

export function MarketplaceHeader({
  view,
  onViewChange,
  onSearch,
  onCategoryChange
}: MarketplaceHeaderProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Marketplace</h1>
        <div className="flex items-center gap-2">
          <Button
            variant={view === 'grid' ? 'default' : 'outline'}
            size="icon"
            onClick={() => onViewChange('grid')}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={view === 'list' ? 'default' : 'outline'}
            size="icon"
            onClick={() => onViewChange('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search marketplace..."
            className="pl-9"
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>
        <Select onValueChange={onCategoryChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="templates">Templates</SelectItem>
            <SelectItem value="services">Services</SelectItem>
            <SelectItem value="tools">Tools</SelectItem>
            <SelectItem value="resources">Resources</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}