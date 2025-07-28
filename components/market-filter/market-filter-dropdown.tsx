"use client"

import type React from "react"

import { useCallback, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useIsMobile } from "@/components/ui/use-mobile"
import { Label } from "@/components/ui/label"

export interface MarketFilterOptions {
  withinBalance: boolean
  fromFollowing: boolean
}

interface MarketFilterDropdownProps {
  onApply: (filters: MarketFilterOptions) => void
  initialFilters: MarketFilterOptions
  initialSortBy: string
  trigger: React.ReactElement
}

export default function MarketFilterDropdown({ onApply, initialFilters, initialSortBytrigger }: MarketFilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [filters, setFilters] = useState<MarketFilterOptions>(initialFilters)
  const [sortBy, setSortBy] = useState(initialSortBy)
  const isMobile = useIsMobile()

  useEffect(() => {
    setFilters(initialFilters)
  }, [initialFilters])

  const handleReset = () => {
    const resetFilters: MarketFilterOptions = {
      withinBalance: false,
      fromFollowing: false,
    }
    setFilters(resetFilters)
    handleApply(resetFilters)
  }

  const handleApply = () => {
    onApply(filters, sortBy)
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
            <h4 className="text-lg font-semibold mb-4">Ad types</h4>
          </div>
        )}
        <div className="flex items-center space-x-3">
          <Checkbox
            id="within-balance"
            checked={filters.withinBalance}
            onCheckedChange={(checked) => handleFilterChange("withinBalance", checked as boolean)}
            className="data-[state=checked]:bg-black border-black"
          />
          <label htmlFor="within-balance" className="text-sm font-medium text-gray-700 cursor-pointer">
            Ads within your P2P balance and order limits
          </label>
        </div>
        <div className="flex items-center space-x-3">
          <Checkbox
            id="from-following"
            checked={filters.fromFollowing}
            onCheckedChange={(checked) => handleFilterChange("fromFollowing", checked as boolean)}
            className="data-[state=checked]:bg-black border-black"
          />
          <label htmlFor="from-following" className="text-sm font-medium text-gray-700 cursor-pointer">
            Ads from advertisers you follow
          </label>
        </div>
      </div>

      {isMobile && (
        <div className="mb-6">
          <div className="border-t border-gray-200 pt-6">
            <h4 className="text-lg font-semibold mb-4">Sort by</h4>
            <RadioGroup value={filters.sortBy} onValueChange={handleSortByChange}>
              <div className="flex items-center space-x-3">
                <RadioGroupItem
                  value="exchange_rate"
                  id="exchange_rate"
                  className="border-grayscale-100 text-black"
                />
                <Label htmlFor="exchange_rate" className="text-sm font-medium text-gray-700 cursor-pointer">
                  Exchange rate (high-low)
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <RadioGroupItem
                  value="user_rating_average_lifetime"
                  id="user_rating_average_lifetime"
                  className="border-grayscale-100 text-black"
                />
                <Label htmlFor="user_rating_average_lifetime" className="text-sm font-medium text-gray-700 cursor-pointer">
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
        <SheetTrigger asChild>{trigger}</SheetTrigger>
        <SheetContent side="bottom" className="h-fit p-[16px] rounded-t-2xl">
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
