"use client"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { useIsMobile } from "@/components/ui/use-mobile"

interface BlockConfirmationProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  nickname: string
  isLoading?: boolean
}

export default function BlockConfirmation({
  isOpen,
  onClose,
  onConfirm,
  nickname,
  isLoading = false,
}: BlockConfirmationProps) {
  const isMobile = useIsMobile()

  const content = (
    <div className="space-y-6">
      <div className="space-y-4">
        <p className="text-grayscale-100 text-base">
          You won't see {nickname}'s ads, and they can't place orders on yours.
        </p>
      </div>

      <div className="space-y-3">
        <Button
          onClick={onConfirm}
          disabled={isLoading}
          className="w-full rounded-full"
        >
          Block
        </Button>
        <Button
          onClick={onClose}
          variant="outline"
          disabled={isLoading}
          className="w-full rounded-full"
        >
          Cancel
        </Button>
      </div>
    </div>
  )

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent side="bottom" className="rounded-t-2xl">
          <SheetHeader className="pb-4">
            <SheetTitle className="text-xl font-bold text-left">Block {nickname}?</SheetTitle>
          </SheetHeader>
          {content}
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md rounded-4xl">
        <DialogTitle className="font-bold">Block {nickname}?</DialogTitle>
        <div className="relative">
          {content}
        </div>
      </DialogContent>
    </Dialog>
  )
}
