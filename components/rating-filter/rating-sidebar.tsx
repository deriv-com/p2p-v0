"use client"

import { useState } from "react"
import { X } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import { OrdersAPI } from "@/services/api"
import type { RatingSidebarProps, RatingData } from "./types"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { useIsMobile } from "@/components/ui/use-mobile"

export function RatingSidebar({
  isOpen,
  onClose,
  onSubmit,
  orderId,
  title = "Rate and recommend",
  ratingLabel = "How would you rate this transaction?",
  recommendLabel = "Would you recommend this seller?",
}: RatingSidebarProps) {
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [recommend, setRecommend] = useState<boolean | null>(null)

  const isMobile = useIsMobile()

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({
        title: "Rating required",
        description: "Please select a star rating before submitting.",
        variant: "destructive",
      })
      return
    }

    const ratingData: RatingData = {
      rating,
      recommend,
    }

    try {
      const result = await OrdersAPI.reviewOrder(orderId, ratingData)
      if (result.errors.length === 0) {
        onSubmit?.()
      }
      setRating(0)
      setHoverRating(0)
      setRecommend(null)
    } catch (error) {
      console.error("Error submitting rating:", error)
    }
  }

  const handleClose = () => {
    setRating(0)
    setHoverRating(0)
    setRecommend(null)
    onClose()
  }

  const RatingContent = () => (
  <div className="flex-1 overflow-auto p-4">
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-sm">{ratingLabel}</h3>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Button
                    variant="ghost"
                    size="sm"
                    key={star}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="hover:bg-transparent p-0 mr-[4px]"
                  >
                    <Image
                      src={(hoverRating || rating) >= star ? "/icons/star-active.png" : "/icons/star-custom.png"}
                      alt="Star rating"
                      width={32}
                      height={32}
                    />
                  </Button>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-sm">{recommendLabel}</h3>
              <div className="flex gap-4">
                <Button variant={recommend === true ? "black" : "outline"} size="sm" onClick={() => setRecommend(true)}>
                  <Image
                    src={recommend === true ? "/icons/thumbs-up-white.png" : "/icons/thumbs-up-custom.png"}
                    alt="Thumbs up"
                    width={14}
                    height={14}
                  />
                  <span
                    className={cn(
                      "text-sm ml-[8px] font-normal ",
                      recommend === true ? "text-white" : "text-grayscale-100",
                    )}
                  >
                    Yes
                  </span>
                </Button>
                <Button
                  variant={recommend === false ? "black" : "outline"}
                  size="sm"
                  onClick={() => setRecommend(false)}
                >
                  <Image
                    src={recommend === false ? "/icons/thumbs-down-white.png" : "/icons/thumbs-down-custom.png"}
                    alt="Thumbs down"
                    width={14}
                    height={14}
                  />
                  <span
                    className={cn(
                      "text-sm ml-[8px] font-normal ",
                      recommend === false ? "text-white" : "text-grayscale-100",
                    )}
                  >
                    No
                  </span>
                </Button>
              </div>
            </div>
          </div>
        </div>
        <div className="p-4 border-t">
          <Button
            variant="black"
            onClick={handleSubmit}
            disabled={rating === 0}
            className="w-full disabled:opacity-[0.24]"
          >
            Submit
          </Button>
        </div>
  )

  if (!isOpen) return null

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent side="bottom" className="h-auto max-h-[80vh] rounded-t-lg">
          <SheetHeader className="pb-4">
            <SheetTitle className="text-xl font-bold text-center">{title}</SheetTitle>
          </SheetHeader>
          <RatingContent />
        </SheetContent>
      </Sheet>
    )
  }

  // Desktop sidebar (existing design)
  return (
    <div className="fixed inset-0 bg-black/50 flex justify-end z-50">
      <div className="bg-white w-full max-w-md h-full flex flex-col">
        <div className="flex justify-between items-center px-4 py-1 border-b">
          <h2 className="text-xl font-bold">{title}</h2>
          <Button onClick={handleClose} variant="ghost" size="icon" className="p-1">
            <X className="h-6 w-6" />
          </Button>
        </div>
        <RatingContent />
      </div>
    </div>
  )
}
