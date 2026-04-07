"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { useMarketFilterStore } from "@/stores/market-filter-store"
import { useAdvertiserSearch } from "@/hooks/use-api-queries"

interface MobileAdvertiserSearchProps {
    isOpen: boolean
    onClose: () => void
}

export default function MobileAdvertiserSearch({ isOpen, onClose }: MobileAdvertiserSearchProps) {
    const router = useRouter()
    const { setNickname } = useMarketFilterStore()
    const [searchInput, setSearchInput] = useState("")
    const [debouncedSearchInput, setDebouncedSearchInput] = useState("")
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    const { data: searchResults, isFetching: isSearching } = useAdvertiserSearch({
        nickname: debouncedSearchInput,
    })

    const handleSearchChange = (value: string) => {
        setSearchInput(value)
        if (debounceRef.current) clearTimeout(debounceRef.current)
        debounceRef.current = setTimeout(() => {
            setDebouncedSearchInput(value)
            setNickname(value)
        }, 300)
    }

    const handleSelectAdvertiser = (nickname: string, advertiserId: number) => {
        setNickname(nickname)
        handleClose()
        router.push(`/advertiser/${advertiserId}`)
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
                <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleClose}
                        className="h-9 w-9 hover:bg-transparent p-0 flex-shrink-0"
                    >
                        <Image src="/icons/arrow-back.svg" alt="Back" width={24} height={24} />
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
                <div className="flex-1 overflow-y-auto">
                    {!searchInput ? (
                        <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-400 px-6">
                            <Image src="/icons/search-icon-custom.png" alt="Search" width={48} height={48} className="opacity-30" />
                            <p className="text-sm text-center">Search for an advertiser by their nickname</p>
                        </div>
                    ) : isSearching ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                        </div>
                    ) : searchResults?.length ? (
                        <ul>
                            {searchResults.map((ad) => (
                                <li key={ad.id}>
                                    <button
                                        className="w-full flex items-center gap-3 px-4 py-3 text-left border-b border-slate-100 active:bg-slate-50"
                                        onClick={() => handleSelectAdvertiser(ad.user.nickname, ad.user.id)}
                                    >
                                        <div className="h-10 w-10 flex-shrink-0 rounded-full bg-black flex items-center justify-center text-white text-sm font-bold">
                                            {ad.user.nickname.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="text-sm font-medium truncate">{ad.user.nickname}</div>
                                            <div className="text-xs text-slate-500 truncate">
                                                {ad.exchange_rate} {ad.payment_currency}/{ad.account_currency}
                                            </div>
                                        </div>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full gap-2 text-slate-400 px-6">
                            <p className="text-sm text-center">No advertisers found for &ldquo;{searchInput}&rdquo;</p>
                        </div>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    )
}
