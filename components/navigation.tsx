"use client";

import {
  LineChart, Wallet, Clock, ListTodo, Users, Trophy,
  Menu, X, Brain, Sparkles, Settings, Globe, Briefcase, 
  Calendar, HandCoins, LayoutDashboard, Shuffle, Rocket
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ModeToggle } from "./mode-toggle";
import { useTranslation } from "@/components/context/translation-context";
import { useEffect, useState } from "react";
import {
  Popover, PopoverTrigger, PopoverContent
} from "./ui/popover";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose
} from "./ui/sheet";
import {
  Avatar, AvatarFallback, AvatarImage
} from "./ui/avatar";
import { Button } from "./ui/button";
import Cookies from 'js-cookie';
import { Skeleton } from "./ui/skeleton";

interface UserData {
  id: string;
  email: string;
  fullname: string;
  role: string;
  profile_photo?: string;
  projectType: 'online' | 'offline';
}

const baseNavigation = [
  { key: "transactions", name: "Transactions", href: "/transactions", icon: Wallet },
  { key: "habits", name: "Habits", href: "/habit", icon: ListTodo },
  { key: "community", name: "Community", href: "/community", icon: Users },
];

const offlineNavigation = [
  { key: "dashboard", name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { key: "sales", name: "Sales", href: "/sales", icon: HandCoins },
  { key: "shifts", name: "Shifts", href: "/shifts", icon: Calendar },
  { key: "weekly_plan", name: "WeeklyPlan", href: "/WeeklyPlan", icon: Clock }, 
  { key: "start_new_business", name: "Start New Business", href: "/location", icon: Rocket }, // Renamed
  { key: "make_plan_real", name: "Let's Make Your Plan Real", href: "/plan-support", icon: Trophy }, // NEW (Diamond)
  { key: "ai_planner", name: "Your Plans", href: "/startBusiness", icon: Brain }, // NEW (Diamond)
];


const onlineNavigation = [
  { key: "dashboard", name: "Freelance", href: "/freelance", icon: LayoutDashboard },
  { key: "marketplace", name: "Marketplace", href: "/skills", icon: Sparkles },
  { key: "jobs", name: "Jobs/Skills", href: "/jobs", icon: Briefcase },
  { key: "ai_sales_business", name: "Create Business Plan", href: "/AiSalesBusiness", icon: Rocket }, // NEW (Diamond)
];


const adminNavigation = [
  { key: "admin_dashboard", name: "Admin", href: "/admin", icon: Shuffle },
];

interface NavigationProps {
  children: React.ReactNode;
}

export function Navigation({ children }: NavigationProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const { t, changeLanguage } = useTranslation();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = Cookies.get("token");
        if (!token) throw new Error('No authentication token found');

        // First fetch to get sub
        const meResponse = await fetch("http://localhost:3000/auth/me", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!meResponse.ok) throw new Error('Failed to fetch user sub');
        const { sub } = await meResponse.json();

        // Second fetch to get user details
        const userResponse = await fetch(`http://localhost:3000/auth/${sub}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!userResponse.ok) throw new Error('Failed to fetch user details');
        const userData = await userResponse.json();

        setUser({
          id: userData.id,
          email: userData.email,
          fullname: userData.fullname,
          role: userData.role,
          profile_photo: userData.profile_photo,
          projectType: userData.projectType
        });
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const getNavigationItems = () => {
    if (!user) return baseNavigation;
    
    let items = [...baseNavigation];
    
    if (user.role === 'ADMIN') {
      items = [...items, ...adminNavigation];
    } else if (user.projectType === 'offline') {
      items = [...items, ...offlineNavigation];
    } else if (user.projectType === 'online') {
      items = [...items, ...onlineNavigation];
    }

    return items;
  };

  if (loading) {
    return (
      <div className="flex h-screen">
        <Skeleton className="w-64 bg-card border-r" />
        <div className="flex-1 p-4 space-y-4">
          <Skeleton className="h-8 w-[200px]" />
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className={cn("bg-card border-r flex flex-col transition-all duration-300", isCollapsed ? "w-[4rem]" : "w-64")}>
        <div className="p-4 border-b flex items-center justify-between">
          {!isCollapsed && <span className="text-xl font-semibold">IndieTracker</span>}
          <Button variant="ghost" size="icon" onClick={() => setIsCollapsed(!isCollapsed)}>
            <Menu className="h-4 w-4" />
          </Button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-2 space-y-1">
        {getNavigationItems().map((item) => {
  return (
    <Link
      key={item.href}
      href={item.href}
      className={cn(
        "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
        pathname === item.href || pathname.startsWith(item.href)
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
      )}
    >
      <item.icon className={cn("shrink-0", isCollapsed ? "h-5 w-5" : "h-4 w-4 mr-3")} />
      {!isCollapsed && <span className="truncate">{t(item.key)}</span>}
    </Link>
  );
})}


        </nav>

        {/* Bottom Controls */}
        <div className="p-4 border-t flex flex-col gap-3">
          <ModeToggle />
          {!isCollapsed && user && (
            <div className="flex items-center justify-between">
              <Link href="/settings">
                <Settings className="h-5 w-5 text-muted-foreground hover:text-primary" />
              </Link>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full p-0">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.profile_photo || "/default-avatar.png"} alt={user.fullname} />
                      <AvatarFallback>{user.fullname?.[0]}</AvatarFallback>
                    </Avatar>
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-40">
                  <Link href="/profile" className="block px-3 py-2 hover:bg-accent rounded-md">
                    {t("profile")}
                  </Link>
                  <Link href="/logout" className="block px-3 py-2 hover:bg-accent rounded-md">
                    {t("logout")}
                  </Link>
                </PopoverContent>
              </Popover>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen overflow-auto">
        {/* Topbar (for small screens) */}
        <div className="md:hidden flex items-center justify-between p-4 border-b bg-card">
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(true)}>
            <Menu className="h-6 w-6" />
          </Button>
          <span className="text-lg font-semibold">IndieTracker</span>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon">
                <Globe className="h-6 w-6" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-40">
              <button onClick={() => changeLanguage("en")} className="block w-full px-3 py-2 text-left hover:bg-accent rounded-md">
                English
              </button>
              <button onClick={() => changeLanguage("ar")} className="block w-full px-3 py-2 text-left hover:bg-accent rounded-md">
                العربية
              </button>
            </PopoverContent>
          </Popover>
        </div>

{/* Desktop Header */}
<div className="hidden md:flex items-center justify-between p-4 border-b bg-card">
  <span className="text-xl font-semibold">IndieTracker</span>

  <div className="flex items-center gap-4">
    {/* Language Switcher */}
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon">
          <Globe className="h-6 w-6" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-40">
        <button onClick={() => changeLanguage("en")} className="block w-full px-3 py-2 text-left hover:bg-accent rounded-md">
          English
        </button>
        <button onClick={() => changeLanguage("ar")} className="block w-full px-3 py-2 text-left hover:bg-accent rounded-md">
          العربية
        </button>
      </PopoverContent>
    </Popover>

    {/* Dark/Light Mode */}
    <ModeToggle />

    {/* Settings and Avatar */}
    <Link href="/settings">
      <Settings className="h-5 w-5 text-muted-foreground hover:text-primary" />
    </Link>

    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full p-0">
          <Avatar className="h-8 w-8">
            {user ? (
              <>
                <AvatarImage src={user.profile_photo || "/default-avatar.png"} alt={user.fullname} />
                <AvatarFallback>{user.fullname?.[0]}</AvatarFallback>
              </>
            ) : (
              <AvatarFallback>U</AvatarFallback>
            )}
          </Avatar>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-40">
        <Link href="/profile" className="block px-3 py-2 hover:bg-accent rounded-md">
          {t("profile")}
        </Link>
        <Link href="/logout" className="block px-3 py-2 hover:bg-accent rounded-md">
          {t("logout")}
        </Link>
      </PopoverContent>
    </Popover>
  </div>
</div>

        <main className="flex-1 container mx-auto px-4 py-4">
          {children}
        </main>
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="left" className="w-[250px]">
          <SheetHeader className="mb-4">
            <div className="flex items-center justify-between">
              <SheetTitle>{t("menu")}</SheetTitle>
              <SheetClose asChild>
                <Button variant="ghost" size="icon">
                  <X className="h-5 w-5" />
                </Button>
              </SheetClose>
            </div>
          </SheetHeader>
         <nav className="flex flex-col gap-4">
  {getNavigationItems().map((item) => (
    <Link key={item.href} href={item.href} className="flex items-center gap-2">
      <item.icon className="h-5 w-5" />
      {t(item.key)}
    </Link>
  ))}
</nav>
        </SheetContent>
      </Sheet>
    </div>
  );
}
