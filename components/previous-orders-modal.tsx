"use client"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface PreviousOrdersModalProps {
  isOpen: boolean
  onClose: () => void
}

export function PreviousOrdersModal({ isOpen, onClose }: PreviousOrdersModalProps) {
  // Using a placeholder URL for the iframe - this should be replaced with the actual URL
  const iframeUrl = process.env.NEXT_PUBLIC_CASHIER_URL || "https://example.com/previous-orders"

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-full h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={onClose} className="p-0 h-auto hover:bg-transparent">
                <span className="text-xl">←</span>
              </Button>
              <DialogTitle className="text-xl font-semibold">Previous orders</DialogTitle>
            </div>
          </div>
        </DialogHeader>
        <div className="flex-1 px-6 pb-6">
          <iframe
            src={iframeUrl}
            className="w-full h-full border-0 rounded-lg"
            title="Previous Orders"
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
