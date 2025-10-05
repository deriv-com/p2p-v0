"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import { OrdersAPI } from "@/services/api"
import type { RatingSidebarProps, RatingData } from "./types"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { useIsMobile } from "@/components/ui/use-mobile"

interface RatingContentProps {
  rating: number
  setRating: (rating: number) => void
  hoverRating: number
  setHoverRating: (rating: number) => void
  recommend: boolean | null
  setRecommend: (recommend: boolean | null) => void
  ratingLabel: string
  recommendLabel?: string
  onSubmit: () => void
}

const RatingContent = ({
  rating,
  setRating,
  hoverRating,
  setHoverRating,
  recommend,
  setRecommend,
  ratingLabel,
  recommendLabel,
  onSubmit,
}: RatingContentProps) => (
  <>
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
            <Button
              variant="outline"
              className={cn(
                  "border-opacity-10",
                  recommend === true ? "bg-success-text" : "",
                )}
              size="sm"
              onClick={() => setRecommend(recommend === true ? null : true)}
            >
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
              className="border-opacity-10"
              size="sm"
              onClick={() => setRecommend(recommend === false ? null : false)}
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
    <div className="p-4">
      <Button onClick={onSubmit} disabled={rating === 0} className="w-full disabled:opacity-[0.24]">
        Submit
      </Button>
    </div>
  </>
)

export function RatingSidebar({
  isOpen,
  onClose,
  onSubmit,
  orderId,
  title = "Rate and recommend",
  ratingLabel = "How would you rate this transaction?",
  recommendLabel,
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

  if (!isOpen) return null

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={onClose}>
        <DrawerContent side="bottom" className="h-auto max-h-[80vh] rounded-t-2xl px-0">
          <DrawerHeader className="pb-4">
            <DrawerTitle className="text-xl font-bold text-center">{title}</DrawerTitle>
          </DrawerHeader>
          <RatingContent
            rating={rating}
            setRating={setRating}
            hoverRating={hoverRating}
            setHoverRating={setHoverRating}
            recommend={recommend}
            setRecommend={setRecommend}
            ratingLabel={ratingLabel}
            recommendLabel={recommendLabel}
            onSubmit={handleSubmit}
          />
        </DrawerContent>
      </Drawer>
    )
  }

  return (
     <Dialog open={isStatsModalOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md sm:rounded-[32px]">
        <DialogHeader>
          <DialogTitle className="tracking-normal font-bold text-2xl">Advertiser info</DialogTitle>
        </DialogHeader>
        <StatsContent profile={profile} isMobile={false} />
        <Button onClick={() => handleClose(false)}>Close</Button>
      </DialogContent>
    </Dialog>
    <div className="fixed inset-0 bg-black/50 flex justify-end z-50">
      <div className="bg-white w-full max-w-md h-full flex flex-col">
        <div className="flex justify-between items-center px-4 py-3 border-b">
          <h2 className="text-xl font-bold">{title}</h2>
          <Button onClick={handleClose} variant="ghost" size="sm" className="bg-grayscale-300 px-1">
            <Image src="/icons/close-circle.png" alt="Close" width={24} height={24} />
          </Button>
        </div>
        <RatingContent
          rating={rating}
          setRating={setRating}
          hoverRating={hoverRating}
          setHoverRating={setHoverRating}
          recommend={recommend}
          setRecommend={setRecommend}
          ratingLabel={ratingLabel}
          recommendLabel={recommendLabel}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  )
}
