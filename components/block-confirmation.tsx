"use client"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { useIsMobile } from "@/components/ui/use-mobile"
import { X } from "lucide-react"

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
        <h2 className="text-2xl font-bold text-slate-1200">Block {nickname}?</h2>
        <p className="text-grayscale-100 text-base">
          You won't see {nickname}'s ads, and they can't place orders on yours.
        </p>
      </div>

      <div className="space-y-3">
        <Button
          onClick={onConfirm}
          disabled={isLoading}
          className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3 rounded-full"
        >
          {isLoading ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent mr-2"></div>
          ) : null}
          Block
        </Button>
        <Button
          onClick={onClose}
          variant="outline"
          disabled={isLoading}
          className="w-full border-gray-300 text-gray-700 font-semibold py-3 rounded-full hover:bg-gray-50 bg-transparent"
        >
          Cancel
        </Button>
      </div>
    </div>
  )

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent side="bottom" className="rounded-t-lg">
          <div className="relative">
            <button
              onClick={onClose}
              className="absolute right-0 top-0 p-2 hover:bg-gray-100 rounded-full"
              disabled={isLoading}
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
            {content}
          </div>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <div className="relative">
          <button
            onClick={onClose}
            className="absolute right-0 top-0 p-2 hover:bg-gray-100 rounded-full"
            disabled={isLoading}
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
          {content}
        </div>
      </DialogContent>
    </Dialog>
  )
}
