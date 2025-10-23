"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { useUserDataStore } from "@/stores/user-data-store"
import { NovuNotifications } from "./novu-notifications"
import { MobileSidebarTrigger } from "./mobile-sidebar-wrapper"

export default function Header() {
  const userId = useUserDataStore((state) => state.userId)

  const pathname = usePathname()
  const navItems = [
    { name: "Market", href: "/" },
    { name: "Orders", href: "/orders" },
    { name: "My Ads", href: "/ads" },
    { name: "Wallet", href: "/wallet" },
    { name: "Profile", href: "/profile" },
  ]

  if (pathname.startsWith("/advertiser") || pathname.match(/^\/orders\/[^/]+$/)) return null

  return (
    <header className={cn("flex justify-between items-center px-3 md:px-[24px] py-3 bg-slate-1200")}>
      <div className="md:hidden">
        <MobileSidebarTrigger />
      </div>

      <div className="hidden md:block">
        <nav className="flex h-12 border-b border-slate-200">
          {navItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/" || pathname.startsWith("/advertiser")
                : pathname.startsWith(item.href)

            return (
              <Link
                prefetch
                key={item.name}
                href={item.href}
                className={cn(
                  "inline-flex h-12 items-center border-b-2 px-4 text-sm",
                  isActive
                    ? "text-slate-1400 border-primary font-bold"
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
        {userId && (
          <div className="text-slate-600 hover:text-slate-700">
            <NovuNotifications />
          </div>
        )}
      </div>
    </header>
  )
}
