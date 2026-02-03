"use client"

import Link from "next/link"
import { usePathname } from 'next/navigation'
import { cn, getHomeUrl } from "@/lib/utils"
import { useChatVisibilityStore } from "@/stores/chat-visibility-store"
import { useUserDataStore, getCachedSignup } from "@/stores/user-data-store"
import { useState, useEffect } from "react"
import { useTranslations } from "@/lib/i18n/use-translations"
import { SvgIcon } from "@/components/icons/svg-icon"
import HomeIcon from "@/public/icons/ic-house.svg"
import MarketIcon from "@/public/icons/ic-buy-sell.svg"
import MarketSelectedIcon from "@/public/icons/ic-buy-sell-selected.svg"
import OrdersIcon from "@/public/icons/ic-orders.svg"
import OrdersSelectedIcon from "@/public/icons/ic-orders-selected.svg"
import AdsIcon from "@/public/icons/ic-my-ads.svg"
import AdsSelectedIcon from "@/public/icons/ic-my-ads-selected.svg"
import WalletIcon from "@/public/icons/ic-wallet.svg"
import WalletSelectedIcon from "@/public/icons/ic-wallet-selected.svg"

export default function MobileFooterNav() {
  const pathname = usePathname()
  const { isChatVisible } = useChatVisibilityStore()
  const { t } = useTranslations()
  const { userData } = useUserDataStore()
  const [showWallet, setShowWallet] = useState<boolean>(() => {
    const cached = getCachedSignup()
    return cached !== "v1"
  })
  const [isV1Signup, setIsV1Signup] = useState(() => {
    const cached = getCachedSignup()
    if (cached !== null) return cached === "v1"
    return userData?.signup === "v1"
  })

  useEffect(() => {
    if (userData?.signup === "v1") {
      setShowWallet(false)
      setIsV1Signup(true)
    } else if (userData?.signup) {
      setShowWallet(true)
      setIsV1Signup(false)
    }
  }, [userData?.signup])

  if (userData?.status === "disabled") {
    return null
  }

  if (
    pathname.startsWith("/orders/") ||
    pathname.startsWith("/ads/create") ||
    pathname.startsWith("/ads/edit") ||
    isChatVisible
  ) {
    return null
  }

  const isMarketActive = pathname === "/" || pathname.startsWith("/advertiser")
  const isOrdersActive = pathname.startsWith("/orders")
  const isAdsActive = pathname.startsWith("/ads")
  const isWalletActive = pathname.startsWith("/wallet")

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t md:hidden z-40">
      <div className={cn("grid grid-cols-4 min-h-16 relative", showWallet && "grid-cols-5")}>
        <Link
          href={getHomeUrl(isV1Signup, "home")}
          className="flex flex-col items-center justify-center px-1 text-center max-w-full py-2 text-slate-1200"
        >
          <div className="h-5 w-5 flex items-center justify-center flex-shrink-0">
            <SvgIcon
              src={HomeIcon}
            />
          </div>
          <span className="text-xs mt-1 line-clamp-2">{t("navigation.home")}</span>
        </Link>
        <Link
          href="/"
          className={cn("flex flex-col items-center justify-center px-1 text-center max-w-full py-2 relative", {
            "text-primary": isMarketActive,
            "text-slate-1200": !isMarketActive,
          })}
        >
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-px bg-slate-200"></div>
          <div className="h-5 w-5 flex items-center justify-center flex-shrink-0">
            <SvgIcon
              src={isMarketActive ? MarketSelectedIcon : MarketIcon}
              fill={isMarketActive ? "#FF444F" : "#181C25"}
            />
          </div>
          <span className="text-xs mt-1 line-clamp-2">{t("navigation.market")}</span>
        </Link>
        <Link
          href="/orders"
          className={cn("flex flex-col items-center justify-center px-1 text-center max-w-full py-2", {
            "text-primary": isOrdersActive,
            "text-slate-1200": !isOrdersActive,
          })}
        >
          <div className="h-5 w-5 flex items-center justify-center flex-shrink-0">
            <SvgIcon src={isOrdersActive ? OrdersSelectedIcon : OrdersIcon} fill={isOrdersActive ? "#FF444F" : "#181C25"} />
          </div>
          <span className="text-xs mt-1 line-clamp-2">{t("navigation.orders")}</span>
        </Link>
        <Link
          href="/ads"
          className={cn("flex flex-col items-center justify-center px-1 text-center max-w-full py-2", {
            "text-primary": isAdsActive,
            "text-slate-1200": !isAdsActive,
          })}
        >
          <div className="h-5 w-5 flex items-center justify-center flex-shrink-0">
            <SvgIcon src={isAdsActive ? AdsSelectedIcon : AdsIcon} fill={isAdsActive ? "#FF444F" : "#181C25"} />
          </div>
          <span className="text-xs mt-1 line-clamp-2">{t("navigation.myAds")}</span>
        </Link>
        {showWallet && (
          <Link
            href="/wallet"
            className={cn("flex flex-col items-center justify-center px-1 text-center max-w-full py-2", {
              "text-primary": isWalletActive,
              "text-slate-1200": !isWalletActive,
            })}
          >
            <div className="h-5 w-5 flex items-center justify-center flex-shrink-0">
              <SvgIcon src={isWalletActive ? WalletSelectedIcon : WalletIcon} fill={isWalletActive ? "#FF444F" : "#181C25"} />
            </div>
            <span className="text-xs mt-1 line-clamp-2">{t("navigation.wallet")}</span>
          </Link>
        )}
      </div>
    </div>
  )
}
