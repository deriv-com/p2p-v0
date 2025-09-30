"use client"
;("use client")

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { USER } from "@/lib/local-variables"
import { Avatar } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { NovuNotifications } from "./novu-notifications"
import { useState, useEffect } from "react"
import { useUserDataStore } from "@/stores/user-data-store"

interface SidebarProps {
  className?: string
}

export default function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const [showWallet, setShowWallet] = useState(true)
  const userName = USER.nickname ?? USER.email
  const { userData } = useUserDataStore()

  useEffect(() => {
    checkUserSignupStatus()
  }, [userData])

  const checkUserSignupStatus = () => {
    try {
      const userDataFromStore = userData

      if (userDataFromStore?.signup === "v1") {
        setShowWallet(false)
      } else {
        setShowWallet(true)
      }
    } catch (error) {
      console.log(error)
      setShowWallet(false)
    }
  }

  const getHomeUrl = () => {
    const isProduction = process.env.NODE_ENV === "production"
    const baseUrl = isProduction ? "home.deriv.com" : "staging-home.deriv.com"
    return baseUrl
  }

  const navItems = [
    { name: "Home", href: `https://${getHomeUrl()}/dashboard/home`, icon: "/icons/traders-hub.png" },
    { name: "Market", href: "/", icon: "/icons/buy-sell-icon.png" },
    { name: "Orders", href: "/orders", icon: "/icons/orders-icon.png" },
    { name: "My Ads", href: "/ads", icon: "/icons/my-ads-icon.png" },
    ...(showWallet ? [{ name: "Wallet", href: "/wallet", icon: "/icons/wallet-icon.svg" }] : []),
    { name: "P2P Profile", href: "/profile", icon: "/icons/profile-icon.png" },
    { name: "P2P Guide", href: `https://deriv.com/help-centre/deriv-p2p`, icon: "/icons/p2p-guide.png" },
  ]

  return (
    <div className={cn("w-[295px] flex flex-col border-r border-slate-200 mr-[8px]", className)}>
      <div className="flex flex-row justify-between items-center gap-4 p-4 pt-0">
        <Image src="/icons/deriv-logo.png" alt="Deriv logo" width={64} height={64} />
        {USER.id && (
          <div className="hidden md:block text-slate-600 hover:text-slate-700">
            <NovuNotifications />
          </div>
        )}
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
                      src={item.icon || "/placeholder.svg"}
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
          {userName?.charAt(0).toUpperCase()}
        </Avatar>
        <div className="flex-1">
          <h2 className="text-sm font-bold text-slate-1400 mb-1">{`${USER.first_name} ${USER.last_name}`}</h2>
          <div className="text-xs text-slate-1400">{USER.email}</div>
        </div>
        <Link prefetch href={`https://${getHomeUrl()}/dashboard/user-profile`}>
          <Image src="/icons/chevron-right-black.png" alt="Arrow" width={14} height={14} />
        </Link>
      </div>
    </div>
  )
}
