"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useChatVisibilityStore } from "@/stores/chat-visibility-store"
import { SvgIcon } from "@/components/icons/svg-icon"
import MarketIcon from "@/public/icons/ic-market.svg"
import OrdersIcon from "@/public/icons/ic-orders.svg"
import AdsIcon from "@/public/icons/ic-ads.svg"
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
      <div className="grid grid-cols-5 h-16">
        <Link
          href="/"
          className={cn("flex flex-col items-center justify-center", {
            "text-black font-bold": pathname === "/" || pathname.startsWith("/advertiser"),
            "text-slate-700": !(pathname === "/" || pathname.startsWith("/advertiser")),
          })}
        >
          <div className="h-5 w-5 flex items-center justify-center">
            <SvgIcon src={MarketIcon} fill={isActive? "#FF444F" : "#181C25"}/>
          </div>
          <span className="text-xs mt-1">Market</span>
        </Link>
        <Link
          href="/orders"
          className={cn("flex flex-col items-center justify-center", {
            "text-black font-bold": pathname.startsWith("/orders"),
            "text-slate-700": !pathname.startsWith("/orders"),
          })}
        >
          <div className="h-5 w-5 flex items-center justify-center">
            <SvgIcon src={OrdersIcon} fill={isActive? "#FF444F" : "#181C25"}/>
          </div>
          <span className="text-xs mt-1">Orders</span>
        </Link>
        <Link
          href="/ads"
          className={cn("flex flex-col items-center justify-center", {
            "text-black font-bold": pathname.startsWith("/ads"),
            "text-slate-700": !pathname.startsWith("/ads"),
          })}
        >
          <div className="h-5 w-5 flex items-center justify-center">
            <SvgIcon src={AdsIcon} fill={isActive? "#FF444F" : "#181C25"}/>
          </div>
          <span className="text-xs mt-1">My ads</span>
        </Link>
        <Link
          href="/wallet"
          className={cn("flex flex-col items-center justify-center", {
            "text-black font-bold": pathname.startsWith("/wallet"),
            "text-slate-700": !pathname.startsWith("/wallet"),
          })}
        >
          <div className="h-5 w-5 flex items-center justify-center">
            <SvgIcon src={WalletIcon} fill={isActive? "#FF444F" : "#181C25"}/>
          </div>
          <span className="text-xs mt-1">Wallet</span>
        </Link>
        <Link
          href="/profile"
          className={cn("flex flex-col items-center justify-center", {
            "text-black font-bold": pathname.startsWith("/profile"),
            "text-slate-700": !pathname.startsWith("/profile"),
          })}
        >
          <div className="h-5 w-5 flex items-center justify-center">
            <SvgIcon src={ProfileIcon} fill={isActive? "#FF444F" : "#181C25"}/>
          </div>
          <span className="text-xs mt-1">Profile</span>
        </Link>
      </div>
    </div>
  )
}
