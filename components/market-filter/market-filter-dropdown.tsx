"use client"

import type React from "react"

import { useCallback, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useIsMobile } from "@/hooks/use-mobile"
import { Label } from "@/components/ui/label"

export interface MarketFilterOptions {
  fromFollowing: boolean
  }
  
interface MarketFilterDropdownProps {
  activeTab?: string
  onApply: (filters: MarketFilterOptions, sortByValue?: string) => void
  initialFilters: MarketFilterOptions
  initialSortBy: string
  trigger: React.ReactElement
  hasActiveFilters?: boolean
}

export default function MarketFilterDropdown({
  activeTab,
  onApply,
  initialFilters,
  initialSortBy,
  trigger,
  hasActiveFilters = false,
}: MarketFilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [filters, setFilters] = useState<MarketFilterOptions>(initialFilters)
  const [sortBy, setSortBy] = useState(initialSortBy)
  const isMobile = useIsMobile()

  useEffect(() => {
    setFilters(initialFilters)
  }, [initialFilters])

  const handleReset = () => {
    if (isMobile) {
      setSortBy("exchange_rate")
            onApply({ fromFollowing: false }, "exchange_rate")
    } else {
           onApply({ fromFollowing: false })
    }
    setIsOpen(false)
  }

  const handleApply = () => {
    if (isMobile) onApply(filters, sortBy)
    else onApply(filters)
    setIsOpen(false)
  }

  const handleOpenChange = useCallback((open: boolean) => {
    setIsOpen(open)
  }, [])

  const handleFilterChange = (key: keyof MarketFilterOptions, value: boolean) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const handleSortByChange = (value: "exchange_rate" | "user_rating_average_lifetime") => {
    setSortBy(value)
  }

  const FilterContent = () => (
    <div className="w-full h-full">
      <div className="space-y-4 mb-6">
        {isMobile && (
          <div className="mb-6">
            <h4 className="text-sm font-bold mb-4">Ad types</h4>
          </div>
      )}
        <div className="flex items-center space-x-3">
          <Checkbox
            id="from-following"
            checked={filters.fromFollowing}
            onCheckedChange={(checked) => handleFilterChange("fromFollowing", checked as boolean)}
            className="data-[state=checked]:bg-black border-black"
          />
          <label htmlFor="from-following" className="text-sm text-gray-700 cursor-pointer">
            Ads from advertisers you follow
          </label>
        </div>
      </div>

      {isMobile && (
        <div className="mb-6">
          <div className="border-t border-gray-200 pt-6">
            <h4 className="text-sm font-bold mb-4">Sort by</h4>
            <RadioGroup value={sortBy} onValueChange={handleSortByChange} className="gap-4">
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="exchange_rate" id="exchange_rate" className="border-grayscale-100 text-black" />
                <Label htmlFor="exchange_rate" className="text-sm text-gray-700 cursor-pointer">
                  {activeTab === "sell" ? <>Exchange rate (low-high)</> : <>Exchange rate (high-low)</>}
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <RadioGroupItem
                  value="user_rating_average_lifetime"
                  id="user_rating_average_lifetime"
                  className="border-grayscale-100 text-black"
                />
                <Label htmlFor="user_rating_average_lifetime" className="text-sm text-gray-700 cursor-pointer">
                  User rating (high-low)
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-3">
        <Button
          variant="outline"
          onClick={handleReset}
          className="rounded-full flex-1 bg-transparent"
          size={isMobile ? "default" : "sm"}
        >
          Reset
        </Button>
        <Button
          onClick={handleApply}
          className={`flex-1 rounded-full bg-black text-white hover:bg-gray-800 ${isMobile ? "order-first" : ""}`}
          size={isMobile ? "default" : "sm"}
        >
          {isMobile ? "Apply filters" : "Apply"}
        </Button>
      </div>
    </div>
  )

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={handleOpenChange}>
        <SheetTrigger asChild>
          <div className="relative">
            {trigger}
            {hasActiveFilters && (
              <div className="absolute top-[5px] right-[12px] w-2 h-2 bg-red-500 rounded-full"></div>
            )}
          </div>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-auto p-[16px] rounded-t-2xl">
          <div className="mb-4">
            <h3 className="text-xl font-bold text-center">Filter</h3>
          </div>
          <FilterContent />
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent className="w-fit h-fit p-2" align="start">
        <FilterContent />
      </PopoverContent>
    </Popover>
  )
}
