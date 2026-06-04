"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { useUserDataStore } from "@/stores/user-data-store"
import { NovuNotifications } from "./novu-notifications"
import { MobileSidebarTrigger } from "./mobile-sidebar-wrapper"
import { useTranslations } from "@/lib/i18n/use-translations"
import { useChatVisibilityStore } from "@/stores/chat-visibility-store"
import { useOrderSidebarStore } from "@/stores/order-sidebar-store"
import { useIsMobile } from "@/hooks/use-mobile"
import MobileAdvertiserSearch from "./mobile-advertiser-search"
import { Button } from "@/components/ui/button"
import { useTrackers } from "@/analytics/useTrackers"

export default function Header() {
  const userId = useUserDataStore((state) => state.userId)
  const { t } = useTranslations()
  const { track } = useTrackers()
  const isMobile = useIsMobile()
  const { isChatVisible } = useChatVisibilityStore()
  const pathname = usePathname()
  const [userIsSearchOpen, setUserIsSearchOpen] = useState(false)
  const { triggerSearchReopen, setTriggerSearchReopen, shouldReopenSearchOnReturn, setShouldReopenSearchOnReturn } = useOrderSidebarStore()

  // Derive open state synchronously so the sheet is open on the first render — no flash
  const isSearchOpen = userIsSearchOpen || triggerSearchReopen || (shouldReopenSearchOnReturn && pathname === "/")

  // Latch local state and clear store flags so the sheet stays open after flags are cleared
  useEffect(() => {
    if (triggerSearchReopen) {
      setUserIsSearchOpen(true)
      setTriggerSearchReopen(false)
    }
  }, [triggerSearchReopen, setTriggerSearchReopen])

  useEffect(() => {
    if (shouldReopenSearchOnReturn && pathname === "/") {
      setUserIsSearchOpen(true)
      setShouldReopenSearchOnReturn(false)
    }
  }, [shouldReopenSearchOnReturn, pathname, setShouldReopenSearchOnReturn])

  const navItems = [
    { name: t("navigation.market"), href: "/" },
    { name: t("navigation.orders"), href: "/orders" },
    { name: t("navigation.myAds"), href: "/ads" },
    { name: t("navigation.wallet"), href: "/wallet" },
    { name: t("navigation.profile"), href: "/profile" },
  ]

  // Hide header on advertiser page, order detail page, and when viewing chat on mobile
  const isOrderDetailPage = pathname.match(/^\/orders\/[^/]+$/)
  if (pathname.startsWith("/advertiser") || isOrderDetailPage || (isMobile && isOrderDetailPage && isChatVisible)) return null

  return (
    <>
      <header className="relative z-20 flex justify-between items-center px-6 md:px-[24px] py-4 md:py-3 bg-slate-1200 -mb-px md:mb-0 h-14 md:h-auto">
        <div className="flex items-center md:hidden">
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
        <div className="flex items-center gap-2">
          {(pathname === "/" || pathname.startsWith("/advertiser")) && (
            <Button
              onClick={() => { track("ek_search_markets"); setUserIsSearchOpen(true) }}
              variant="ghost"
              size="icon"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#ffffff0a] p-0"
            >
              <Image src="/icons/search-icon-white.svg" alt={t("common.search")} width={24} height={24} />
            </Button>
          )}
          {userId && (
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center text-slate-600 hover:text-slate-700"
              onClick={() => track("ek_notifications_markets")}
            >
              <NovuNotifications />
            </div>
          )}
        </div>
      </header>

      <MobileAdvertiserSearch isOpen={isSearchOpen} onClose={() => setUserIsSearchOpen(false)} />
    </>
  )
}
