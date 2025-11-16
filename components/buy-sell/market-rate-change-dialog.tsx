"use client"

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Drawer, DrawerContent, DrawerTitle } from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { useIsMobile } from "@/lib/hooks/use-is-mobile"

interface MarketRateChangeDialogProps {
  isOpen: boolean
  onConfirm: () => void
  onCancel: () => void
  amount: string
  accountCurrency: string
  paymentCurrency: string
  oldRate: number
  newRate: number
  orderType: "buy" | "sell"
}

export function MarketRateChangeDialog({
  isOpen,
  onConfirm,
  onCancel,
  amount,
  accountCurrency,
  paymentCurrency,
  oldRate,
  newRate,
  orderType,
}: MarketRateChangeDialogProps) {
  const isMobile = useIsMobile()

  const oldTotal = (parseFloat(amount) * oldRate).toFixed(2)
  const newTotal = (parseFloat(amount) * newRate).toFixed(2)

  const content = (
    <div className="flex flex-col gap-6">
      <div className="space-y-4">
        <p className="text-slate-600 text-base leading-relaxed">
          You're placing an order to {orderType} {amount} {accountCurrency} for {oldTotal} {paymentCurrency}.
        </p>
        <p className="text-slate-600 text-base leading-relaxed">
          The current rate has changed from {oldRate.toFixed(2)} to {newTotal}. Do you want to proceed with the order?
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <Button
          onClick={onConfirm}
          className="w-full bg-[#E86459] hover:bg-[#d94d42] text-white font-semibold rounded-full h-12"
        >
          Confirm and continue
        </Button>
        <Button
          onClick={onCancel}
          variant="outline"
          className="w-full border-2 border-black text-black font-semibold rounded-full h-12 hover:bg-gray-50"
        >
          Cancel order
        </Button>
      </div>
    </div>
  )

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={(open) => !open && onCancel()}>
        <DrawerContent className="px-6 pb-6">
          <DrawerTitle className="text-2xl font-bold mb-6">Market rate changed</DrawerTitle>
          {content}
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-w-[600px] rounded-3xl p-8">
        <DialogTitle className="text-3xl font-bold mb-6">Market rate changed</DialogTitle>
        {content}
      </DialogContent>
    </Dialog>
  )
}
