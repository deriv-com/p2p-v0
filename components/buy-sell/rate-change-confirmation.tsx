"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Drawer, DrawerContent, DrawerTitle, DrawerDescription } from "@/components/ui/drawer"
import { useIsMobile } from "@/lib/hooks/use-is-mobile"

interface RateChangeConfirmationProps {
  isOpen: boolean
  onConfirm: () => void
  onCancel: () => void
  amount: string
  accountCurrency: string
  paymentCurrency: string
  oldRate: number
  newRate: number
}

export default function RateChangeConfirmation({
  isOpen,
  onConfirm,
  onCancel,
  amount,
  accountCurrency,
  paymentCurrency,
  oldRate,
  newRate,
}: RateChangeConfirmationProps) {
  const isMobile = useIsMobile()

  const oldTotal = (Number.parseFloat(amount) * oldRate).toFixed(2)
  const newTotal = (Number.parseFloat(amount) * newRate).toFixed(2)

  const content = (
    <div className="flex flex-col gap-6">
      <div className="space-y-4">
        <p className="text-slate-600 text-base">
          You're placing an order to buy {amount} {accountCurrency} for {newTotal} {paymentCurrency}.
        </p>
        <p className="text-slate-600 text-base">
          The current rate has changed from {oldRate.toFixed(2)} to {newRate.toFixed(2)}. Do you want to proceed with
          the order?
        </p>
      </div>
      <div className="flex flex-col gap-3">
        <Button
          onClick={onConfirm}
          className="w-full bg-coral-red hover:bg-coral-red/90 text-white rounded-full h-12 text-base font-semibold"
        >
          Confirm and continue
        </Button>
        <Button
          onClick={onCancel}
          variant="outline"
          className="w-full border-2 border-slate-1200 text-slate-1200 rounded-full h-12 text-base font-semibold hover:bg-slate-50"
        >
          Cancel order
        </Button>
      </div>
    </div>
  )

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={(open) => !open && onCancel()}>
        <DrawerContent className="px-6 pb-8">
          <DrawerTitle className="text-2xl font-bold mb-6">Market rate changed</DrawerTitle>
          <DrawerDescription className="sr-only">
            The exchange rate has changed. Please confirm if you want to proceed with the order.
          </DrawerDescription>
          {content}
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-[600px] p-8 rounded-2xl">
        <DialogTitle className="text-2xl font-bold mb-6">Market rate changed</DialogTitle>
        <DialogDescription className="sr-only">
          The exchange rate has changed. Please confirm if you want to proceed with the order.
        </DialogDescription>
        {content}
      </DialogContent>
    </Dialog>
  )
}
