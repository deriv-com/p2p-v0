"use client"

import type React from "react"

import { useState, useMemo, useCallback } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer"
import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"
import type { CurrencyFilterProps } from "./types"
import EmptyState from "@/components/empty-state"

export function CurrencyFilter({
  currencies,
  selectedCurrency,
  onCurrencySelect,
  title,
  trigger,
  placeholder = "Search",
}: CurrencyFilterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const isMobile = useIsMobile()

  const filteredCurrencies = useMemo(() => {
    let filtered = currencies

    if (searchQuery.trim()) {
      const query = searchQuery?.toLowerCase().trim()
      filtered = filtered.filter((currency) => {
        const codeMatch = currency?.code?.toLowerCase().includes(query)
        const nameMatch = currency?.name?.toLowerCase().includes(query)
        const wordMatch = currency?.name
          ?.toLowerCase()
          .split(" ")
          .some((word) => word.startsWith(query))
        return codeMatch || nameMatch || wordMatch
      })
    }
    const selectedCurrencyItem = filtered.find((currency) => currency.code === selectedCurrency)
    const unselectedCurrencies = filtered.filter((currency) => currency.code !== selectedCurrency)

    unselectedCurrencies.sort((a, b) => a.code.localeCompare(b.code))

    return selectedCurrencyItem ? [selectedCurrencyItem, ...unselectedCurrencies] : unselectedCurrencies
  }, [currencies, searchQuery, selectedCurrency])

  const handleCurrencySelect = useCallback(
    (currencyCode: string) => {
      onCurrencySelect(currencyCode)
      setIsOpen(false)
      setSearchQuery("")
    },
    [onCurrencySelect],
  )

  const handleOpenChange = useCallback((open: boolean) => {
    setIsOpen(open)
    if (!open) {
      setSearchQuery("")
    }
  }, [])

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)
  }, [])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsOpen(false)
      setSearchQuery("")
    }
  }, [])

  const enhancedTrigger = trigger ? (
    <div
      className={cn(
        "inline-flex",
        "[&_img[alt='Arrow']]:transition-transform [&_img[alt='Arrow']]:duration-200",
        isOpen && "[&_img[alt='Arrow']]:rotate-180",
      )}
    >
      {trigger}
    </div>
  ) : (
    trigger
  )

  const CurrencyList = () => (
    <div className="w-full h-full">
      <div className="relative mb-4 md:mb-0">
        <Image
          src="/icons/search-icon-custom.png"
          alt="Search"
          width={24}
          height={24}
          className="absolute left-3 top-1/2 transform -translate-y-1/2"
        />
        <Input
          placeholder={placeholder}
          value={searchQuery}
          onChange={handleSearchChange}
          onKeyDown={handleKeyDown}
          className="text-base h-8 pl-10 border-grayscale-500 focus:border-grayscale-500 bg-grayscale-500 rounded-lg"
          autoComplete="off"
          autoFocus
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSearchQuery("")}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 hover:bg-transparent"
          >
            <Image src="/icons/clear-search-icon.png" alt="Clear search" width={24} height={24} />
          </Button>
        )}
      </div>

      <div className="max-h-[85%] overflow-y-auto">
        {filteredCurrencies.length === 0 ? (
          <EmptyState
            title={`${searchQuery} is unavailable`}
            description="Select another currency"
            redirectToAds={false}
          />
        ) : (
          <div className="space-y-1">
            {!isMobile && <div className="text-base text-black opacity-[0.48] py-3">{title}</div>}
            {filteredCurrencies.map((currency) => (
              <div
                key={currency.code}
                onClick={() => handleCurrencySelect(currency.code)}
                className={cn(
                  "px-4 py-3 rounded-sm cursor-pointer transition-colors",
                  selectedCurrency === currency.code ? "bg-black text-white" : "hover:bg-gray-50 text-gray-700",
                )}
              >
                {currency.code}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={handleOpenChange}>
        <DrawerTrigger asChild>{enhancedTrigger}</DrawerTrigger>
        <DrawerContent side="bottom" className="h-[90vh] p-[16px] rounded-t-2xl">
          <div className="my-4">
            <h3 className="text-xl font-bold text-center">{title}</h3>
          </div>
          <CurrencyList />
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>{enhancedTrigger}</PopoverTrigger>
      <PopoverContent className="w-80 h-80 p-4" align="end">
        <CurrencyList />
      </PopoverContent>
    </Popover>
  )
}
