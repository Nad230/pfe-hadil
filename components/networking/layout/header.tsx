"use client"

import Link from "next/link"
import { Bell, Home, Mail, Menu, Search, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ThemeToggle } from "@/components/networking/theme-toggle"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-14 items-center">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[240px] sm:w-[300px]">
                <nav className="flex flex-col gap-4 mt-8">
                  <Link href="/habits/networking" className="flex items-center gap-2 text-lg font-semibold">
                    <Home className="h-5 w-5" />
                    Home
                  </Link>
                  <Link href="/habits/networking/profile/username" className="flex items-center gap-2 text-lg font-semibold">
                    <User className="h-5 w-5" />
                    Profile
                  </Link>
                  <Link href="/habits/networking/messages" className="flex items-center gap-2 text-lg font-semibold">
                    <Mail className="h-5 w-5" />
                    Messages
                  </Link>
                  
                </nav>
              </SheetContent>
            </Sheet>
            <Link href="/habits/networking" className="flex items-center gap-2">
              <span className="font-bold text-xl bg-primary text-primary-foreground px-2 py-1 rounded">SN</span>
              <span className="font-bold hidden md:inline-block">SocialNetwork</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <nav className="flex items-center gap-6">
              <Link href="/habits/networking" className="text-foreground/60 hover:text-foreground transition-colors">
                <Home className="h-5 w-5" />
                <span className="sr-only">Home</span>
              </Link>
              <Link href="/habits/networking/messages" className="text-foreground/60 hover:text-foreground transition-colors">
                <Mail className="h-5 w-5" />
                <span className="sr-only">Messages</span>
              </Link>
              <Link href="/habits/networking/notifications" className="text-foreground/60 hover:text-foreground transition-colors">
                <Bell className="h-5 w-5" />
                <span className="sr-only">Notifications</span>
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-2">
            {isSearchOpen ? (
              <div className="relative">
                <Input
                  placeholder="Search..."
                  className="w-[200px] md:w-[300px]"
                  autoFocus
                  onBlur={() => setIsSearchOpen(false)}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0"
                  onClick={() => setIsSearchOpen(false)}
                >
                  <Search className="h-4 w-4" />
                  <span className="sr-only">Search</span>
                </Button>
              </div>
            ) : (
              <Button variant="ghost" size="icon" onClick={() => setIsSearchOpen(true)}>
                <Search className="h-5 w-5" />
                <span className="sr-only">Search</span>
              </Button>
            )}

            <ThemeToggle />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder-user.jpg" alt="@user" />
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/habits/networking/profile/username">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Log out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}

