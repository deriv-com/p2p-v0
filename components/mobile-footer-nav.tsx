"use client"

import { useTranslations } from "@/lib/i18n/use-translations"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useChatVisibilityStore } from "@/stores/chat-visibility-store"
import { useUserDataStore } from "@/stores/user-data-store"
import { useState, useEffect } from "react"
import { SvgIcon } from "@/components/icons/svg-icon"
import MarketIcon from "@/public/icons/ic-buy-sell.svg"
import OrdersIcon from "@/public/icons/ic-orders.svg"
import AdsIcon from "@/public/icons/ic-my-ads.svg"
import WalletIcon from "@/public/icons/ic-wallet.svg"
import ProfileIcon from "@/public/icons/ic-profile.svg"

export default function MobileFooterNav() {
  const pathname = usePathname()
  const { isChatVisible } = useChatVisibilityStore()
  const { t } = useTranslations()
  const { userData } = useUserDataStore()
  const [showWallet, setShowWallet] = useState<boolean | null>(null)

  useEffect(() => {
    if (!userData?.signup) {
      return
    }

    if (userData?.signup === "v1") {
      setShowWallet(false)
    } else {
      setShowWallet(true)
    }
  }, [userData?.signup])

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
      <div className={cn("grid grid-cols-4 min-h-16", showWallet === true && "grid-cols-5")}>
        <Link
          href="/"
          className={cn("flex flex-col items-center justify-center px-1 text-center max-w-full py-2", {
            "text-primary": pathname === "/" || pathname.startsWith("/advertiser"),
            "text-slate-1200": !(pathname === "/" || pathname.startsWith("/advertiser")),
          })}
        >
          <div className="h-5 w-5 flex items-center justify-center flex-shrink-0">
            <SvgIcon
              src={MarketIcon}
              fill={pathname === "/" || pathname.startsWith("/advertiser") ? "#FF444F" : "#181C25"}
            />
          </div>
          <span className="text-xs mt-1 line-clamp-2">{t("navigation.market")}</span>
        </Link>
        <Link
          href="/orders"
          className={cn("flex flex-col items-center justify-center px-1 text-center max-w-full py-2", {
            "text-primary": pathname.startsWith("/orders"),
            "text-slate-1200": !pathname.startsWith("/orders"),
          })}
        >
          <div className="h-5 w-5 flex items-center justify-center flex-shrink-0">
            <SvgIcon src={OrdersIcon} fill={pathname.startsWith("/orders") ? "#FF444F" : "#181C25"} />
          </div>
          <span className="text-xs mt-1 line-clamp-2">{t("navigation.orders")}</span>
        </Link>
        <Link
          href="/ads"
          className={cn("flex flex-col items-center justify-center px-1 text-center max-w-full py-2", {
            "text-primary": pathname.startsWith("/ads"),
            "text-slate-1200": !pathname.startsWith("/ads"),
          })}
        >
          <div className="h-5 w-5 flex items-center justify-center flex-shrink-0">
            <SvgIcon src={AdsIcon} fill={pathname.startsWith("/ads") ? "#FF444F" : "#181C25"} />
          </div>
          <span className="text-xs mt-1 line-clamp-2">{t("navigation.myAds")}</span>
        </Link>
        {showWallet === true && (
          <Link
            href="/wallet"
            className={cn("flex flex-col items-center justify-center px-1 text-center max-w-full py-2", {
              "text-primary": pathname.startsWith("/wallet"),
              "text-slate-1200": !pathname.startsWith("/wallet"),
            })}
          >
            <div className="h-5 w-5 flex items-center justify-center flex-shrink-0">
              <SvgIcon src={WalletIcon} fill={pathname.startsWith("/wallet") ? "#FF444F" : "#181C25"} />
            </div>
            <span className="text-xs mt-1 line-clamp-2">{t("navigation.wallet")}</span>
          </Link>
        )}
        <Link
          href="/profile"
          className={cn("flex flex-col items-center justify-center px-1 text-center max-w-full py-2", {
            "text-primary": pathname.startsWith("/profile"),
            "text-slate-1200": !pathname.startsWith("/profile"),
          })}
        >
          <div className="h-5 w-5 flex items-center justify-center flex-shrink-0">
            <SvgIcon src={ProfileIcon} fill={pathname.startsWith("/profile") ? "#FF444F" : "#181C25"} />
          </div>
          <span className="text-xs mt-1 line-clamp-2">{t("navigation.profile")}</span>
        </Link>
      </div>
    </div>
  )
}
