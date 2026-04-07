"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { useMarketFilterStore } from "@/stores/market-filter-store"
import { useAdvertiserSearch } from "@/hooks/use-api-queries"
import EmptyState from "@/components/empty-state"
import { VerifiedBadge } from "@/components/verified-badge"
import { TradeBandBadge } from "@/components/trade-band-badge"
import { useTranslations } from "@/lib/i18n/use-translations"
import { Skeleton } from "@/components/ui/skeleton"
import { Tooltip, TooltipArrow, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { formatPaymentMethodName } from "@/lib/utils"

interface MobileAdvertiserSearchProps {
    isOpen: boolean
    onClose: () => void
}

export default function MobileAdvertiserSearch({ isOpen, onClose }: MobileAdvertiserSearchProps) {
    const router = useRouter()
    const { t } = useTranslations()
    const { setNickname } = useMarketFilterStore()
    const [searchInput, setSearchInput] = useState("")
    const [debouncedSearchInput, setDebouncedSearchInput] = useState("")
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const sentinelRef = useRef<HTMLDivElement>(null)
    const scrollContainerRef = useRef<HTMLDivElement>(null)
    const isFetchingNextPageRef = useRef(false)

    const {
        data,
        isFetching: isSearching,
        isFetchingNextPage,
        hasNextPage,
        fetchNextPage,
    } = useAdvertiserSearch({ nickname: debouncedSearchInput })

    const searchResults = data?.pages.flat() ?? []

    // Cleanup debounce timeout on unmount to prevent race conditions
    useEffect(() => {
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current)
        }
    }, [])

    // Keep ref in sync so the observer callback always reads the latest value
    useEffect(() => {
        isFetchingNextPageRef.current = isFetchingNextPage
    }, [isFetchingNextPage])

    // Infinite scroll: fetch next page when sentinel comes into view
    useEffect(() => {
        const sentinel = sentinelRef.current
        const scrollContainer = scrollContainerRef.current
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
        if (debounceRef.current) clearTimeout(debounceRef.current)
        debounceRef.current = setTimeout(() => {
            setDebouncedSearchInput(value)
            setNickname(value)
        }, 300)
    }

    const handleSelectAdvertiser = (nickname: string, advertiserId: number) => {
        router.push(`/advertiser/${advertiserId}`)
        setNickname(nickname)
        handleClose()
    }

    const handleClear = () => {
        setSearchInput("")
        setDebouncedSearchInput("")
        setNickname("")
    }

    const handleClose = () => {
        setSearchInput("")
        setDebouncedSearchInput("")
        onClose()
    }

    return (
        <Sheet open={isOpen} onOpenChange={(open) => !open && handleClose()}>
            <SheetContent
                side="top"
                hideCloseButton
                className="h-full w-full p-0 flex flex-col gap-0 rounded-none"
            >
                {/* Header */}
                <div className="flex items-center gap-3 px-4 py-3 flex-shrink-0">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClose}
                        className="bg-grayscale-500 px-1 w-fit"
                    >
                        <Image src="/icons/arrow-left-icon.png" alt="Back" width={24} height={24} />
                    </Button>
                    <div className="relative flex-1">
                        <Image
                            src="/icons/search-icon-custom.png"
                            alt="Search"
                            width={20}
                            height={20}
                            className="absolute left-3 top-1/2 -translate-y-1/2 z-10 pointer-events-none"
                        />
                        <Input
                            variant="tertiary"
                            placeholder="Search advertiser's nickname"
                            value={searchInput}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            autoFocus
                            className="rounded-full pr-8"
                        />
                        {searchInput && (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleClear}
                                className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 hover:bg-transparent p-0"
                            >
                                <Image src="/icons/clear-search-icon.png" alt="Clear" width={20} height={20} />
                            </Button>
                        )}
                    </div>
                </div>

                {/* Results */}
                <div ref={scrollContainerRef} className="flex-1 min-h-0 overflow-y-auto">
                    {!searchInput ? null : isSearching && searchResults.length === 0 ? (
                        <div className="px-4 py-2 space-y-3">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="py-3 border-b border-slate-100">
                                    {/* Advertiser row */}
                                    <div className="flex items-center gap-2 mb-2">
                                        <Skeleton className="h-[24px] w-[24px] rounded-full flex-shrink-0 bg-grayscale-200" />
                                        <div className="flex flex-col gap-1 flex-1">
                                            <div className="flex items-center gap-2">
                                                <Skeleton className="h-4 w-36 bg-grayscale-200" />
                                                <Skeleton className="h-4 w-12 bg-grayscale-200" />
                                            </div>
                                            <Skeleton className="h-3 w-48 bg-grayscale-200" />
                                        </div>
                                    </div>
                                    {/* Rate row */}
                                    <div className="mb-2">
                                        <Skeleton className="h-5 w-32 bg-grayscale-200 mb-1" />
                                        <Skeleton className="h-3 w-48 bg-grayscale-200" />
                                        <Skeleton className="h-6 w-20 bg-grayscale-200 mt-2 rounded" />
                                    </div>
                                    {/* Payment methods row */}
                                    <div className="flex gap-2">
                                        <Skeleton className="h-3 w-24 bg-grayscale-200" />
                                        <Skeleton className="h-3 w-20 bg-grayscale-200" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : searchResults.length > 0 ? (
                        <>
                            <ul>
                                {searchResults.map((ad) => (
                                    <li key={ad.id} className="border-b border-slate-100">
                                        <div className="px-4 py-3">
                                            {/* Row 1: Advertiser info */}
                                            <div className="flex items-start gap-2 mb-2">
                                                {/* Avatar with online indicator */}
                                                <div className="relative h-[24px] w-[24px] flex-shrink-0 rounded-full bg-black flex items-center justify-center text-white font-bold text-sm mr-[8px] mt-[2px]">
                                                    {(ad.user?.nickname || "").charAt(0).toUpperCase()}
                                                    <div
                                                        className={`absolute bottom-0 right-0 h-2 w-2 rounded-full border border-white ${ad.user?.is_online ? "bg-buy" : "bg-gray-400"}`}
                                                    />
                                                </div>
                                                {/* Nickname + badges + stats */}
                                                <div className="flex flex-col min-w-0 flex-1">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <button
                                                            className="text-sm hover:underline cursor-pointer truncate"
                                                            onClick={() => handleSelectAdvertiser(ad.user.nickname, ad.user.id)}
                                                        >
                                                            {ad.user?.nickname}
                                                        </button>
                                                        <VerifiedBadge />
                                                        {ad.user.trade_band && (
                                                            <TradeBandBadge
                                                                tradeBand={ad.user.trade_band}
                                                                showLearnMore={true}
                                                                size={18}
                                                            />
                                                        )}
                                                        {ad.is_private && (
                                                            <Image
                                                                src="/icons/closed-group.svg"
                                                                alt="Closed Group"
                                                                width={32}
                                                                height={32}
                                                                className="cursor-pointer mr-1"
                                                            />
                                                        )}
                                                        {ad.user?.is_favourite && (
                                                            <span className="px-[8px] py-[4px] bg-blue-50 text-blue-100 text-xs rounded-[4px] whitespace-nowrap">
                                                                {t("market.following")}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {/* Rating, orders, completion */}
                                                    <div className="flex items-center text-xs text-slate-500 mt-[4px]">
                                                        {ad.user.rating_average_lifetime && (
                                                            <span className="flex items-center">
                                                                <Image
                                                                    src="/icons/star-active.svg"
                                                                    alt="Rating"
                                                                    width={16}
                                                                    height={16}
                                                                    className="mr-1"
                                                                />
                                                                <span className="text-pending-text-secondary">
                                                                    {ad.user.rating_average_lifetime.toFixed(2)}
                                                                </span>
                                                            </span>
                                                        )}
                                                        {(ad.user.order_count_lifetime ?? 0) > 0 && (
                                                            <div className="flex flex-row items-center justify-center gap-[8px] mx-[8px]">
                                                                {ad.user.rating_average_lifetime && (
                                                                    <div className="h-1 w-1 rounded-full bg-slate-500" />
                                                                )}
                                                                <span>
                                                                    {ad.user.order_count_lifetime} {t("market.orders")}
                                                                </span>
                                                            </div>
                                                        )}
                                                        {(ad.user.completion_rate_all_30day ?? 0) > 0 && (
                                                            <div className="flex flex-row items-center justify-center gap-[8px]">
                                                                <div className="h-1 w-1 rounded-full bg-slate-500" />
                                                                <span>
                                                                    {ad.user.completion_rate_all_30day}% {t("market.completion")}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Row 2: Rate + Order limits + Order expiry */}
                                            <div className="mb-2 pl-[32px]">
                                                <div className="font-bold text-base flex items-center">
                                                    {ad.effective_rate_display
                                                        ? ad.effective_rate_display.toLocaleString(undefined, {
                                                            minimumFractionDigits: 2,
                                                            maximumFractionDigits: 2,
                                                        })
                                                        : ""}{" "}
                                                    {ad.payment_currency}
                                                    <span className="text-xs text-slate-500 font-normal ml-1">{`/${ad.account_currency}`}</span>
                                                </div>
                                                <div className="mt-1 text-xs text-slate-600">{`${t("market.orderLimits")}: ${ad.minimum_order_amount || "N/A"} - ${ad.actual_maximum_order_amount || "N/A"} ${ad.account_currency}`}</div>
                                                {ad.order_expiry_period && (
                                                    <div className="flex items-center text-xs text-slate-500 mt-2">
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <div className="flex items-center bg-gray-100 text-slate-500 rounded-sm px-2 py-1 cursor-pointer">
                                                                        <Image src="/icons/clock.png" alt="Time" width={12} height={12} className="mr-2" />
                                                                        <span>
                                                                            {ad.order_expiry_period} {t("market.min")}
                                                                        </span>
                                                                    </div>
                                                                </TooltipTrigger>
                                                                <TooltipContent align="start" className="max-w-[328px] text-wrap">
                                                                    <p>{t("order.paymentTimeTooltip", { minutes: ad.order_expiry_period })}</p>
                                                                    <TooltipArrow className="fill-black" />
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Row 3: Payment methods + Buy/Sell button */}
                                            <div className="flex items-start justify-between pl-[32px]">
                                                {/* Payment methods */}
                                                <div className="flex flex-row flex-wrap gap-2">
                                                    {ad.payment_methods?.map((method, index) => (
                                                        <div key={index} className="flex items-center">
                                                            {method && (
                                                                <div
                                                                    className={`h-2 w-2 rounded-full mr-2 ${method.toLowerCase().includes("bank")
                                                                        ? "bg-paymentMethod-bank"
                                                                        : "bg-paymentMethod-ewallet"
                                                                        }`}
                                                                />
                                                            )}
                                                            <span className="text-xs">{formatPaymentMethodName(method)}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                                {/* Buy/Sell button */}
                                                <Button
                                                    variant={ad.type === "buy" ? "destructive" : "secondary"}
                                                    size="sm"
                                                    onClick={() => handleSelectAdvertiser(ad.user.nickname, ad.user.id)}
                                                    className="ml-2 flex-shrink-0"
                                                >
                                                    {ad.type === "buy" ? t("common.sell") : t("common.buy")} {ad.account_currency}
                                                </Button>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                            {isFetchingNextPage && (
                                <div className="sticky bottom-0 flex justify-center py-4 bg-background">
                                    <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                                </div>
                            )}
                            <div ref={sentinelRef} className="h-1" />
                        </>
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <EmptyState
                                title={`No results found for "${debouncedSearchInput}"`}
                                description="Check spelling or try finding different advertisers."
                            />
                        </div>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    )
}
