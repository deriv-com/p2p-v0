"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname, useSearchParams } from "next/navigation"
import { cn, getHomeUrl } from "@/lib/utils"
import { NovuNotifications } from "./novu-notifications"
import { useState, useEffect } from "react"
import { useUserDataStore, getCachedSignup } from "@/stores/user-data-store"
import { Avatar } from "@/components/ui/avatar"
import { SvgIcon } from "@/components/icons/svg-icon"
import { useTranslations } from "@/lib/i18n/use-translations"
import HomeIcon from "@/public/icons/ic-arrow-left.svg"
import MarketIcon from "@/public/icons/ic-buy-sell.svg"
import OrdersIcon from "@/public/icons/ic-orders.svg"
import AdsIcon from "@/public/icons/ic-my-ads.svg"
import WalletIcon from "@/public/icons/ic-wallet.svg"
import ProfileIcon from "@/public/icons/ic-profile.svg"
import GuideIcon from "@/public/icons/ic-guide.svg"

interface SidebarProps {
  className?: string
}

export default function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const { t, locale } = useTranslations()
  const [showWallet, setShowWallet] = useState<boolean>(() => {
    const cached = getCachedSignup()
    return cached !== "v1"
  })
  const { userData, userId } = useUserDataStore()

  const [isV1Signup, setIsV1Signup] = useState(() => {
    const cached = getCachedSignup()
    if (cached !== null) return cached === "v1"
    return userData?.signup === "v1"
  })

  const userName = userData?.nickname ?? userData?.email
  const isDisabled = userData?.status === "disabled"

  useEffect(() => {
    if (userData?.signup === "v1") {
      setShowWallet(false)
      setIsV1Signup(true)
    } else if (userData?.signup) {
      setShowWallet(true)
      setIsV1Signup(false)
    }
  }, [userData?.signup])

  const homeUrl = getHomeUrl(isV1Signup, "home")
  const profileUrl = getHomeUrl(isV1Signup, "profile", isWalletAccount)

  const helpCentreUrl =
    locale != "en"
      ? `https://trade.deriv.com/${locale}/help-centre/deriv-p2p`
      : `https://trade.deriv.com/help-centre/deriv-p2p`

  const navItems = [
    { name: t("navigation.backToHome"), href: homeUrl, icon: HomeIcon },
    ...(!isDisabled
      ? [
          { name: t("navigation.market"), href: "/", icon: MarketIcon },
          { name: t("navigation.orders"), href: "/orders", icon: OrdersIcon },
          { name: t("navigation.myAds"), href: "/ads", icon: AdsIcon },
          ...(showWallet ? [{ name: t("navigation.wallet"), href: "/wallet", icon: WalletIcon }] : []),
          { name: t("navigation.profile"), href: "/profile", icon: ProfileIcon },
          { name: t("navigation.p2pHelpCentre"), href: helpCentreUrl, icon: GuideIcon },
        ]
      : []),
  ]

  const hideOnMobile = [
    t("navigation.market"),
    t("navigation.orders"),
    t("navigation.myAds"),
    t("navigation.wallet"),
    t("navigation.profile"),
  ]

  return (
    <div className={cn("w-[295px] flex flex-col border-r border-slate-200 mr-[8px]", className)}>
      <div className="flex flex-row justify-between items-center gap-4 p-4 pt-0">
        <Image src="/icons/deriv-p2p.png" alt="Deriv logo" width={128} height={24} />
        {userId && (
          <div className="hidden md:block text-slate-600 hover:text-slate-700">
            <NovuNotifications />
          </div>
        )}
      </div>
      <nav className="flex-1 px-4">
        <ul>
          {navItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/" || pathname.startsWith("/advertiser")
                : pathname.startsWith(item.href)

            return (
              <li key={item.name} className={cn(hideOnMobile.includes(item.name) && "hidden md:block")}>
                {item.name === t("navigation.profile") && <div className="my-3 border-b border-grayscale-200"></div>}
                <Link
                  prefetch
                  href={item.href}
                  className={cn("flex items-center gap-3 rounded-md py-4 text-sm", isActive ? "text-primary" : "")}
                >
                  <div className="h-5 w-5 flex items-center justify-center">
                    <SvgIcon src={item.icon} fill={isActive ? "#FF444F" : "#181C25"} />
                  </div>
                  {item.name}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
      <div className="flex flex-row items-center gap-4 p-4">
        <Avatar className="h-8 w-8 bg-grayscale-500 items-center justify-center text-slate-1200 font-bold">
          {userName?.charAt(0).toUpperCase()}
        </Avatar>
        <div className="flex-1">
          <h2 className="text-sm font-bold text-slate-1400 mb-1">
            {userData?.first_name && userData?.last_name
              ? `${userData.first_name} ${userData.last_name}`
              : userData?.nickname}
          </h2>
          <div className="text-xs text-slate-1400">{userData?.email || ""}</div>
        </div>
        <Link prefetch href={profileUrl}>
          <Image src="/icons/chevron-right-black.png" alt="Arrow" width={14} height={14} />
        </Link>
      </div>
    </div>
  )
}
