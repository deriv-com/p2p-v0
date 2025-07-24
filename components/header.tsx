"use client"

import { usePathname } from "next/navigation"
//import { useRouter } from 'next/router';
import Link from "next/link"
import { cn } from "@/lib/utils"
import { NovuNotifications } from "./novu-notifications"
import { Button } from "@/components/ui/button"
import * as AuthPrevAPI from "@/services/api/api-auth-prev"

export default function Header() {
  const pathname = usePathname()
  const navItems = [
    { name: "Market", href: "/" },
    { name: "Orders", href: "/orders" },
    { name: "My Ads", href: "/ads" },
    { name: "Wallet", href: "/wallet" },
    { name: "Profile", href: "/profile" },
  ]
  //const router = useRouter();

       // if (!router.isReady) return null;
  

  return (
    <header className="hidden md:flex justify-between items-center px-[24px] py-[16px] z-10">
      <div>
        <nav className="flex h-12 border-b border-slate-200" key={pathname}>
          {navItems.map((item) => {
            const isActive = item.href === "/" ? pathname === "/" || pathname.startsWith("/advertiser")  : pathname.startsWith(item.href)

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "inline-flex h-12 items-center border-b-2 px-4 text-sm",
                  isActive
                    ? "text-slate-1400 border-[#00D0FF] font-bold"
                    : "border-transparent text-slate-600 hover:border-slate-300 hover:text-slate-700"
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
        <Button
          size="sm"
          onClick={() => AuthPrevAPI.logout()}>
          Logout
        </Button>
      </div>
    </header>
  )
}
