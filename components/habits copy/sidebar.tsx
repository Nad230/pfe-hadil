"use client"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Home, Plus, Settings, Eye, BarChart3, Calendar, Menu } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useState, useEffect } from "react"
import { useMobile } from "@/hooks/use-mobile"

const navItems = [
  { name: "Dashboard", href: "/habit", icon: Home },
  { name: "New Habit", href: "/habit/new-habits", icon: Plus },
  { name: "Control Habits", href: "/habit/control-habit", icon: Settings },
  { name: "View Habits", href: "/habit/view-habit", icon: Eye },
  { name: "Calendar", href: "/habit/calendar", icon: Calendar },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const isMobile = useMobile()
  const [open, setOpen] = useState(false)
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null)

  // Get the selected habit ID from URL if available
  useEffect(() => {
    const id = searchParams.get("id")
    if (id) {
      setSelectedHabitId(id)
    }
  }, [searchParams])

  // Handle navigation with habit ID preservation
  const handleNavigation = (href: string) => {
    // Always close the mobile menu
    setOpen(false)

    // If we're navigating to view or control pages and have a selected habit ID
    if (selectedHabitId && (href === "/habit/view-habit" || href === "/habit/control-habit")) {
      // Prevent default navigation
      router.push(`${href}?id=${selectedHabitId}`)
      return
    }

    // For other pages, just navigate normally
    router.push(href)
  }

  const SidebarContent = () => (
    <div className="flex h-full flex-col gap-2">
      <div className="px-3 py-4">
        <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">Habit Tracker</h2>
        <div className="space-y-1">
          {navItems.map((item) => {
            // Check if this is the current path or if it's a path with the same base but has query params
            const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/habit")

            return (
              <Button
                key={item.href}
                variant={isActive ? "secondary" : "ghost"}
                className={cn("w-full justify-start", isActive ? "bg-primary/10 font-medium" : "")}
                onClick={() => handleNavigation(item.href)}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.name}
              </Button>
            )
          })}
        </div>
      </div>
      <div className="px-3 py-4">
        <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">Analytics</h2>
        <div className="space-y-1">
          <Button variant="ghost" className="w-full justify-start">
            <BarChart3 className="mr-2 h-4 w-4" />
            Statistics
          </Button>
        </div>
      </div>
    </div>
  )

  if (isMobile) {
    return (
      <>
        <div className="fixed top-0 left-0 right-0 z-10 flex h-14 items-center border-b bg-background px-4">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="mr-2">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[240px] sm:w-[300px]">
              <SidebarContent />
            </SheetContent>
          </Sheet>
          <div className="font-semibold">Habit Tracker</div>
        </div>
        <div className="h-14" />
      </>
    )
  }

  return (
    <div className="hidden border-r bg-background md:block md:w-[240px] lg:w-[300px]">
      <SidebarContent />
    </div>
  )
}
