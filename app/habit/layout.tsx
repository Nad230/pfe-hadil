import type React from "react"
import { HabitsHeader } from "@/components/habits/habits-header"
import { Sidebar } from "@/components/habits/sidebar"

export default function HabitLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <HabitsHeader />
      <div className="flex flex-1">
       
        <main className="flex-1 bg-background">{children}</main>
      </div>
    </div>
  )
}
