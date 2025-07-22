"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from "next/image"

export default function MobileFooterNav() {
  const pathname = usePathname()
  const hideOnPaths = ["/profile/payment-methods", "/profile/stats"]

  if (hideOnPaths.includes(pathname)) {
    return null
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t md:hidden z-40">
      <div className="grid grid-cols-5 h-16">
        <Link
          href="/"
          className={`flex flex-col items-center justify-center ${
            pathname === "/" || pathname.startsWith("/advertiser")
              ? "text-[#00D0FF] font-bold"
              : "text-slate-700"
          }`}
        >
          <Image
            src="/icons/buy-sell-icon.png"
            alt="Buy/Sell"
            width={20}
            height={20}
            className={
              pathname === "/" || pathname.startsWith("/advertiser")
                ? "filter-to-primary"
                : "brightness-50 opacity-70"
            }
            style={
              pathname === "/"
                ? {
                    filter:
                      "invert(67%) sepia(87%) saturate(1231%) hue-rotate(152deg) brightness(103%) contrast(103%)",
                  }
                : {}
            }
          />
          <span className="text-xs mt-1">Market</span>
        </Link>
        <Link
          href="/orders"
          className={`flex flex-col items-center justify-center ${
            pathname.startsWith("/orders")
              ? "text-[#00D0FF] font-bold"
              : "text-slate-700"
          }`}
        >
          <Image
            src="/icons/orders-icon.png"
            alt="Orders"
            width={20}
            height={20}
            className={
              pathname.startsWith("/orders")
                ? "filter-to-primary"
                : "brightness-50 opacity-70"
            }
            style={
              pathname.startsWith("/orders")
                ? {
                    filter:
                      "invert(67%) sepia(87%) saturate(1231%) hue-rotate(152deg) brightness(103%) contrast(103%)",
                  }
                : {}
            }
          />
          <span className="text-xs mt-1">Orders</span>
        </Link>
        <Link
          href="/ads"
          className={`flex flex-col items-center justify-center ${
            pathname.startsWith("/ads")
              ? "text-[#00D0FF] font-bold"
              : "text-slate-700"
          }`}
        >
          <Image
            src="/icons/my-ads-icon.png"
            alt="My ads"
            width={20}
            height={20}
            className={
              pathname.startsWith("/ads")
                ? "filter-to-primary"
                : "brightness-50 opacity-70"
            }
            style={
              pathname.startsWith("/ads")
                ? {
                    filter:
                      "invert(67%) sepia(87%) saturate(1231%) hue-rotate(152deg) brightness(103%) contrast(103%)",
                  }
                : {}
            }
          />
          <span className="text-xs mt-1">My ads</span>
        </Link>
        <Link
          href="/wallet"
          className={`flex flex-col items-center justify-center ${
            pathname.startsWith("/wallet")
              ? "text-[#00D0FF] font-bold"
              : "text-slate-700"
          }`}
        >
          <Image
            src="/icons/wallet-icon.svg"
            alt="Wallet"
            width={20}
            height={20}
            className={
              pathname.startsWith("/wallet")
                ? "filter-to-primary"
                : "brightness-50 opacity-70"
            }
            style={
              pathname.startsWith("/wallet")
                ? {
                    filter:
                      "invert(67%) sepia(87%) saturate(1231%) hue-rotate(152deg) brightness(103%) contrast(103%)",
                  }
                : {}
            }
          />
          <span className="text-xs mt-1">Wallet</span>
        </Link>
        <Link
          href="/profile"
          className={`flex flex-col items-center justify-center ${
            pathname.startsWith("/profile")
              ? "text-[#00D0FF] font-bold"
              : "text-slate-700"
          }`}
        >
          <Image
            src="/icons/profile-icon.png"
            alt="Profile"
            width={20}
            height={20}
            className={
              pathname.startsWith("/profile")
                ? "filter-to-primary"
                : "brightness-50 opacity-70"
            }
            style={
              pathname.startsWith("/profile")
                ? {
                    filter:
                      "invert(67%) sepia(87%) saturate(1231%) hue-rotate(152deg) brightness(103%) contrast(103%)",
                  }
                : {}
            }
          />
          <span className="text-xs mt-1">Profile</span>
        </Link>
      </div>
    </div>
  )
}
