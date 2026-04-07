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
                        size="icon"
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
                        <div className="px-4 py-2 space-y-1">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="flex items-center gap-2 py-3 border-b border-slate-100">
                                    <Skeleton className="h-[24px] w-[24px] rounded-full flex-shrink-0 bg-grayscale-200" />
                                    <Skeleton className="h-4 w-36 bg-grayscale-200" />
                                    <Skeleton className="h-4 w-12 bg-grayscale-200" />
                                </div>
                            ))}
                        </div>
                    ) : searchResults.length > 0 ? (
                        <>
                            <ul>
                                {searchResults.map((ad) => (
                                    <li key={ad.id}>
                                        <button
                                            className="w-full flex items-center gap-2 px-4 py-3 text-left border-b border-slate-100 active:bg-slate-50"
                                            onClick={() => handleSelectAdvertiser(ad.user.nickname, ad.user.id)}
                                        >
                                            {/* Avatar with online indicator */}
                                            <div className="relative h-[24px] w-[24px] flex-shrink-0 rounded-full bg-black flex items-center justify-center text-white font-bold text-sm mr-[8px]">
                                                {(ad.user?.nickname || "").charAt(0).toUpperCase()}
                                                <div
                                                    className={`absolute bottom-0 right-0 h-2 w-2 rounded-full border border-white ${ad.user?.is_online ? "bg-buy" : "bg-gray-400"}`}
                                                />
                                            </div>
                                            {/* Nickname + badges */}
                                            <div className="flex items-center gap-2 min-w-0 flex-1">
                                                <span className="text-sm truncate">{ad.user?.nickname}</span>
                                                <VerifiedBadge />
                                                {ad.user.trade_band && (
                                                    <TradeBandBadge
                                                        tradeBand={ad.user.trade_band}
                                                        showLearnMore={true}
                                                        size={18}
                                                    />
                                                )}
                                                {ad.user?.is_favourite && (
                                                    <span className="ml-1 px-[8px] py-[4px] bg-blue-50 text-blue-100 text-xs rounded-[4px] whitespace-nowrap">
                                                        {t("market.following")}
                                                    </span>
                                                )}
                                            </div>
                                        </button>
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
