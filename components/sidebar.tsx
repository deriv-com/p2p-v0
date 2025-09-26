"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { USER } from "@/lib/local-variables"
import { Avatar } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { NovuNotifications } from "./novu-notifications"
import { useState, useEffect } from "react"

interface SidebarProps {
  className?: string
}

export default function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const [showWallet, setShowWallet] = useState(true)

  useEffect(() => {
    checkUserSignupStatus()
  }, [])

  const checkUserSignupStatus = () => {
    try {
      if (typeof window !== "undefined") {
        const userData = JSON.parse(localStorage.getItem("user_data") || "{}")

        if (userData?.signup === "v1") {
          setShowWallet(false)
        } else {
          setShowWallet(true)
        }
      }
    } catch (error) {
      console.log(error)
      setShowWallet(false)
    }
  }

  const navItems = [
    { name: "Home", href: "https://home.deriv.com/dashboard/home", icon: "/icons/traders-hub.png" },
    { name: "Market", href: "/", icon: "/icons/buy-sell-icon.png" },
    { name: "Orders", href: "/orders", icon: "/icons/orders-icon.png" },
    { name: "My Ads", href: "/ads", icon: "/icons/my-ads-icon.png" },
    ...(showWallet ? [{ name: "Wallet", href: "/wallet", icon: "/icons/wallet-icon.svg" }] : []),
    { name: "Profile", href: "/profile", icon: "/icons/profile-icon.png" },
  ]

  return (
    <div className={cn("w-[295px] flex flex-col border-r border-slate-200 mr-[8px]", className)}>
      <div className="flex flex-row justify-between items-center gap-4 p-4 pt-0">
        <Image src="/icons/deriv-logo.png" alt="Deriv logo" width={64} />
        <div className="hidden md:block text-slate-600 hover:text-slate-700">
          <NovuNotifications />
        </div>
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
                    "flex items-center gap-3 rounded-md py-4 text-sm",
                    isActive ? "text-primary" : "hover:text-primary",
                  )}
                >
                  <div className="h-5 w-5 flex items-center justify-center">
                    <Image
                      src={item.icon}
                      alt={item.name}
                      width={20}
                      height={20}
                      className={cn(
                        isActive && "brightness-0 saturate-100 hue-rotate-[204deg] sepia-[100%] saturate-[200%]",
                      )}
                    />
                  </div>
                  {item.name}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
      <div className="flex flex-row items-center gap-4 p-4">
        <Avatar className="h-8 w-8 bg-grayscale-500 items-center justify-center text-slate-1200 font-bold">
          {USER.nickname?.charAt(0).toUpperCase()}
        </Avatar>
        <h2 className="text-sm font-bold text-slate-1400">{USER.nickname}</h2>
        <Link
          prefetch
          href=""
        >
          <Image src="/icons/chevron-right-sm.png" alt="Deriv logo" width={64} />
        </Link>
      </div>
    </div>
  )
}
