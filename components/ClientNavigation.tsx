"use client";

import { Navigation } from "@/components/navigation";
import { usePathname } from "next/navigation";
import React from "react";

export default function ClientNavigation({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isHomePage = pathname === "/" || pathname === "/auth";


  return (
    <>
      {isHomePage ? (
        <>{children}</>
      ) : (
        <Navigation>{children}</Navigation>
      )}
    </>
  );
}
