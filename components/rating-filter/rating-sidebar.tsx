"use client"

import { useState } from "react"
import { X } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

interface RatingSidebarProps {
  isOpen: boolean
  onClose: () => void
  onApplyFilters: (filters: {
    rating: number | null
    recommended: boolean | null
  }) => void
}

export function RatingSidebar({ isOpen, onClose, onApplyFilters }: RatingSidebarProps) {
  const [selectedRating, setSelectedRating] = useState<number | null>(null)
  const [hoveredRating, setHoveredRating] = useState<number | null>(null)
  const [recommended, setRecommended] = useState<boolean | null>(null)

  const handleApplyFilters = () => {
    onApplyFilters({
      rating: selectedRating,
      recommended,
    })
    onClose()
  }

  const handleClearFilters = () => {
    setSelectedRating(null)
    setRecommended(null)
  }

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, index) => {
      const starNumber = index + 1
      const isActive = starNumber <= (hoveredRating || selectedRating || 0)

      return (
        <button
          key={starNumber}
          className="p-1 transition-transform hover:scale-110"
          onMouseEnter={() => setHoveredRating(starNumber)}
          onMouseLeave={() => setHoveredRating(null)}
          onClick={() => setSelectedRating(starNumber)}
        >
          <Image
            src={isActive ? "/icons/star-active.png" : "/icons/star-custom.png"}
            alt={`${starNumber} star${starNumber > 1 ? "s" : ""}`}
            width={20}
            height={20}
            className="w-5 h-5"
          />
        </button>
      )
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50 lg:hidden">
      <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-lg">
        <Card className="h-full border-0 rounded-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-lg font-semibold">Filter by Rating</CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Star Rating Filter */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Minimum Rating</h3>
              <div className="flex items-center gap-1">{renderStars()}</div>
              {selectedRating && (
                <p className="text-xs text-muted-foreground">
                  {selectedRating} star{selectedRating > 1 ? "s" : ""} and above
                </p>
              )}
            </div>

            <Separator />

            {/* Recommendation Filter */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Recommended</h3>
              <div className="flex gap-2">
                <Button
                  variant={recommended === true ? "default" : "outline"}
                  size="sm"
                  onClick={() => setRecommended(recommended === true ? null : true)}
                  className="flex items-center gap-2"
                >
                  <Image src="/icons/thumbs-up-custom.png" alt="Thumbs up" width={20} height={20} className="w-5 h-5" />
                  Yes
                </Button>
                <Button
                  variant={recommended === false ? "default" : "outline"}
                  size="sm"
                  onClick={() => setRecommended(recommended === false ? null : false)}
                  className="flex items-center gap-2"
                >
                  <Image
                    src="/icons/thumbs-down-custom.png"
                    alt="Thumbs down"
                    width={20}
                    height={20}
                    className="w-5 h-5"
                  />
                  No
                </Button>
              </div>
            </div>

            <Separator />

            {/* Action Buttons */}
            <div className="flex flex-col gap-2 pt-4">
              <Button onClick={handleApplyFilters} className="w-full">
                Apply Filters
              </Button>
              <Button variant="outline" onClick={handleClearFilters} className="w-full bg-transparent">
                Clear All
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
