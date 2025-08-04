"use client"

import type React from "react"

import { useState, useMemo, useCallback } from "react"
import Image from "next/image"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useIsMobile } from "@/components/ui/use-mobile"
import { cn } from "@/lib/utils"
import type { CurrencyFilterProps } from "./types"

export function CurrencyFilter({
  currencies,
  selectedCurrency,
  onCurrencySelect,
  trigger,
  placeholder = "Search",
  emptyMessage = "Currency is unavailable",
}: CurrencyFilterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const isMobile = useIsMobile()

  const filteredCurrencies = useMemo(() => {
    let filtered = currencies

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      filtered = filtered.filter((currency) => {
        const codeMatch = currency.code.toLowerCase().includes(query)
        const nameMatch = currency.name.toLowerCase().includes(query)
        const wordMatch = currency.name
          .toLowerCase()
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

  const CurrencyList = () => (
    <div className="w-full h-full">
      <div className="relative mb-4">
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
          className="text-base pl-10 border-gray-200 focus:border-black focus:ring-0"
          autoComplete="off"
          autoFocus
        />
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
            {filteredCurrencies.map((currency) => (
              <div
                key={currency.code}
                onClick={() => handleCurrencySelect(currency.code)}
                className={cn(
                  "px-4 py-3 rounded-sm cursor-pointer transition-colors",
                  selectedCurrency === currency.code ? "bg-black text-white" : "hover:bg-gray-50 text-gray-700",
                )}
              >
                {currency.code} - {currency.name}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={handleOpenChange}>
        <SheetTrigger asChild>{trigger}</SheetTrigger>
        <SheetContent side="bottom" className="h-[90vh] p-[16px] rounded-t-2xl">
          <div className="mb-4">
            <h3 className="text-xl font-bold text-center">Choose currency</h3>
          </div>
          <CurrencyList />
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent className="w-80 h-80 p-2" align="start">
        <CurrencyList />
      </PopoverContent>
    </Popover>
  )
}
