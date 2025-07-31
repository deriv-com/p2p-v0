"use client"

import type React from "react"

import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { NovuNotifications } from "./novu-notifications"
import { Button } from "@/components/ui/button"
import * as AuthPrevAPI from "@/services/api/api-auth-prev"
import { useState } from "react"

export default function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const [isNavigating, setIsNavigating] = useState(false)
  const navItems = [
    { name: "Market", href: "/" },
    { name: "Orders", href: "/orders" },
    { name: "My Ads", href: "/ads" },
    { name: "Wallet", href: "/wallet" },
    { name: "Profile", href: "/profile" },
  ]

  const handleNavigation = async (href: string, e: React.MouseEvent) => {
    if (
      isNavigating ||
      pathname === href ||
      (href === "/" && (pathname === "/" || pathname.startsWith("/advertiser")))
    ) {
      e.preventDefault()
      return
    }

    setIsNavigating(true)
    try {
      await router.push(href)
    } finally {
      setIsNavigating(false)
    }
  }

  return (
    <header className="hidden md:flex justify-between items-center px-[24px] py-[16px] z-10">
      <div>
        <nav className="flex h-12 border-b border-slate-200">
          {navItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/" || pathname.startsWith("/advertiser")
                : pathname.startsWith(item.href)

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={(e) => handleNavigation(item.href, e)}
                className={cn(
                  "inline-flex h-12 items-center border-b-2 px-4 text-sm",
                  isNavigating ? "opacity-50 pointer-events-none" : "",
                  isActive
                    ? "text-slate-1400 border-[#00D0FF] font-bold"
                    : "border-transparent text-slate-600 hover:border-slate-300 hover:text-slate-700",
                )}
              >
                {item.name}
              </Link>
            )
          })}
        </nav>
      </div>
      <div className="h-12 flex items-center space-x-4">
        <div className="text-slate-600 hover:text-slate-700">
          <NovuNotifications />
        </div>
        <Button size="sm" onClick={() => AuthPrevAPI.logout()}>
          Logout
        </Button>
      </div>
    </header>
  )
}
