import type React from "react"
import { cn } from "@/lib/utils"
import { TrendingTopics } from "@/components/networking/widgets/trending-topics"
import { SuggestedUsers } from "@/components/networking/widgets/suggested-users"

interface RightSidebarProps extends React.HTMLAttributes<HTMLDivElement> {}
export default function RightSidebar({ className }: RightSidebarProps) {
  return (
    <div className={cn("space-y-6 p-4 bg-background", className)}>
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Trending Topics</h3>
        <TrendingTopics />
      </div>
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Who to follow</h3>
        <SuggestedUsers />
      </div>
    </div>
  )
}
