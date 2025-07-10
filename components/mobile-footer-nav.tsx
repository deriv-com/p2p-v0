"use client"

import { cn } from "@/lib/utils"
import { Home, ShoppingCart, FileText, User, Plus } from "lucide-react"
import { usePathname } from "next/navigation"

const navigation = [
  {
    name: "Home",
    href: "/",
    icon: Home,
  },
  {
    name: "Buy/Sell",
    href: "/ads",
    icon: ShoppingCart,
  },
  {
    name: "Orders",
    href: "/orders",
    icon: FileText,
  },
  {
    name: "My Ads",
    href: "/my-ads",
    icon: Plus,
  },
  {
    name: "Profile",
    href: "/profile",
    icon: User,
  },
]

export function MobileFooterNav() {
  const pathname = usePathname()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t">
      <div className="grid grid-cols-5 gap-1 p-2">
        {navigation.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <a
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center py-2 px-1 text-xs transition-colors",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="h-5 w-5 mb-1" />
              <span className="text-xs">{item.name}</span>
            </a>
          )
        })}
      </div>
    </nav>
  )
}
