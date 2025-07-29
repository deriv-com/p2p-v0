"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from "next/image"

export default function MobileFooterNav() {
  const pathname = usePathname()
  const [activeTab, setActiveTab] = useState(pathname)

  const navItems = [
    {
      href: "/",
      label: "Buy/Sell",
      icon: "/icons/buy-sell-icon.png",
      activeIcon: "/icons/buy-sell-icon.png",
    },
    {
      href: "/orders",
      label: "Orders",
      icon: "/icons/orders-icon.png",
      activeIcon: "/icons/orders-icon.png",
    },
    {
      href: "/ads/create",
      label: "Create Ad",
      icon: "/icons/plus_icon.png",
      activeIcon: "/icons/plus_icon.png",
    },
    {
      href: "/ads",
      label: "My Ads",
      icon: "/icons/my-ads-icon.png",
      activeIcon: "/icons/my-ads-icon.png",
    },
    {
      href: "/profile",
      label: "Profile",
      icon: "/icons/profile-icon.png",
      activeIcon: "/icons/profile-icon.png",
    },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 md:hidden">
      <div className="flex justify-around items-center py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center py-2 px-3 min-w-0 ${
                isActive ? "text-black" : "text-gray-500"
              }`}
              onClick={() => setActiveTab(item.href)}
            >
              <div className="w-6 h-6 mb-1 flex items-center justify-center">
                <Image
                  src={isActive ? item.activeIcon : item.icon}
                  alt={item.label}
                  width={24}
                  height={24}
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-xs font-medium truncate">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
