"use client"

import { useRef, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { NovuNotifications } from "./novu-notifications"
import { Button } from "@/components/ui/button"
import * as AuthPrevAPI from "@/services/api/api-auth-prev"

export default function Header() {
  const pathname = usePathname()
  const router = useRouter();
  const currentPath = router.pathname;
  const latestUrlRef = useRef("");

  useEffect(() => {
    const handleRouteChangeStart = (url) => {
      latestUrlRef.current = url;
    };

    const handleRouteChangeComplete = (url) => {
      if (url !== latestUrlRef.current) {
        router.push(latestUrlRef.current);
      }
    };

    router.events.on("routeChangeStart", handleRouteChangeStart);
    router.events.on("routeChangeComplete", handleRouteChangeComplete);
    router.events.on("routeChangeError", handleRouteChangeComplete);

    return () => {
      router.events.off("routeChangeStart", handleRouteChangeStart);
      router.events.off("routeChangeComplete", handleRouteChangeComplete);
      router.events.off("routeChangeError", handleRouteChangeComplete);
    };
  }, []);

  const handleNavClick = (href) => {
    latestUrlRef.current = href;
    router.push(href);
  };
  const navItems = [
    { name: "Market", href: "/" },
    { name: "Orders", href: "/orders" },
    { name: "My Ads", href: "/ads" },
    { name: "Wallet", href: "/wallet" },
    { name: "Profile", href: "/profile" },
  ]

  return (
    <header className="hidden md:flex justify-between items-center px-[24px] py-[16px] z-10">
      <div>
        <nav className="flex h-12 border-b border-slate-200">
          {navItems.map((item) => {
            const isActive = item.href === "/" ? currentPath === "/" || currentPath.startsWith("/advertiser")  : currentPath.startsWith(item.href)

            return (
             <button
                key={item.name}
                onClick={() => handleNavClick(item.href)}
                className={cn(
                  "inline-flex h-12 items-center border-b-2 px-4 text-sm bg-transparent",
                  isActive
                    ? "text-slate-1400 border-[#00D0FF] font-bold"
                    : "border-transparent text-slate-600 hover:border-slate-300 hover:text-slate-700"
                )}
              >
                {item.name}
              </button>
            )
          })}
        </nav>
      </div>
      <div className="h-12 flex items-center space-x-4">
        <div className="text-slate-600 hover:text-slate-700">
          <NovuNotifications />
        </div>
        <Button
          size="sm"
          onClick={() => AuthPrevAPI.logout()}>
          Logout
        </Button>
      </div>
    </header>
  )
}
