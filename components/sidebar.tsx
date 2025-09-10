"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { USER } from "@/lib/local-variables"
import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { NovuNotifications } from "./novu-notifications"
import * as AuthAPI from "@/services/api/api-auth"

export default function Sidebar() {
  const pathname = usePathname()

  const navItems = [
    { name: "Market", href: "/", icon: "/icons/buy-sell-icon.png" },
    { name: "Orders", href: "/orders", icon: "/icons/orders-icon.png" },
    { name: "My Ads", href: "/ads", icon: "/icons/my-ads-icon.png" },
    { name: "Wallet", href: "/wallet", icon: "/icons/wallet-icon.svg" },
    { name: "Profile", href: "/profile", icon: "/icons/profile-icon.png" },
  ]

  return (
    <div className="hidden md:flex w-[295px] flex-col border-r border-slate-200 mr-[8px]">
      <div className="flex flex-row items-center p-6 gap-4">
        <Avatar className="h-8 w-8">
          <Image src="/icons/default-user-icon.png" alt="User avatar" width={64} height={64} />
        </Avatar>
        <h2 className="text-sm font-bold text-slate-1400">{USER.nickname}</h2>
      </div>
      <nav className="flex-1 px-4">
        <ul>
          {navItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/" || pathname.startsWith("/advertiser")
                : pathname.startsWith(item.href)

            return (
              <li key={item.name}>
                <Link
                  prefetch
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md p-4 text-sm",
                    isActive
                      ? "bg-slate-100 text-slate-900 font-bold"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                  )}
                >
                  <div className="h-5 w-5 flex items-center justify-center">
                    <Image src={item.icon} alt={item.name} width={20} height={20} />
                  </div>
                  {item.name}
                </Link>
              </li>
            )
          })}
          <li key="">
          <Button size="sm" onClick={() => AuthAPI.logout()}>
            Logout
          </Button>
          </li>
        </ul>
      </nav>

      <div className="px-4 pb-6 border-t border-slate-200 pt-4">
        <div className="flex items-center justify-between">
          <div className="text-slate-600 hover:text-slate-700">
            <NovuNotifications />
          </div>
          
        </div>
      </div>
    </div>
  )
}
