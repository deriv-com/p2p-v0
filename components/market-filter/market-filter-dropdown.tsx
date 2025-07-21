"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"

export interface MarketFilterOptions {
  withinBalance: boolean
  fromFollowing: boolean
}

interface MarketFilterDropdownProps {
  isOpen: boolean
  onClose: () => void
  onApply: (filters: MarketFilterOptions) => void
  initialFilters: MarketFilterOptions
}

export default function MarketFilterDropdown({ isOpen, onClose, onApply, initialFilters }: MarketFilterDropdownProps) {
  const [filters, setFilters] = useState<MarketFilterOptions>(initialFilters)

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

  if (!isOpen) return null

  return (
    <div className="absolute top-full left-0 mt-1 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4">
      <div className="space-y-4">
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

      <div className="flex gap-3 mt-6">
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
}
