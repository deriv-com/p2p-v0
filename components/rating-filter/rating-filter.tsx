"use client"

import type React from "react"
import { useState, useMemo, useCallback } from "react"
import Image from "next/image"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useIsMobile } from "@/components/ui/use-mobile"
import { cn } from "@/lib/utils"
import type { RatingFilterProps } from "./types"

export function RatingFilter({
  ratings,
  selectedRating,
  onRatingSelect,
  trigger,
  placeholder = "Search ratings",
  emptyMessage = "No ratings available",
}: RatingFilterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const isMobile = useIsMobile()

  const filteredRatings = useMemo(() => {
    let filtered = ratings

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      filtered = filtered.filter((rating) => {
        const labelMatch = rating.label.toLowerCase().includes(query)
        const valueMatch = rating.value.toString().includes(query)
        return labelMatch || valueMatch
      })
    }

    // Sort ratings by value in descending order (5 stars first)
    filtered.sort((a, b) => b.value - a.value)

    // Move selected rating to top if it exists
    const selectedRatingItem = filtered.find((rating) => rating.value === selectedRating)
    const unselectedRatings = filtered.filter((rating) => rating.value !== selectedRating)

    return selectedRatingItem ? [selectedRatingItem, ...unselectedRatings] : unselectedRatings
  }, [ratings, searchQuery, selectedRating])

  const handleRatingSelect = useCallback(
    (ratingValue: number | null) => {
      onRatingSelect(ratingValue)
      setIsOpen(false)
      setSearchQuery("")
    },
    [onRatingSelect],
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

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Image
            key={star}
            src="/icons/star-icon.png"
            alt="Star"
            width={16}
            height={16}
            className={cn("w-4 h-4", star <= rating ? "opacity-100" : "opacity-30")}
          />
        ))}
      </div>
    )
  }

  const RatingList = () => (
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
        {/* Clear selection option */}
        <div
          onClick={() => handleRatingSelect(null)}
          className={cn(
            "px-4 py-3 rounded-sm cursor-pointer transition-colors mb-2",
            selectedRating === null ? "bg-black text-white" : "hover:bg-gray-50 text-gray-700",
          )}
        >
          <div className="flex items-center justify-between">
            <span>All ratings</span>
            {selectedRating === null && <div className="w-2 h-2 bg-white rounded-full" />}
          </div>
        </div>

        {filteredRatings.length === 0 ? (
          <div className="text-center py-8 text-gray-500">{emptyMessage}</div>
        ) : (
          <div className="space-y-1">
            {filteredRatings.map((rating) => (
              <div
                key={rating.value}
                onClick={() => handleRatingSelect(rating.value)}
                className={cn(
                  "px-4 py-3 rounded-sm cursor-pointer transition-colors",
                  selectedRating === rating.value ? "bg-black text-white" : "hover:bg-gray-50 text-gray-700",
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {renderStars(rating.value)}
                    <span className="font-medium">{rating.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {rating.count !== undefined && <span className="text-sm text-gray-500">({rating.count})</span>}
                    {selectedRating === rating.value && <div className="w-2 h-2 bg-white rounded-full" />}
                  </div>
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
        <SheetContent side="bottom" className="h-[90vh] p-[16px] rounded-t-2xl">
          <div className="mb-4">
            <h3 className="text-xl font-bold text-center">Choose rating</h3>
          </div>
          <RatingList />
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent className="w-80 h-80 p-2" align="start">
        <RatingList />
      </PopoverContent>
    </Popover>
  )
}
