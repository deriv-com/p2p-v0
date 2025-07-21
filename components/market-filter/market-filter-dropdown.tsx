"use client"

import type React from "react"

import { useCallback, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useIsMobile } from "@/components/ui/use-mobile"

export interface MarketFilterOptions {
  withinBalance: boolean
  fromFollowing: boolean
}

interface MarketFilterDropdownProps {
  onApply: (filters: MarketFilterOptions) => void
  initialFilters: MarketFilterOptions
  trigger: React.ReactElement
}

export default function MarketFilterDropdown({
  onApply,
  initialFilters,
  trigger,
}: MarketFilterDropdownProps) {
const [isOpen, setIsOpen] = useState(false)
  const [filters, setFilters] = useState<MarketFilterOptions>(initialFilters)
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
  }

  const handleApply = () => {
    onApply(filters)
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

  const FilterContent = () => (
    <div className="w-full h-full">
      <div className="space-y-4 mb-6">
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

      <div className="flex flex-col md:flex-row gap-3">
        <Button
          variant="outline"
          onClick={handleReset}
          className="rounded-full"
          size="sm"
        >
          Reset
        </Button>
        <Button onClick={handleApply} className="unded-full bg-black text-white hover:bg-gray-800" size="sm">
          Apply
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
            <h3 className="text-xl font-bold text-center">Filter by</h3>
          </div>
          <FilterContent />
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent className="w-80 h-fit p-2" align="start">
        <FilterContent />
      </PopoverContent>
    </Popover>
  )
}
