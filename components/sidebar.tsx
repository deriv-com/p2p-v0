"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { cn, getHomeUrl } from "@/lib/utils"
import { getHelpCentreUrl } from "@/lib/get-help-centre-url"
import { NovuNotifications } from "./novu-notifications"
import { useState, useEffect, useRef } from "react"
import { useUserDataStore, getCachedSignup } from "@/stores/user-data-store"
import { SvgIcon } from "@/components/icons/svg-icon"
import { useTranslations } from "@/lib/i18n/use-translations"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useMarketFilterStore } from "@/stores/market-filter-store"
import { useAdvertiserSearch } from "@/hooks/use-api-queries"
import EmptyState from "@/components/empty-state"
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
  const router = useRouter()
  const { isWalletAccount, userData, userId } = useUserDataStore()
  const { t, locale } = useTranslations()
  const { nickname, setNickname, currency, selectedAccountCurrency, activeTab } = useMarketFilterStore()
  const [searchInput, setSearchInput] = useState(nickname)
  const [debouncedSearchInput, setDebouncedSearchInput] = useState(nickname)
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const {
    data: searchData,
    isFetching: isSearching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useAdvertiserSearch({
    nickname: debouncedSearchInput,
  })

  const searchResults = searchData?.pages.flat() ?? []

  const dropdownSentinelRef = useRef<HTMLDivElement>(null)
  const dropdownScrollContainerRef = useRef<HTMLDivElement>(null)
  const isFetchingNextPageRef = useRef(false)

  // Keep ref in sync so the observer callback always reads the latest value
  useEffect(() => {
    isFetchingNextPageRef.current = isFetchingNextPage
  }, [isFetchingNextPage])

  // Infinite scroll: fetch next page when sentinel comes into view
  useEffect(() => {
    const sentinel = dropdownSentinelRef.current
    const scrollContainer = dropdownScrollContainerRef.current
    if (!sentinel || !hasNextPage || !scrollContainer) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isFetchingNextPageRef.current) {
          fetchNextPage()
        }
      },
      { threshold: 0, rootMargin: "100px", root: scrollContainer },
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [hasNextPage, fetchNextPage])

  const handleSearchChange = (value: string) => {
    setSearchInput(value)
    if (value.length > 0) {
      setIsSearchFocused(true)
    }
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setDebouncedSearchInput(value)
      setNickname(value)
    }, 300)
  }

  const handleSelectAd = (advertiserNickname: string, advertiserId: number) => {
    setSearchInput(advertiserNickname)
    setNickname(advertiserNickname)
    setIsSearchFocused(false)
    router.push(`/advertiser/${advertiserId}`)
  }

  const handleClear = () => {
    setSearchInput("")
    setDebouncedSearchInput("")
    setNickname("")
  }
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

  const helpCentreUrl = `${getHelpCentreUrl(locale)}/help-centre/deriv-p2p`

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
    return (firstName && lastName) ? (firstInitial + lastInitial).toUpperCase() : email?.[0].toUpperCase()
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
        <div className="relative mb-2">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none z-10"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <circle cx="11" cy="11" r="8" />
            <path strokeLinecap="round" d="M21 21l-4.35-4.35" />
          </svg>
          <Input
            variant="tertiary"
            placeholder="Search advertiser's nickname"
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setTimeout(() => setIsSearchFocused(false), 150)}
            className="rounded-full pr-8"
          />
          {searchInput && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClear}
              className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 text-slate-400 hover:text-slate-600 hover:bg-transparent"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Button>
          )}
          {isSearchFocused && searchInput.length > 0 && (
            <div className="absolute top-full left-0 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-md z-50 overflow-hidden">
              {isSearching && searchResults.length === 0 ? (
                <div className="px-4 py-3 text-sm text-slate-500">Searching...</div>
              ) : searchResults.length > 0 ? (
                <div ref={dropdownScrollContainerRef} className="max-h-64 overflow-y-auto">
                  {searchResults.map((ad) => (
                    <button
                      key={ad.id}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-slate-50"
                      onMouseDown={(e) => {
                        e.preventDefault()
                        handleSelectAd(ad.user.nickname, ad.user.id)
                      }}
                    >
                      <div className="h-7 w-7 flex-shrink-0 rounded-full bg-black flex items-center justify-center text-white text-xs font-bold">
                        {ad.user.nickname.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1 text-left">
                        <div className="text-sm font-medium truncate">{ad.user.nickname}</div>
                        <div className="text-xs text-slate-500 truncate">
                          {ad.exchange_rate} {ad.payment_currency}/{ad.account_currency}
                        </div>
                      </div>
                    </button>
                  ))}
                  {isFetchingNextPage && (
                    <div className="sticky bottom-0 flex justify-center py-2 bg-white">
                      <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                    </div>
                  )}
                  <div ref={dropdownSentinelRef} className="h-1" />
                </div>
              ) : (
                <EmptyState
                  title={`No results found for "${debouncedSearchInput}"`}
                  description="Check spelling or try finding different advertisers."
                  className="py-4 px-2"
                />
              )}
            </div>
          )}
        </div>
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
              <span className="text-sm font-extrabold text-slate-1200 whitespace-pre-wrap wrap-anywhere">{fullName}</span>
              {email && <span className="text-xs text-slate-1200 whitespace-pre-wrap wrap-anywhere">{email}</span>}
            </div>
          </div>
          <Image src="/icons/chevron-right-black.png" alt="Deriv logo" width={14} height={24} />
        </a>
      </div>
    </div>
  )
}
