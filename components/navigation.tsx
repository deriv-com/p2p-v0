"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Home, ShoppingCart, FileText, User, Wallet, Plus } from "lucide-react"
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
  {
    name: "Wallet",
    href: "/wallet",
    icon: Wallet,
  },
]

export function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="hidden md:flex w-64 flex-col border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex flex-col gap-2 p-4">
        {navigation.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Button
              key={item.name}
              variant={isActive ? "secondary" : "ghost"}
              className={cn("w-full justify-start", isActive && "bg-secondary")}
              asChild
            >
              <a href={item.href}>
                <Icon className="mr-2 h-4 w-4" />
                {item.name}
              </a>
            </Button>
          )
        })}
      </div>
    </nav>
  )
}
