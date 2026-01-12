"use client"

import type React from "react"

import { useCallback, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer"
import { useIsMobile } from "@/hooks/use-mobile"
import { Label } from "@/components/ui/label"
import type { MarketFilterOptions } from "./types"
import { useTranslations } from "@/lib/i18n/use-translations"

interface MarketFilterDropdownProps {
  activeTab?: string
  onApply: (filters: MarketFilterOptions, sortByValue?: string) => void
  initialFilters: MarketFilterOptions
  initialSortBy: string
  trigger: React.ReactElement
  hasActiveFilters?: boolean
  onOpenChange?: (open: boolean) => void
}

export default function MarketFilterDropdown({
  activeTab,
  onApply,
  initialFilters,
  initialSortBy,
  trigger,
  hasActiveFilters = false,
  onOpenChange: onOpenChangeProp,
}: MarketFilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [filters, setFilters] = useState<MarketFilterOptions>(initialFilters)
  const [sortBy, setSortBy] = useState(initialSortBy)
  const isMobile = useIsMobile()
  const { t } = useTranslations()

  useEffect(() => {
    setFilters(initialFilters)
  }, [initialFilters])

  const handleReset = () => {
    setSortBy("exchange_rate")
    onApply({ fromFollowing: false, isPrivate: false }, "exchange_rate")
    setIsOpen(false)
    onOpenChangeProp?.(false)
  }

  const handleApply = () => {
    onApply(filters, sortBy)
    setIsOpen(false)
    onOpenChangeProp?.(false)
  }

  const handleOpenChange = useCallback(
    (open: boolean) => {
      setIsOpen(open)
      onOpenChangeProp?.(open)
    },
    [onOpenChangeProp],
  )

  const handleFilterChange = (key: keyof MarketFilterOptions, value: boolean) => {
    const newFilters = {
      ...filters,
      [key]: value,
    }
    setFilters(newFilters)

    if (!isMobile) {
      onApply(newFilters, sortBy)
    }
  }

  const handleSortByChange = (value: "exchange_rate" | "user_rating_average_lifetime") => {
    setSortBy(value)

    if (!isMobile) {
      onApply(filters, value)
    }
  }

  const FilterContent = () => (
    <div className="w-full h-full">
      <div className="space-y-2 mb-2">
        <div className="mb-2">
          <h4 className="text-base font-normal text-grayscale-text-muted">{t("filter.adTypes")}</h4>
        </div>
        <div className="flex items-center space-x-3">
          <Checkbox
            id="from-following"
            checked={filters.fromFollowing}
            onCheckedChange={(checked) => handleFilterChange("fromFollowing", checked as boolean)}
            className="data-[state=checked]:bg-black border-2 border-grayscale-text-muted"
          />
          <label htmlFor="from-following" className="text-sm text-grayscale-600 cursor-pointer">
            {t("filter.adsFromFollowing")}
          </label>
        </div>
        <div className="flex items-center space-x-3">
          <Checkbox
            id="is-private"
            checked={filters.isPrivate}
            onCheckedChange={(checked) => handleFilterChange("isPrivate", checked as boolean)}
            className={cn("data-[state=checked]:bg-black border-2 border-grayscale-text-muted")}
          />
          <label htmlFor="is-private" className="text-sm text-grayscale-600 cursor-pointer">
            Ads from closed group only
          </label>
        </div>
      </div>
      <div className="mb-2">
        <div className="border-t border-gray-200 pt-2">
          <h4 className="text-base font-normal text-grayscale-text-muted mb-2">{t("filter.sortBy")}</h4>
          <RadioGroup value={sortBy} onValueChange={handleSortByChange} className="gap-4">
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="exchange_rate" id="exchange_rate" className="border-grayscale-100 text-black" />
              <Label htmlFor="exchange_rate" className="font-normal text-sm text-grayscale-600 cursor-pointer">
                {activeTab === "sell" ? t("filter.exchangeRateLowHigh") : t("filter.exchangeRateHighLow")}
              </Label>
            </div>
            <div className="flex items-center space-x-3">
              <RadioGroupItem
                value="user_rating_average_lifetime"
                id="user_rating_average_lifetime"
                className="border-grayscale-100 text-black"
              />
              <Label
                htmlFor="user_rating_average_lifetime"
                className="font-normal text-sm text-grayscale-600 cursor-pointer"
              >
                {t("filter.userRatingHighLow")}
              </Label>
            </div>
          </RadioGroup>
        </div>
      </div>
      {isMobile && (
        <div className="flex flex-col md:flex-row gap-3 mt-6">
          <Button variant="outline" onClick={handleReset} className="rounded-full flex-1 bg-transparent" size="default">
            {t("filter.reset")}
          </Button>
          <Button
            onClick={handleApply}
            className={`flex-1 rounded-full text-white hover:bg-gray-800 order-first`}
            size="default"
          >
            {t("filter.apply")}
          </Button>
        </div>
      )}
    </div>
  )

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={handleOpenChange}>
        <DrawerTrigger asChild>
          <div className="relative">
            {trigger}
            {hasActiveFilters && (
              <div className="absolute top-[5px] right-[12px] w-2 h-2 bg-red-500 rounded-full"></div>
            )}
          </div>
        </DrawerTrigger>
        <DrawerContent side="bottom" className="h-auto p-[16px] rounded-t-2xl">
          <div className="my-4">
            <h3 className="text-xl font-bold text-center">{t("filter.filter")}</h3>
          </div>
          <FilterContent />
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <div className="relative w-fit">
          {trigger}
          {hasActiveFilters && <div className="absolute top-[5px] right-[12px] w-2 h-2 bg-red-500 rounded-full"></div>}
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-fit h-fit py-2 px-4" align="end">
        <FilterContent />
      </PopoverContent>
    </Popover>
  )
}
