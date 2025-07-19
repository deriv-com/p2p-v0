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
    if (!searchQuery.trim()) return currencies

    const query = searchQuery.toLowerCase().trim()
    return currencies.filter((currency) => {
      const codeMatch = currency.code.toLowerCase().includes(query)
      const nameMatch = currency.name.toLowerCase().includes(query)
      const wordMatch = currency.name
        .toLowerCase()
        .split(" ")
        .some((word) => word.startsWith(query))
      return codeMatch || nameMatch || wordMatch
    })
  }, [currencies, searchQuery])

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
    <div className="w-full">
      <div className="relative mb-4">
        <Image
          src="/icons/search-icon-custom.png"
          alt="Search"
          width={16}
          height={16}
          className="absolute left-3 top-1/2 transform -translate-y-1/2 opacity-40"
        />
        <Input
          placeholder={placeholder}
          value={searchQuery}
          onChange={handleSearchChange}
          onKeyDown={handleKeyDown}
          className="pl-10 border-gray-200 focus:border-black focus:ring-0"
          autoComplete="off"
          autoFocus
        />
      </div>

      <div className="max-h-80 overflow-y-auto">
        {filteredCurrencies.length === 0 ? (
          <div className="text-center py-8 text-gray-500">{emptyMessage}</div>
        ) : (
          <div className="space-y-1">
            {filteredCurrencies.map((currency) => (
              <div
                key={currency.code}
                onClick={() => handleCurrencySelect(currency.code)}
                className={cn(
                  "px-4 py-3 rounded-lg cursor-pointer transition-colors text-sm",
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
        <SheetContent side="bottom" className="h-[80vh] p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold">Select Currency</h3>
          </div>
          <CurrencyList />
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent className="w-80 p-2" align="start">
        <CurrencyList />
      </PopoverContent>
    </Popover>
  )
}
