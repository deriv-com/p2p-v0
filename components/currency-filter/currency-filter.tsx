"use client"

import { useState, useMemo } from "react"
import { Search } from "lucide-react"
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
  emptyMessage = "No currencies found",
}: CurrencyFilterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const isMobile = useIsMobile()

  const filteredCurrencies = useMemo(() => {
    if (!searchQuery.trim()) return currencies

    const query = searchQuery.toLowerCase()
    return currencies.filter(
      (currency) => currency.code.toLowerCase().includes(query) || currency.name.toLowerCase().includes(query),
    )
  }, [currencies, searchQuery])

  const handleCurrencySelect = (currencyCode: string) => {
    onCurrencySelect(currencyCode)
    setIsOpen(false)
    setSearchQuery("")
  }

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (!open) {
      setSearchQuery("")
    }
  }

  const CurrencyList = () => (
    <div className="w-full">
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 border-gray-200 focus:border-black focus:ring-0"
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
      <PopoverContent className="w-80 p-4" align="start">
        <CurrencyList />
      </PopoverContent>
    </Popover>
  )
}
