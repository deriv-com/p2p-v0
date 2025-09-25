"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { useIsMobile } from "@/hooks/use-mobile"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"

interface DeleteConfirmationDialogProps {
  open: boolean
  onCancel: () => void
  onConfirm: () => void
}

export function DeleteConfirmationDialog({ open, onCancel, onConfirm }: DeleteConfirmationDialogProps) {
  const isMobile = useIsMobile()
  const title = "Delete ad?"
  const description = "You will not be able to restore it."
  const confirmText = "Delete"
  const cancelText = "Cancel"

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onCancel}>
        <SheetContent side="bottom" className="rounded-t-2xl">
          <SheetHeader className="pb-4">
            <SheetTitle className="text-xl font-bold text-left">{title}</SheetTitle>
            <SheetDescription className="text-grayscale-100 text-base text-left">{description}</SheetDescription>
          </SheetHeader>
          <div className="flex flex-col gap-3 mt-6">
            <Button onClick={onConfirm} className="w-full rounded-full">
              {confirmText}
            </Button>
            <Button onClick={onCancel} variant="outline" className="w-full rounded-full bg-transparent">
              {cancelText}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-md rounded-4xl">
        <DialogTitle className="font-bold">{title}</DialogTitle>
        <DialogDescription className="text-grayscale-100 text-base">{description}</DialogDescription>
        <DialogFooter className="sm:space-x-0 gap-2 sm:flex-col">
          <Button onClick={onConfirm} className="w-full rounded-full">
            {confirmText}
          </Button>
          <Button onClick={onCancel} variant="outline" className="w-full rounded-full bg-transparent">
            {cancelText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
