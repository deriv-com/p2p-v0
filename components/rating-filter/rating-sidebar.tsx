"use client"

import { useState } from "react"
import { X, Star, ThumbsUp, ThumbsDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import type { RatingSidebarProps, RatingData } from "./types"

export function RatingSidebar({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
  title = "Rate and recommend",
  ratingLabel = "How would you rate this transaction?",
  recommendLabel = "Would you recommend this seller?",
}: RatingSidebarProps) {
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [recommend, setRecommend] = useState<boolean | null>(null)

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
      await onSubmit(ratingData)
      // Reset form after successful submission
      setRating(0)
      setHoverRating(0)
      setRecommend(null)
    } catch (error) {
      // Error handling is done in the parent component
      console.error("Error submitting rating:", error)
    }
  }

  const handleClose = () => {
    // Reset form when closing
    setRating(0)
    setHoverRating(0)
    setRecommend(null)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-end z-50">
      <div className="bg-white w-full max-w-md h-full flex flex-col">
       <div className="flex justify-between items-center px-4 py-1 border-b">
          <h2 className="text-xl font-bold">{title}</h2>
          <Button onClick={handleClose} variant="ghost" size="icon" className="p-1">
            <X className="h-6 w-6" />
          </Button>
        </div>

        <div className="flex-1 overflow-auto p-4">
          <div className="space-y-8">
            {/* Star Rating */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">{ratingLabel}</h3>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Button
                  variant="ghost"
                  size="sm"
                    key={star}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    disabled={isSubmitting}
                  >
                    <Star
                      className={cn(
                        "h-5 w-5",
                        (hoverRating || rating) >= star ? "fill-yellow-400 text-yellow-400" : "text-gray-300",
                      )}
                    />
                  </Button>
                ))}
              </div>
            </div>

            {/* Recommendation */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">{recommendLabel}</h3>
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setRecommend(true)}
                  disabled={isSubmitting}
                  className={cn(
                    recommend === true ? "border-green-500 bg-green-50" : "border-gray-300",
                  )}
                >
                  <ThumbsUp className={cn("h-5 w-5", recommend === true ? "text-green-500" : "text-gray-400")} />
                  <span className={cn(recommend === true ? "text-green-700" : "text-gray-600")}>Yes</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setRecommend(false)}
                  disabled={isSubmitting}
                  className={cn(
                      recommend === false ? "border-red-500 bg-red-50" : "border-gray-300",
                  )}
                >
                  <ThumbsDown className={cn("h-5 w-5", recommend === false ? "text-red-500" : "text-gray-400")} />
                  <span className={cn(recommend === false ? "text-red-700" : "text-gray-600")}>No</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t">
          <Button onClick={handleSubmit} disabled={isSubmitting || rating === 0} className="w-full">
            {isSubmitting ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent mr-2"></div>
                Submitting...
              </>
            ) : (
              "Submit"
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
