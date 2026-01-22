"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { cn, getHomeUrl } from "@/lib/utils"
import { NovuNotifications } from "./novu-notifications"
import { useState, useEffect } from "react"
import { useUserDataStore, getCachedSignup } from "@/stores/user-data-store"
import { SvgIcon } from "@/components/icons/svg-icon"
import { useTranslations } from "@/lib/i18n/use-translations"
import MarketIcon from "@/public/icons/ic-buy-sell.svg"
import MarketSelectedIcon from "@/public/icons/ic-buy-sell-selected.svg"
import OrdersIcon from "@/public/icons/ic-orders.svg"
import OrdersSelectedIcon from "@/public/icons/ic-orders-selected.svg"
import AdsIcon from "@/public/icons/ic-my-ads.svg"
import AdsSelectedIcon from "@/public/icons/ic-my-ads-selected.svg"
import WalletIcon from "@/public/icons/ic-wallet.svg"
import WalletSelectedIcon from "@/public/icons/ic-wallet-selected.svg"
import ProfileIcon from "@/public/icons/profile-icon.svg"
import ProfileSelectedIcon from "@/public/icons/profile-icon-red.svg"
import GuideIcon from "@/public/icons/ic-guide.svg"
import GuideSelectedIcon from "@/public/icons/ic-guide-selected.svg"
import HomeIcon from "@/public/icons/ic-house.svg"
import LiveChatIcon from "@/public/icons/ic-livechat.svg"

interface SidebarProps {
  className?: string
}

export default function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const { isWalletAccount, userData, userId } = useUserDataStore()
  const { t, locale } = useTranslations()
  const [showWallet, setShowWallet] = useState<boolean>(() => {
    const cached = getCachedSignup()
    return cached !== "v1"
  })
  const [isV1Signup, setIsV1Signup] = useState(() => {
    const cached = getCachedSignup()
    if (cached !== null) return cached === "v1"
    return userData?.signup === "v1"
  })

  const firstName = userData?.first_name
  const lastName = userData?.last_name
  const fullName = firstName && lastName ? `${firstName} ${lastName}` : null
  const email = userData?.email
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
  const homeProfileUrl = getHomeUrl(isV1Signup, "homeProfile")

  const helpCentreUrl =
    locale != "en"
      ? `https://trade.deriv.com/${locale}/help-centre/deriv-p2p`
      : `https://trade.deriv.com/help-centre/deriv-p2p`

  const liveChatUrl = "https://deriv.com/livechat"

  const navItems = [
    ...(!isDisabled
      ? [
          { name: t("navigation.home"), href: homeUrl, icon: HomeIcon, selectedIcon: HomeIcon },
          { name: t("navigation.market"), href: "/", icon: MarketIcon, selectedIcon: MarketSelectedIcon },
          { name: t("navigation.orders"), href: "/orders", icon: OrdersIcon, selectedIcon: OrdersSelectedIcon },
          { name: t("navigation.myAds"), href: "/ads", icon: AdsIcon, selectedIcon: AdsSelectedIcon },
          ...(showWallet
            ? [{ name: t("navigation.wallet"), href: "/wallet", icon: WalletIcon, selectedIcon: WalletSelectedIcon }]
            : []),
          { name: t("navigation.profile"), href: "/profile", icon: ProfileIcon, selectedIcon: ProfileSelectedIcon },
          { name: t("navigation.p2pHelpCentre"), href: helpCentreUrl, icon: GuideIcon, selectedIcon: GuideSelectedIcon },
          { name: t("navigation.liveChat"), href: liveChatUrl, icon: LiveChatIcon, selectedIcon: LiveChatIcon },
        ]
      : []),
  ]

  const hideOnMobile = [
    t("navigation.home"),
    t("navigation.market"),
    t("navigation.orders"),
    t("navigation.myAds"),
    t("navigation.wallet"),
    t("navigation.profile"),
    t("navigation.liveChat"),
  ]

  const getInitials = () => {
    const firstInitial = firstName?.[0] ?? ""
    const lastInitial = lastName?.[0] ?? ""
    return (firstInitial + lastInitial).toUpperCase() ?? email?.[0].toUpperCase()
  }

  const handleLiveChat = () => {
    if (window.Intercom) {
      window.Intercom("show")
    }
  }

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
            const isExternal = item.name === t("navigation.home") || item.name === t("navigation.p2pHelpCentre") || item.name === t("navigation.liveChat")
            const isActive = !isExternal && (
              item.href === "/"
                ? pathname === "/" || pathname.startsWith("/advertiser")
                : pathname.startsWith(item.href)
            )

            const linkContent = (
              <>
                <div className="h-5 w-5 flex items-center justify-center">
                  <SvgIcon src={isActive ? item.selectedIcon : item.icon} fill={isActive ? "#FF444F" : "#181C25"} />
                </div>
                {item.name}
              </>
            )

            return (
              <li key={item.name} className={cn(hideOnMobile.includes(item.name) && "hidden md:block")}>
                {(item.name === t("navigation.p2pHelpCentre") || item.name === t("navigation.market")) && <div className="my-3 border-b border-grayscale-200"></div>}
                {item.name === t("navigation.liveChat") ? (
                  <button
                    onClick={handleLiveChat}
                    className="flex items-center gap-3 rounded-md py-4 text-sm w-full text-left"
                  >
                    {linkContent}
                  </button>
                ) : isExternal ? (
                  <a
                    href={item.href}
                    className="flex items-center gap-3 rounded-md py-4 text-sm"
                    rel="noopener noreferrer"
                  >
                    {linkContent}
                  </a>
                ) : (
                  <Link
                    prefetch
                    href={item.href}
                    className={cn("flex items-center gap-3 rounded-md py-4 text-sm", isActive ? "text-primary" : "")}
                  >
                    {linkContent}
                  </Link>
                )}
              </li>
            )
          })}
        </ul>
      </nav>
      <div className="p-4">
        <a
          className="flex items-center justify-between gap-3 rounded-md py-2 text-sm transition-colors"
          href={homeProfileUrl}
        >
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-grayscale-300 flex items-center justify-center text-xs font-extrabold text-slate-700 shrink-0">
              {getInitials()}
            </div>
            <div className="flex flex-col min-w-0 gap-1">
              <span className="text-sm font-extrabold text-slate-1200 truncate whitespace-pre wrap-anywhere">{fullName}</span>
              {email && <span className="text-xs text-slate-1200 truncate whitespace-pre wrap-anywhere">{email}</span>}
            </div>
          </div>
          <Image src="/icons/chevron-right-black.png" alt="Deriv logo" width={14} height={24} />
        </a>
      </div>
    </div>
  )
}
