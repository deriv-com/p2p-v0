"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useChatVisibilityStore } from "@/stores/chat-visibility-store"
import { SvgIcon } from "@/components/icons/svg-icon"
import MarketIcon from "@/public/icons/ic-buy-sell.svg"
import OrdersIcon from "@/public/icons/ic-orders.svg"
import AdsIcon from "@/public/icons/ic-my-ads.svg"
import WalletIcon from "@/public/icons/ic-wallet.svg"
import ProfileIcon from "@/public/icons/ic-profile.svg"

export default function MobileFooterNav() {
  const pathname = usePathname()
  const { isChatVisible } = useChatVisibilityStore()

  if (
    pathname.startsWith("/orders/") ||
    pathname.startsWith("/ads/create") ||
    pathname.startsWith("/ads/edit") ||
    isChatVisible
  ) {
    return null
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t md:hidden z-40">
      <div className="grid grid-cols-1 h-16">
        <Link
          href="/"
          className={cn("hidden flex-col items-center justify-center", {
            "text-primary": pathname === "/" || pathname.startsWith("/advertiser"),
            "text-slate-1200": !(pathname === "/" || pathname.startsWith("/advertiser")),
          })}
        >
          <div className="h-5 w-5 flex items-center justify-center">
            <SvgIcon
              src={MarketIcon}
              fill={pathname === "/" || pathname.startsWith("/advertiser") ? "#FF444F" : "#181C25"}
            />
          </div>
          <span className="text-xs mt-1">Market</span>
        </Link>
        <Link
          href="/orders"
          className={cn("hidden flex-col items-center justify-center", {
            "text-primary": pathname.startsWith("/orders"),
            "text-slate-1200": !pathname.startsWith("/orders"),
          })}
        >
          <div className="h-5 w-5 flex items-center justify-center">
            <SvgIcon src={OrdersIcon} fill={pathname.startsWith("/orders") ? "#FF444F" : "#181C25"} />
          </div>
          <span className="text-xs mt-1">Orders</span>
        </Link>
        <Link
          href="/ads"
          className={cn("hidden flex-col items-center justify-center", {
            "text-primary": pathname.startsWith("/ads"),
            "text-slate-1200": !pathname.startsWith("/ads"),
          })}
        >
          <div className="h-5 w-5 flex items-center justify-center">
            <SvgIcon src={AdsIcon} fill={pathname.startsWith("/ads") ? "#FF444F" : "#181C25"} />
          </div>
          <span className="text-xs mt-1">My ads</span>
        </Link>
        <Link
          href="/wallet"
          className={cn("flex flex-col items-center justify-center", {
            "text-primary": pathname.startsWith("/wallet"),
            "text-slate-1200": !pathname.startsWith("/wallet"),
          })}
        >
          <div className="h-5 w-5 flex items-center justify-center">
            <SvgIcon src={WalletIcon} fill={pathname.startsWith("/wallet") ? "#FF444F" : "#181C25"} />
          </div>
          <span className="text-xs mt-1">Wallet</span>
        </Link>
        <Link
          href="/profile"
          className={cn("hidden flex-col items-center justify-center", {
            "text-primary": pathname.startsWith("/profile"),
            "text-slate-1200": !pathname.startsWith("/profile"),
          })}
        >
          <div className="h-5 w-5 flex items-center justify-center">
            <SvgIcon src={ProfileIcon} fill={pathname.startsWith("/profile") ? "#FF444F" : "#181C25"} />
          </div>
          <span className="text-xs mt-1">Profile</span>
        </Link>
      </div>
    </div>
  )
}
