"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { USER } from "@/lib/local-variables"
import { Avatar } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { NovuNotifications } from "./novu-notifications"
import { Button } from "@/components/ui/button"
import * as AuthAPI from "@/services/api/api-auth"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"

// Hamburger menu icon component
function HamburgerIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn("h-6 w-6", className)}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  )
}

// Mobile sidebar trigger component
export function MobileSidebarTrigger() {
  return (
    <SidebarTrigger className="md:hidden bg-grayscale-300 hover:bg-grayscale-400">
      <HamburgerIcon />
      <span className="sr-only">Toggle Sidebar</span>
    </SidebarTrigger>
  )
}

// Mobile sidebar content component
function MobileSidebarContent() {
  const pathname = usePathname()
  const { setOpenMobile } = useSidebar()

  const navItems = [
    { name: "Home", href: "https://home.deriv.com/dashboard/home", icon: "/icons/traders-hub.png" },
    { name: "Market", href: "/", icon: "/icons/buy-sell-icon.png" },
    { name: "Orders", href: "/orders", icon: "/icons/orders-icon.png" },
    { name: "My Ads", href: "/ads", icon: "/icons/my-ads-icon.png" },
    { name: "Wallet", href: "/wallet", icon: "/icons/wallet-icon.svg" },
    { name: "Profile", href: "/profile", icon: "/icons/profile-icon.png" },
  ]

  const handleLinkClick = () => {
    setOpenMobile(false)
  }

  return (
    <>
      <SidebarHeader>
        <div className="flex flex-row justify-between items-center gap-4 p-2">
          <Image src="/icons/deriv-logo.png" alt="Deriv logo" width={64} height={32} />
          <div className="text-slate-600 hover:text-slate-700">
            <NovuNotifications />
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/" || pathname.startsWith("/advertiser")
                : pathname.startsWith(item.href)

            return (
              <SidebarMenuItem key={item.name}>
                <SidebarMenuButton asChild isActive={isActive}>
                  <Link href={item.href} onClick={handleLinkClick}>
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
                    <span>{item.name}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter>
        <div className="flex flex-col gap-4 p-2">
          <div className="flex flex-row items-center gap-4">
            <Avatar className="h-8 w-8 bg-grayscale-500 items-center justify-center text-slate-1200 font-bold">
              {USER.nickname?.charAt(0).toUpperCase()}
            </Avatar>
            <h2 className="text-sm font-bold text-slate-1400">{USER.nickname}</h2>
          </div>
          <Button size="sm" onClick={() => AuthAPI.logout()} className="w-full">
            Logout
          </Button>
        </div>
      </SidebarFooter>
    </>
  )
}

// Main mobile sidebar component
export function MobileSidebar() {
  return (
    <SidebarProvider>
      <Sidebar side="left" className="md:hidden">
        <MobileSidebarContent />
      </Sidebar>
    </SidebarProvider>
  )
}
