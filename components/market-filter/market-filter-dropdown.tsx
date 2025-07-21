"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useIsMobile } from "@/components/ui/use-mobile"

export interface MarketFilterOptions {
  withinBalance: boolean
  fromFollowing: boolean
}

interface MarketFilterDropdownProps {
  isOpen: boolean
  onClose: () => void
  onApply: (filters: MarketFilterOptions) => void
  initialFilters: MarketFilterOptions
  trigger: React.ReactElement
}

export default function MarketFilterDropdown({
  isOpen,
  onClose,
  onApply,
  initialFilters,
  trigger,
}: MarketFilterDropdownProps) {
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
    onClose()
  }

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
            className="data-[state=checked]:bg-black data-[state=checked]:border-black"
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
            className="data-[state=checked]:bg-black data-[state=checked]:border-black"
          />
          <label htmlFor="from-following" className="text-sm font-medium text-gray-700 cursor-pointer">
            Ads from advertisers you follow
          </label>
        </div>
      </div>

      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={handleReset}
          className="flex-1 rounded-full border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent"
        >
          Reset
        </Button>
        <Button onClick={handleApply} className="flex-1 rounded-full bg-black text-white hover:bg-gray-800">
          Apply
        </Button>
      </div>
    </div>
  )

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetTrigger asChild>{trigger}</SheetTrigger>
        <SheetContent side="bottom" className="h-[50vh] p-[16px] rounded-t-2xl">
          <div className="mb-4">
            <h3 className="text-xl font-bold text-center">Filter by</h3>
          </div>
          <FilterContent />
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <div className="relative">
      {trigger}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4">
          <FilterContent />
        </div>
      )}
    </div>
  )
}
