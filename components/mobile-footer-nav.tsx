"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { useChatVisibilityStore } from "@/stores/chat-visibility-store"

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
          <Image
            src="/icons/buy-sell-icon.png"
            alt="Buy/Sell"
            width={20}
            height={20}
            className={cn({
              "filter-to-black": pathname === "/" || pathname.startsWith("/advertiser"),
              "brightness-50 opacity-70": !(pathname === "/" || pathname.startsWith("/advertiser")),
            })}
          />
          <span className="text-xs mt-1">Market</span>
        </Link>
        <Link
          href="/orders"
          className={cn("flex flex-col items-center justify-center", {
            "text-black font-bold": pathname.startsWith("/orders"),
            "text-slate-700": !pathname.startsWith("/orders"),
          })}
        >
          <Image
            src="/icons/orders-icon.png"
            alt="Orders"
            width={20}
            height={20}
            className={cn({
              "filter-to-black": pathname.startsWith("/orders"),
              "brightness-50 opacity-70": !pathname.startsWith("/orders"),
            })}
          />
          <span className="text-xs mt-1">Orders</span>
        </Link>
        <Link
          href="/ads"
          className={cn("flex flex-col items-center justify-center", {
            "text-black font-bold": pathname.startsWith("/ads"),
            "text-slate-700": !pathname.startsWith("/ads"),
          })}
        >
          <Image
            src="/icons/my-ads-icon.png"
            alt="My ads"
            width={20}
            height={20}
            className={cn({
              "filter-to-black": pathname.startsWith("/ads"),
              "brightness-50 opacity-70": !pathname.startsWith("/ads"),
            })}
          />
          <span className="text-xs mt-1">My ads</span>
        </Link>
        <Link
          href="/wallet"
          className={cn("flex flex-col items-center justify-center", {
            "text-black font-bold": pathname.startsWith("/wallet"),
            "text-slate-700": !pathname.startsWith("/wallet"),
          })}
        >
          <Image
            src="/icons/wallet-icon.svg"
            alt="Wallet"
            width={20}
            height={20}
            className={cn({
              "filter-to-black": pathname.startsWith("/wallet"),
              "brightness-50 opacity-70": !pathname.startsWith("/wallet"),
            })}
          />
          <span className="text-xs mt-1">Wallet</span>
        </Link>
        <Link
          href="/profile"
          className={cn("flex flex-col items-center justify-center", {
            "text-black font-bold": pathname.startsWith("/profile"),
            "text-slate-700": !pathname.startsWith("/profile"),
          })}
        >
          <Image
            src="/icons/profile-icon.png"
            alt="Profile"
            width={20}
            height={20}
            className={cn({
              "filter-to-black": pathname.startsWith("/profile"),
              "brightness-50 opacity-70": !pathname.startsWith("/profile"),
            })}
          />
          <span className="text-xs mt-1">Profile</span>
        </Link>
      </div>
    </div>
  )
}
