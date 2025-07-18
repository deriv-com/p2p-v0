"use client"

import type React from "react"

import { useState, useMemo, useCallback, useRef, useEffect } from "react"
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
  searchPlaceholder = "Search currencies...",
}: CurrencyFilterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const isMobile = useIsMobile()
  const searchInputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  // Enhanced search algorithm for continuous filtering
  const filteredCurrencies = useMemo(() => {
    if (!searchQuery.trim()) return currencies

    const query = searchQuery.toLowerCase().trim()

    return currencies
      .filter((currency) => {
        const codeMatch = currency.code.toLowerCase().includes(query)
        const nameMatch = currency.name.toLowerCase().includes(query)

        // Also check if query matches the start of words in the name
        const wordStartMatch = currency.name
          .toLowerCase()
          .split(" ")
          .some((word) => word.startsWith(query))

        return codeMatch || nameMatch || wordStartMatch
      })
      .sort((a, b) => {
        // Prioritize exact matches and matches at the beginning
        const aCodeExact = a.code.toLowerCase() === query
        const bCodeExact = b.code.toLowerCase() === query
        const aCodeStart = a.code.toLowerCase().startsWith(query)
        const bCodeStart = b.code.toLowerCase().startsWith(query)

        if (aCodeExact && !bCodeExact) return -1
        if (!aCodeExact && bCodeExact) return 1
        if (aCodeStart && !bCodeStart) return -1
        if (!aCodeStart && bCodeStart) return 1

        return a.code.localeCompare(b.code)
      })
  }, [currencies, searchQuery])

  // Handle continuous search input
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)
    setFocusedIndex(-1) // Reset focus when search changes
  }, [])

  const handleCurrencySelect = useCallback(
    (currencyCode: string) => {
      onCurrencySelect(currencyCode)
      setIsOpen(false)
      setSearchQuery("")
      setFocusedIndex(-1)
    },
    [onCurrencySelect],
  )

  const handleOpenChange = useCallback((open: boolean) => {
    setIsOpen(open)
    if (!open) {
      setSearchQuery("")
      setFocusedIndex(-1)
    } else {
      // Focus search input when opened
      setTimeout(() => {
        searchInputRef.current?.focus()
      }, 100)
    }
  }, [])

  // Keyboard navigation for continuous interaction
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen) return

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault()
          setFocusedIndex((prev) => (prev < filteredCurrencies.length - 1 ? prev + 1 : 0))
          break
        case "ArrowUp":
          e.preventDefault()
          setFocusedIndex((prev) => (prev > 0 ? prev - 1 : filteredCurrencies.length - 1))
          break
        case "Enter":
          e.preventDefault()
          if (focusedIndex >= 0 && filteredCurrencies[focusedIndex]) {
            handleCurrencySelect(filteredCurrencies[focusedIndex].code)
          }
          break
        case "Escape":
          e.preventDefault()
          setIsOpen(false)
          break
      }
    },
    [isOpen, filteredCurrencies, focusedIndex, handleCurrencySelect],
  )

  // Auto-scroll focused item into view
  useEffect(() => {
    if (focusedIndex >= 0 && listRef.current) {
      const focusedElement = listRef.current.children[focusedIndex] as HTMLElement
      if (focusedElement) {
        focusedElement.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        })
      }
    }
  }, [focusedIndex])

  const CurrencyList = () => (
    <div className="w-full">
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          ref={searchInputRef}
          placeholder={searchPlaceholder}
          value={searchQuery}
          onChange={handleSearchChange}
          onKeyDown={handleKeyDown}
          className="pl-10 border-gray-200 focus:border-black focus:ring-0"
          autoComplete="off"
          autoFocus={!isMobile}
        />
      </div>

      <div ref={listRef} className="max-h-80 overflow-y-auto" role="listbox" aria-label="Currency options">
        {filteredCurrencies.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {searchQuery ? `No currencies found for "${searchQuery}"` : emptyMessage}
          </div>
        ) : (
          <div className="space-y-1">
            {filteredCurrencies.map((currency, index) => (
              <div
                key={currency.code}
                onClick={() => handleCurrencySelect(currency.code)}
                onMouseEnter={() => setFocusedIndex(index)}
                className={cn(
                  "px-4 py-3 rounded-lg cursor-pointer transition-colors text-sm",
                  selectedCurrency === currency.code
                    ? "bg-black text-white"
                    : focusedIndex === index
                      ? "bg-gray-100 text-gray-900"
                      : "hover:bg-gray-50 text-gray-700",
                )}
                role="option"
                aria-selected={selectedCurrency === currency.code}
                tabIndex={-1}
              >
                <div className="flex items-center justify-between">
                  <span>
                    {searchQuery ? (
                      <HighlightMatch text={`${currency.code} - ${currency.name}`} query={searchQuery} />
                    ) : (
                      `${currency.code} - ${currency.name}`
                    )}
                  </span>
                </div>
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
      <PopoverContent className="w-80 p-4" align="start" onKeyDown={handleKeyDown}>
        <CurrencyList />
      </PopoverContent>
    </Popover>
  )
}

// Helper component to highlight search matches
function HighlightMatch({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <span>{text}</span>

  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi")
  const parts = text.split(regex)

  return (
    <span>
      {parts.map((part, index) =>
        regex.test(part) ? (
          <mark key={index} className="bg-yellow-200 text-gray-900 px-0.5 rounded">
            {part}
          </mark>
        ) : (
          <span key={index}>{part}</span>
        ),
      )}
    </span>
  )
}
