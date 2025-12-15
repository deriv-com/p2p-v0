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
  isBuy: boolean
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
  isBuy,
}: RateChangeConfirmationProps) {
  const isMobile = useIsMobile()

  const oldTotal = (Number.parseFloat(amount) * oldRate)
  const newTotal = (Number.parseFloat(amount) * newRate)
  const buySellLabel = isBuy ? "buying" : "selling"

  const content = (
    <div className="flex flex-col gap-8">
      <div className="space-y-4">
        <p className="text-grayscale-100 text-base">
        The exchange rate for your order has changed
        </p>
        <p className="text-grayscale-100 text-base">
          You’re {buySellLabel} {amount} {accountCurrency} for {newTotal} {paymentCurrency}, but the new rate is <span className="font-bold">{Number(newRate).toFixed(6)} {paymentCurrency}</span>.
        </p>
        <p className="text-grayscale-100 text-base">
        Would you like to continue with the new rate?
        </p>
      </div>
      <div className="flex flex-col gap-3">
        <Button
          onClick={onConfirm}
          className="w-full"
        >
          Confirm and continue
        </Button>
        <Button
          onClick={onCancel}
          variant="outline"
          className="w-full hover:bg-slate-50"
        >
          Cancel order
        </Button>
      </div>
    </div>
  )

  if(!isOpen) return null

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={(open) => !open && onCancel()}>
        <DrawerContent className="px-6 pb-8">
          <DrawerTitle className="text-2xl font-bold my-4">Exchange rate updated</DrawerTitle>
          {content}
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="p-[32px] sm:rounded-[32px]">
        <DialogTitle className="font-bold text-2xl mb-4">Exchange rate updated</DialogTitle>
        {content}
      </DialogContent>
    </Dialog>
  )
}
