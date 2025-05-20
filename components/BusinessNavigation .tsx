"use client";

import { LineChart, Wallet, Clock, ListTodo, Users, Trophy, Menu, X, Brain, Sparkles, Settings, Globe } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from "./ui/sheet";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { useTranslation } from "@/components/context/translation-context"; // ✅ Import Translation Hook

const navigation = [
  { key: "dashboard", href: "/", icon: LineChart },
  { key: "transactions", href: "/transactions", icon: Wallet },
  { key: "time_tracker", href: "/time-tracker", icon: Clock },
  { key: "habits", href: "/habits", icon: ListTodo },
  { key: "community", href: "/community", icon: Users },
  { key: "challenges", href: "/community/challenges", icon: Trophy },
  { key: "simulator", href: "/simulator", icon: Brain },
  { key: "marketplace", href: "/marketplace", icon: Sparkles },
];

export function Navigation() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const { t, changeLanguage, locale } = useTranslation(); // ✅ Use translation hook



  return (
    <nav className="border-b bg-card">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <button className="p-2 hover:bg-accent rounded-md" onClick={() => setIsOpen(true)}>
              <Menu className="h-6 w-6" />
            </button>
            <span className="text-xl font-semibold ml-4">IndieTracker</span>
          </div>
          <div className="flex items-center gap-4">
            {/* Language Selector */}
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

            <Link href="/settings">
              <Button variant="ghost" size="icon">
                <Settings className="h-6 w-6" />
              </Button>
            </Link>

            {/* User Profile */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    {user ? (
                      <>
                        <AvatarImage src={user.profile_photo || "/default-avatar.png"} alt={user.fullname} />
                        <AvatarFallback>{user.fullname?.[0] ?? user.email?.[0]}</AvatarFallback>
                      </>
                    ) : (
                      <AvatarFallback>U</AvatarFallback>
                    )}
                  </Avatar>
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-40">
                <nav className="flex flex-col gap-2">
                  <Link href="/profile" className="px-3 py-2 hover:bg-accent rounded-md">{t("profile")}</Link>
                  <Link href="/logout" className="px-3 py-2 hover:bg-accent rounded-md">{t("logout")}</Link>
                </nav>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      {/* Sidebar Navigation */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="left" className="w-[250px]">
          <SheetHeader className="mb-4">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-lg font-semibold">{t("menu")}</SheetTitle>
              <SheetClose asChild>
                <button onClick={() => setIsOpen(false)}>
                  <X className="h-6 w-6" />
                </button>
              </SheetClose>
            </div>
          </SheetHeader>
          <nav className="flex flex-col gap-4">
            {navigation.map((item) => (
              <Link key={item.href} href={item.href} className="flex items-center gap-2">
                <item.icon className="h-5 w-5" />
                {t(item.key)} {/* ✅ Translated text */}
              </Link>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
    </nav>
  );
}
