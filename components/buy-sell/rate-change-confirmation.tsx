"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Drawer, DrawerContent, DrawerTitle, DrawerDescription } from "@/components/ui/drawer"
import { useIsMobile } from "@/lib/hooks/use-is-mobile"
import { useTranslations } from "@/lib/i18n/use-translations"

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
  const { t } = useTranslations()
  const isMobile = useIsMobile()

  const oldTotal = (Number.parseFloat(amount) * oldRate)
  const newTotal = (Number.parseFloat(amount) * newRate)
  const action = isBuy ? t("rateChange.selling") : t("rateChange.buying")

  const content = (
    <div className="flex flex-col gap-8">
      <div className="space-y-4">
        <p className="text-grayscale-100 text-base">
          {t("rateChange.description")}
        </p>
        <p className="text-grayscale-100 text-base">
          {t("rateChange.message", {
            action,
            amount,
            accountCurrency,
            newTotal: newTotal?.toFixed(2),
            paymentCurrency,
            newRate: newRate?.toFixed(6)
          })}{" "}
        </p>
        <p className="text-grayscale-100 text-base">
          {t("rateChange.question")}
        </p>
      </div>
      <div className="flex flex-col gap-3">
        <Button
          onClick={onConfirm}
          className="w-full"
        >
          {t("rateChange.confirmButton")}
        </Button>
        <Button
          onClick={onCancel}
          variant="outline"
          className="w-full hover:bg-slate-50 bg-transparent"
        >
          {t("rateChange.cancelButton")}
        </Button>
      </div>
    </div>
  )

  if(!isOpen) return null

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={(open) => !open && onCancel()}>
        <DrawerContent className="px-6 pb-8">
          <DrawerTitle className="text-2xl font-bold my-4">{t("rateChange.title")}</DrawerTitle>
          {content}
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="p-[32px] sm:rounded-[32px]">
        <DialogTitle className="font-bold text-2xl mb-4">{t("rateChange.title")}</DialogTitle>
        {content}
      </DialogContent>
    </Dialog>
  )
}
