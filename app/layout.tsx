
"use client";

import "./globals.css";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { Navigation } from "@/components/navigation";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { TranslationProvider } from "@/components/context/translation-context";
import dynamic from "next/dynamic";
import { Mascot } from '@/components/mascot/mascot';
import ShiftToast from "@/components/shifts/ShiftToast";
import TimerToast from "@/components/time-tracker/TimerToast"



const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const isAuthPage = pathname.startsWith("/auth");
  

  useEffect(() => {
    if (isAuthPage) return; // Don't check auth on login/signup pages

    const token = Cookies.get("token");
    setIsAuthenticated(!!token);
  }, [isAuthPage]);

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <TranslationProvider> {/* ✅ Moved TranslationProvider Higher */}
            <div className="min-h-screen bg-background">
              {!isAuthPage && isAuthenticated && <Navigation />}
              <main className={isAuthPage ? "" : "container mx-auto px-4 py-4"}>
                {children}
              </main>
            </div>

          </TranslationProvider>
          <Toaster />
          <div className="fixed bottom-4 right-4">
              <Mascot mood="idle" />
            </div>
            <ShiftToast />
            <TimerToast />



          
        </ThemeProvider>
      </body>
    </html>
  );
}
