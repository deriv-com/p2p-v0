"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import { OrdersAPI } from "@/services/api"
import { useTranslations } from "@/lib/i18n/use-translations"
import type { RatingSidebarProps, RatingData } from "./types"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
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
  isSubmitting: boolean
  t: (key: string) => string
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
  isSubmitting,
  t,
}: RatingContentProps) => (
  <>
    <div className="flex-1 overflow-auto p-4 md:px-0">
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
              className={cn("border-opacity-10", recommend === true ? "bg-success-text hover:bg-success-text" : "")}
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
                {t("ratingSidebar.yes")}
              </span>
            </Button>
            <Button
              variant="outline"
              className={cn("border-opacity-10", recommend === false ? "bg-disputed-icon hover:bg-disputed-icon" : "")}
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
                {t("ratingSidebar.no")}
              </span>
            </Button>
          </div>
        </div>
      </div>
    </div>
    <div className="p-4 md:px-0">
      <Button onClick={onSubmit} disabled={rating === 0 || isSubmitting} className="w-full disabled:opacity-[0.24]">
        {isSubmitting ? (
          <Image src="/icons/spinner.png" alt="Loading" width={20} height={20} className="animate-spin" />
        ) : (
          t("ratingSidebar.submit")
        )}
      </Button>
    </div>
  </>
)

export function RatingSidebar({
  isOpen,
  onClose,
  onSubmit,
  orderId,
  title,
  ratingLabel,
  recommendLabel,
}: RatingSidebarProps) {
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [recommend, setRecommend] = useState<boolean | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isMobile = useIsMobile()
  const { t } = useTranslations()

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({
        title: t("ratingSidebar.ratingRequiredTitle"),
        description: t("ratingSidebar.ratingRequiredDescription"),
        variant: "destructive",
      })
      return
    }

    const ratingData: RatingData = {
      rating,
      recommend,
    }

    try {
      setIsSubmitting(true)
      const result = await OrdersAPI.reviewOrder(orderId, ratingData)
      if (result.errors.length === 0) {
        onSubmit?.()
      }
      setRating(0)
      setHoverRating(0)
      setRecommend(null)
    } catch (error) {
      console.error("Error submitting rating:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setRating(0)
    setHoverRating(0)
    setRecommend(null)
    onClose()
  }

  if (!isOpen) return null

  const displayTitle = t("ratingSidebar.title") || title
  const displayRatingLabel = t("ratingSidebar.ratingLabel") || ratingLabel
  const displayRecommendLabel = t("ratingSidebar.recommendLabel") || recommendLabel

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={onClose}>
        <DrawerContent side="bottom" className="h-auto max-h-[80vh] rounded-t-2xl px-0">
          <DrawerHeader className="pb-4">
            <DrawerTitle className="text-xl font-bold text-center">{displayTitle}</DrawerTitle>
          </DrawerHeader>
          <RatingContent
            rating={rating}
            setRating={setRating}
            hoverRating={hoverRating}
            setHoverRating={setHoverRating}
            recommend={recommend}
            setRecommend={setRecommend}
            ratingLabel={displayRatingLabel}
            recommendLabel={displayRecommendLabel}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            t={t}
          />
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md sm:rounded-[32px]">
        <DialogHeader>
          <DialogTitle className="tracking-normal font-bold text-2xl">{displayTitle}</DialogTitle>
        </DialogHeader>
        <RatingContent
          rating={rating}
          setRating={setRating}
          hoverRating={hoverRating}
          setHoverRating={setHoverRating}
          recommend={recommend}
          setRecommend={setRecommend}
          ratingLabel={displayRatingLabel}
          recommendLabel={displayRecommendLabel}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          t={t}
        />
      </DialogContent>
    </Dialog>
  )
}
