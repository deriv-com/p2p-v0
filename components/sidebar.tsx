"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { NovuNotifications } from "./novu-notifications"
import { useState, useEffect } from "react"
import { useUserDataStore } from "@/stores/user-data-store"
import { Avatar } from "@/components/ui/avatar"
import { SvgIcon } from "@/components/icons/svg-icon"
import HomeIcon from "@/public/icons/ic-home.svg"
import MarketIcon from "@/public/icons/ic-buy-sell.svg"
import OrdersIcon from "@/public/icons/ic-orders.svg"
import AdsIcon from "@/public/icons/ic-my-ads.svg"
import WalletIcon from "@/public/icons/ic-wallet.svg"
import ProfileIcon from "@/public/icons/ic-profile.svg"
import GuideIcon from "@/public/icons/ic-guide.svg"

interface SidebarProps {
  className?: string
}

export default function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const [showWallet, setShowWallet] = useState(true)
  const { userData, userId } = useUserDataStore()
  const userName = userData?.nickname ?? userData?.email

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
    { name: "Back to Home", href: `https://${getHomeUrl()}/dashboard/home`, icon: HomeIcon },
    { name: "Market", href: "/", icon: MarketIcon },
    { name: "Orders", href: "/orders", icon: OrdersIcon },
    { name: "My Ads", href: "/ads", icon: AdsIcon },
    ...(showWallet ? [{ name: "Wallet", href: "/wallet", icon: WalletIcon }] : []),
    { name: "P2P Profile", href: "/profile", icon: ProfileIcon },
    { name: "P2P Guide", href: `https://deriv.com/help-centre/deriv-p2p`, icon: GuideIcon },
  ]

  return (
    <div className={cn("w-[295px] flex flex-col border-r border-slate-200 mr-[8px]", className)}>
      <div className="flex flex-row justify-between items-center gap-4 p-4 pt-0">
        <Image src="/icons/deriv-p2p.png" alt="Deriv logo" width={64} height={64} />
        {userId && (
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
                {item.name === "P2P Profile" && <div className="my-3 border-b border-grayscale-200"></div>}
                <Link
                  prefetch
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md py-4 text-sm",
                    isActive ? "text-primary" : "",
                  )}
                >
                  <div className="h-5 w-5 flex items-center justify-center">
                     <SvgIcon src={item.icon} fill={isActive? "#FF444F" : "#181C25"}/>
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
          <h2 className="text-sm font-bold text-slate-1400 mb-1">
            {userData?.first_name && userData?.last_name
              ? `${userData.first_name} ${userData.last_name}`
              : userData?.nickname}
          </h2>
          <div className="text-xs text-slate-1400">{userData?.email || ""}</div>
        </div>
        <Link prefetch href={`https://${getHomeUrl()}/dashboard/user-profile`}>
          <Image src="/icons/chevron-right-black.png" alt="Arrow" width={14} height={14} />
        </Link>
      </div>
    </div>
  )
}
