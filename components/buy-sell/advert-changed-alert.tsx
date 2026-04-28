"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Drawer, DrawerContent, DrawerTitle } from "@/components/ui/drawer"
import { useIsMobile } from "@/lib/hooks/use-is-mobile"

interface AdvertChangedAlertProps {
  isOpen: boolean
  onReview: () => void
}

export default function AdvertChangedAlert({ isOpen, onReview }: AdvertChangedAlertProps) {
  const isMobile = useIsMobile()

  const content = (
    <div className="flex flex-col gap-8">
      <p className="text-grayscale-100 text-base">
        The ad details changed while you were placing your order. Review the new details to continue.
      </p>
      <Button onClick={onReview} className="w-full">
        Review changes
      </Button>
    </div>
  )

  if (!isOpen) return null

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={(open) => !open && onReview()}>
        <DrawerContent className="px-6 pb-8">
          <DrawerTitle className="text-2xl font-bold my-4">Ad updated</DrawerTitle>
          {content}
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onReview()}>
      <DialogContent className="p-[32px] sm:rounded-[32px]">
        <DialogTitle className="font-bold text-2xl mb-4">Ad updated</DialogTitle>
        {content}
      </DialogContent>
    </Dialog>
  )
}
